import { db } from "../db";
import { Prisma } from "@prisma/client";
import { verifyRespondentSessionToken } from "./eligibility-service";
import { hashClientIp } from "./ip-hash";

export interface SubmittedAnswer {
  question_id: string;
  value: string | number | string[];
}

export interface SubmitResponseInput {
  sessionToken: string;
  turnstileToken?: string;
  answers: SubmittedAnswer[];
  meta?: {
    duration_seconds?: number;
    channel?: string;
    device?: Record<string, unknown>;
  };
  clientIp: string;
}

export interface ValidationIssue {
  questionId: string;
  field: string;
  message: string;
}

/**
 * Valida todas las respuestas enviadas contra el esquema de preguntas de la encuesta (US-4.5).
 */
export function validateAnswersAgainstQuestions(
  questions: Array<{
    id: string;
    type: string;
    label: string;
    required: boolean;
    validationRules: unknown;
    options: Array<{ value: string; label: string }>;
  }>,
  submittedAnswers: SubmittedAnswer[]
): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const answerMap = new Map<string, SubmittedAnswer>();

  for (const ans of submittedAnswers) {
    answerMap.set(ans.question_id, ans);
  }

  for (const q of questions) {
    const answer = answerMap.get(q.id);
    const value = answer?.value;

    // 1. Validar preguntas requeridas
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (q.required && isEmpty) {
      issues.push({
        questionId: q.id,
        field: "required",
        message: `La pregunta '${q.label}' es obligatoria.`,
      });
      continue;
    }

    if (isEmpty) continue; // Si no es obligatoria y está vacía, no se validan reglas adicionales

    const rules = (q.validationRules as Record<string, unknown>) || {};

    // 2. Validación por tipo de pregunta
    switch (q.type) {
      case "single_choice":
      case "dropdown": {
        const strVal = String(value).trim();
        const validValues = q.options.map((o) => o.value);
        if (!validValues.includes(strVal)) {
          issues.push({
            questionId: q.id,
            field: "option_value",
            message: `El valor seleccionado no es una opción válida para la pregunta '${q.label}'.`,
          });
        }
        break;
      }

      case "multi_choice": {
        const arr = Array.isArray(value) ? value : [value];
        const validValues = new Set(q.options.map((o) => o.value));
        const invalid = arr.some((v) => !validValues.has(String(v)));
        if (invalid) {
          issues.push({
            questionId: q.id,
            field: "multi_options",
            message: `Una o más opciones seleccionadas no son válidas para la pregunta '${q.label}'.`,
          });
        }
        break;
      }

      case "scale":
      case "rating": {
        const num = Number(value);
        if (isNaN(num)) {
          issues.push({
            questionId: q.id,
            field: "numeric",
            message: `La respuesta a '${q.label}' debe ser un valor numérico.`,
          });
          break;
        }

        const min = typeof rules.min === "number" ? rules.min : q.type === "rating" ? 1 : 1;
        const max = typeof rules.max === "number" ? rules.max : q.type === "rating" ? 5 : 10;

        if (num < min || num > max) {
          issues.push({
            questionId: q.id,
            field: "range",
            message: `El valor ${num} está fuera del rango permitido (${min} a ${max}) para '${q.label}'.`,
          });
        }
        break;
      }

      case "short_text":
      case "long_text": {
        const str = String(value);
        if (typeof rules.minLength === "number" && str.length < rules.minLength) {
          issues.push({
            questionId: q.id,
            field: "min_length",
            message: `La longitud mínima para '${q.label}' es de ${rules.minLength} caracteres.`,
          });
        }
        if (typeof rules.maxLength === "number" && str.length > rules.maxLength) {
          issues.push({
            questionId: q.id,
            field: "max_length",
            message: `La longitud máxima para '${q.label}' es de ${rules.maxLength} caracteres.`,
          });
        }
        if (typeof rules.pattern === "string") {
          try {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(str)) {
              issues.push({
                questionId: q.id,
                field: "pattern",
                message: `El formato de respuesta para '${q.label}' no coincide con el patrón requerido.`,
              });
            }
          } catch {
            // Ignorar patrones regex inválidos
          }
        }
        break;
      }

      case "date": {
        const dateVal = new Date(String(value));
        if (isNaN(dateVal.getTime())) {
          issues.push({
            questionId: q.id,
            field: "date_format",
            message: `El formato de fecha no es válido para '${q.label}'.`,
          });
        }
        break;
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Persistencia ACID transaccional de respuestas (US-4.1).
 */
export async function submitSurveyResponse(input: SubmitResponseInput) {
  const session = verifyRespondentSessionToken(input.sessionToken);
  if (!session) {
    return {
      statusHttp: 401,
      title: "Sesión Inválida o Expirada",
      detail: "El token de sesión ha expirado o no es válido. Vuelve a abrir la encuesta.",
    };
  }

  const { surveyId, respondentToken, invitationId, emailHash } = session;

  // 1. Obtener la encuesta y sus preguntas
  const survey = await db.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: {
        include: { options: true },
      },
      _count: {
        select: { responses: true },
      },
    },
  });

  if (!survey) {
    return {
      statusHttp: 404,
      title: "Encuesta No Encontrada",
      detail: "La encuesta a la que intentas responder no existe.",
    };
  }

  if (survey.status !== "published") {
    return {
      statusHttp: 410,
      title: "Encuesta No Disponible",
      detail: "La encuesta ya no se encuentra activa para recibir respuestas.",
    };
  }

  // 2. Comprobar anti-duplicados (US-3.2)
  if (respondentToken) {
    const existing = await db.response.findFirst({
      where: {
        surveyId,
        respondentToken,
      },
      select: { id: true },
    });

    if (existing) {
      return {
        statusHttp: 409,
        title: "Respuesta Ya Registrada",
        detail: "Esta respuesta ya fue procesada anteriormente.",
      };
    }
  }

  // 3. Validación server-side estricta (US-4.5)
  const validation = validateAnswersAgainstQuestions(
    survey.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      required: q.required,
      validationRules: q.validationRules,
      options: q.options.map((o) => ({ value: o.value, label: o.label })),
    })),
    input.answers
  );

  if (!validation.valid) {
    return {
      statusHttp: 422,
      title: "Validación de Respuestas Fallida",
      detail: "Una o más respuestas no cumplen con las reglas establecidas por la encuesta.",
      errors: validation.issues,
    };
  }

  const ipHash = hashClientIp(input.clientIp);

  // 4. Ejecutar transacción ACID de persistencia
  const result = await db.$transaction(async (tx) => {
    // A. Crear la cabecera de la respuesta
    const responseRecord = await tx.response.create({
      data: {
        surveyId,
        respondentToken,
        emailHash,
        status: "completed",
        submittedAt: new Date(),
        device: (input.meta?.device as unknown as Prisma.InputJsonValue) || {},
        channel: input.meta?.channel || "link",
        ipHash,
      },
    });

    // B. Preparar las respuestas normalizadas
    const answersData: Prisma.AnswerCreateManyInput[] = [];

    for (const ans of input.answers) {
      const q = survey.questions.find((question) => question.id === ans.question_id);
      if (!q) continue;

      let valueText: string | null = null;
      let valueNumeric: number | null = null;
      let valueOptions: Prisma.InputJsonValue | undefined = undefined;

      if (q.type === "scale" || q.type === "rating") {
        valueNumeric = Number(ans.value);
      } else if (q.type === "multi_choice") {
        valueOptions = (Array.isArray(ans.value) ? ans.value : [ans.value]) as Prisma.InputJsonValue;
      } else {
        valueText = String(ans.value);
      }

      answersData.push({
        responseId: responseRecord.id,
        questionId: q.id,
        valueText,
        valueNumeric,
        valueOptions,
      });
    }

    if (answersData.length > 0) {
      await tx.answer.createMany({
        data: answersData,
      });
    }

    // C. Si fue por invitación, marcar el token como consumido atómicamente
    if (invitationId) {
      await tx.invitation.update({
        where: { id: invitationId },
        data: {
          status: "used",
          usedAt: new Date(),
        },
      });
    }

    // D. Control de límite máximo de respuestas (cierre automático por cuota)
    const newTotal = survey._count.responses + 1;
    let autoClosed = false;

    if (survey.maxResponses && newTotal >= survey.maxResponses) {
      await tx.survey.update({
        where: { id: surveyId },
        data: { status: "closed" },
      });
      autoClosed = true;
    }

    return { responseRecord, autoClosed };
  });

  return {
    statusHttp: 201,
    responseId: result.responseRecord.id,
    submittedAt: result.responseRecord.submittedAt,
    autoClosed: result.autoClosed,
  };
}
