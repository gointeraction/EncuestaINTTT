import { db } from "../db";
import { AccessMode, SurveyStatus } from "@prisma/client";
import { createHmac, timingSafeEqual, randomUUID, createHash } from "crypto";
import { evaluateSurveyAvailability } from "./deployment-service";

const SESSION_TTL_SECONDS = 60 * 60 * 2; // 2 horas de validez para responder

function getSessionSecret(): string {
  return process.env.AUTH_SECRET || process.env.ADMIN_SECRET || "intt_session_token_secret_2026";
}

export interface RespondentSessionPayload {
  surveyId: string;
  accessMode: AccessMode;
  respondentToken: string;
  invitationId?: string;
  emailHash?: string;
  iat: number;
  exp: number;
}

/**
 * Emite un token de sesión criptográfico para el encuestado elegible.
 */
export function signRespondentSessionToken(
  payload: Omit<RespondentSessionPayload, "iat" | "exp">,
  ttlSeconds = SESSION_TTL_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const data: RespondentSessionPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  };

  const encodedData = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(encodedData)
    .digest("base64url");

  return `${encodedData}.${signature}`;
}

/**
 * Verifica el token de sesión de un encuestado.
 */
export function verifyRespondentSessionToken(token: string): RespondentSessionPayload | null {
  try {
    const [encodedData, signature] = token.split(".");
    if (!encodedData || !signature) return null;

    const expectedSig = createHmac("sha256", getSessionSecret())
      .update(encodedData)
      .digest("base64url");

    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload: RespondentSessionPayload = JSON.parse(
      Buffer.from(encodedData, "base64url").toString("utf-8")
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Normaliza y hashea un correo para validaciones anti-duplicados (US-3.2).
 */
export function hashEmail(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export interface EligibilityResult {
  eligible: boolean;
  statusHttp?: number;
  title?: string;
  reason?: string;
  sessionToken?: string;
  survey?: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    consentText: string | null;
    allowPartial: boolean;
    accessMode: AccessMode;
  };
  questions?: Array<{
    id: string;
    sectionId: string | null;
    type: string;
    label: string;
    required: boolean;
    position: number;
    validationRules: unknown;
    branchingRules: unknown;
    options: Array<{
      id: string;
      label: string;
      value: string;
      position: number;
    }>;
  }>;
}

/**
 * Motor central de evaluación de elegibilidad (US-3.5).
 * Valida estado, fechas, límite de respuestas, modo de acceso y anti-duplicados ANTES de entregar las preguntas.
 */
export async function evaluateRespondentEligibility(params: {
  slugOrCode: string;
  invitationToken?: string | null;
  existingRespondentToken?: string | null;
  verifiedEmail?: string | null;
}): Promise<EligibilityResult> {
  const { slugOrCode, invitationToken, existingRespondentToken, verifiedEmail } = params;

  // 1. Buscar la encuesta por slug o por shortCode
  const survey = await db.survey.findFirst({
    where: {
      OR: [{ slug: slugOrCode }, { shortCode: slugOrCode }],
    },
    include: {
      _count: {
        select: { responses: true },
      },
    },
  });

  if (!survey) {
    return {
      eligible: false,
      statusHttp: 404,
      title: "Encuesta No Encontrada",
      reason: "El enlace no corresponde a ninguna encuesta registrada.",
    };
  }

  // 2. Evaluar disponibilidad temporal y de cuota (T11 & T12)
  const availability = evaluateSurveyAvailability({
    status: survey.status as SurveyStatus,
    startsAt: survey.startsAt,
    endsAt: survey.endsAt,
    maxResponses: survey.maxResponses,
    currentResponsesCount: survey._count.responses,
  });

  if (!availability.available) {
    if (availability.reason === "not_published") {
      return {
        eligible: false,
        statusHttp: 404,
        title: "Encuesta No Disponible",
        reason: "Esta encuesta aún se encuentra en borrador y no está disponible para el público.",
      };
    }
    if (availability.reason === "not_started") {
      return {
        eligible: false,
        statusHttp: 410,
        title: "Encuesta No Iniciada",
        reason: `Esta encuesta abrirá el ${survey.startsAt?.toISOString()}.`,
      };
    }
    if (availability.reason === "expired") {
      return {
        eligible: false,
        statusHttp: 410,
        title: "Encuesta Expirada",
        reason: "El plazo programado para responder esta encuesta ha concluido.",
      };
    }
    if (availability.reason === "quota_reached") {
      return {
        eligible: false,
        statusHttp: 410,
        title: "Límite Alcanzado",
        reason: "Esta encuesta ha alcanzado el límite máximo de respuestas permitido.",
      };
    }
  }

  // 3. Evaluar Modo de Acceso (US-3.1 y US-3.2)
  let invitationId: string | undefined;
  let emailHash: string | undefined;

  switch (survey.accessMode) {
    case "invitation_token": {
      if (!invitationToken) {
        return {
          eligible: false,
          statusHttp: 403,
          title: "Acceso Restringido",
          reason: "Esta encuesta requiere un enlace de invitación personal válido.",
        };
      }

      const invitation = await db.invitation.findUnique({
        where: { token: invitationToken },
      });

      if (!invitation || invitation.surveyId !== survey.id) {
        return {
          eligible: false,
          statusHttp: 403,
          title: "Invitación Inválida",
          reason: "El token de invitación no es válido para esta encuesta.",
        };
      }

      if (invitation.status === "used") {
        return {
          eligible: false,
          statusHttp: 409,
          title: "Encuesta Ya Respondida",
          reason: "Esta encuesta ya fue respondida con este enlace de invitación.",
        };
      }

      if (invitation.status === "expired") {
        return {
          eligible: false,
          statusHttp: 410,
          title: "Invitación Expirada",
          reason: "Este enlace de invitación ha expirado.",
        };
      }

      invitationId = invitation.id;
      break;
    }

    case "email_verified":
    case "whitelist": {
      if (!verifiedEmail) {
        return {
          eligible: false,
          statusHttp: 403,
          title: "Verificación de Correo Requerida",
          reason: "Debes validar tu dirección de correo electrónico para acceder a esta encuesta.",
        };
      }

      emailHash = hashEmail(verifiedEmail);

      // Comprobar si este correo ya respondió la encuesta
      const existingResponse = await db.response.findFirst({
        where: {
          surveyId: survey.id,
          emailHash,
        },
        select: { id: true },
      });

      if (existingResponse) {
        return {
          eligible: false,
          statusHttp: 409,
          title: "Encuesta Ya Respondida",
          reason: "Ya existe una respuesta registrada para este correo electrónico en esta encuesta.",
        };
      }
      break;
    }

    case "public_anonymous": {
      if (existingRespondentToken) {
        const existing = await db.response.findFirst({
          where: {
            surveyId: survey.id,
            respondentToken: existingRespondentToken,
          },
          select: { id: true },
        });

        if (existing) {
          return {
            eligible: false,
            statusHttp: 409,
            title: "Encuesta Ya Respondida",
            reason: "Tu dispositivo ya ha enviado una respuesta a esta encuesta.",
          };
        }
      }
      break;
    }
  }

  // 4. Si es elegible, generar el respondentToken y token de sesión seguro
  const respondentToken = existingRespondentToken || randomUUID();
  const sessionToken = signRespondentSessionToken({
    surveyId: survey.id,
    accessMode: survey.accessMode as AccessMode,
    respondentToken,
    invitationId,
    emailHash,
  });

  // 5. Cargar las preguntas ordenadas (solo cuando la elegibilidad es confirmada)
  const questions = await db.question.findMany({
    where: { surveyId: survey.id },
    orderBy: { position: "asc" },
    include: {
      options: {
        orderBy: { position: "asc" },
      },
    },
  });

  return {
    eligible: true,
    sessionToken,
    survey: {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      slug: survey.slug,
      consentText: survey.consentText,
      allowPartial: survey.allowPartial,
      accessMode: survey.accessMode as AccessMode,
    },
    questions: questions.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      type: q.type,
      label: q.label,
      required: q.required,
      position: q.position,
      validationRules: q.validationRules,
      branchingRules: q.branchingRules,
      options: q.options.map((o) => ({
        id: o.id,
        label: o.label,
        value: o.value,
        position: o.position,
      })),
    })),
  };
}
