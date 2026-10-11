import { db } from "../db";
import { SurveyStatus } from "@prisma/client";
import QRCode from "qrcode";

export interface PublishResult {
  id: string;
  status: SurveyStatus;
  slug: string;
  shortCode: string;
  publicUrl: string;
  qrUrl: string;
}

function getBaseAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://encuesta.intt.gob.ve";
}

import { getLocalSurveyById, saveLocalSurvey } from "./local-survey-store";

/**
 * Publica una encuesta previa validación de existencia de preguntas.
 */
export async function publishSurvey(
  surveyId: string,
  actorId: string,
  isAdmin = false
): Promise<{ success: boolean; result?: PublishResult; conflict?: string; notFound?: boolean; forbidden?: boolean }> {
  try {
    const survey = await db.survey.findUnique({
      where: { id: surveyId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!survey) return { success: false, notFound: true };

    if (survey.creatorId !== actorId && !isAdmin) {
      return { success: false, forbidden: true };
    }

    // Regla Gherkin: La encuesta debe tener al menos 1 pregunta
    if (survey._count.questions === 0) {
      return {
        success: false,
        conflict: "No se puede publicar una encuesta sin al menos una pregunta configurada.",
      };
    }

    if (survey.status === "archived") {
      return {
        success: false,
        conflict: "Una encuesta archivada no puede publicarse directamente.",
      };
    }

    const updated = await db.survey.update({
      where: { id: surveyId },
      data: {
        status: "published",
      },
      select: {
        id: true,
        status: true,
        slug: true,
        shortCode: true,
      },
    });

    const baseUrl = getBaseAppUrl();
    const publicUrl = `${baseUrl}/s/${updated.shortCode}`;
    const qrUrl = `${baseUrl}/api/v1/surveys/${updated.id}/qr`;

    // Registrar auditoría
    await db.auditLog
      .create({
        data: {
          actorId,
          action: "survey.published",
          entityType: "survey",
          entityId: surveyId,
          payload: {
            previousStatus: survey.status,
            newStatus: "published",
            publicUrl,
            shortCode: updated.shortCode,
          },
        },
      })
      .catch(() => {});

    return {
      success: true,
      result: {
        id: updated.id,
        status: updated.status,
        slug: updated.slug,
        shortCode: updated.shortCode,
        publicUrl,
        qrUrl,
      },
    };
  } catch (err) {
    console.warn("[deployment-service] Fallback a local store para publishSurvey:", err);
    const local = getLocalSurveyById(surveyId);
    if (!local) return { success: false, notFound: true };
    if (local._count.questions === 0) {
      return {
        success: false,
        conflict: "No se puede publicar una encuesta sin al menos una pregunta configurada.",
      };
    }
    local.status = "published";
    local.updatedAt = new Date().toISOString();
    saveLocalSurvey(local);

    const baseUrl = getBaseAppUrl();
    return {
      success: true,
      result: {
        id: local.id,
        status: "published",
        slug: local.slug,
        shortCode: local.shortCode,
        publicUrl: `${baseUrl}/s/${local.shortCode}`,
        qrUrl: `${baseUrl}/api/v1/surveys/${local.id}/qr`,
      },
    };
  }
}

/**
 * Cierra una encuesta manualmente o por límite/tiempo alcanzado.
 */
export async function closeSurvey(
  surveyId: string,
  actorId: string,
  isAdmin = false,
  reason = "manual"
) {
  const survey = await db.survey.findUnique({ where: { id: surveyId } });
  if (!survey) return { notFound: true };
  if (survey.creatorId !== actorId && !isAdmin) return { forbidden: true };

  const updated = await db.survey.update({
    where: { id: surveyId },
    data: { status: "closed" },
  });

  await db.auditLog.create({
    data: {
      actorId,
      action: "survey.closed",
      entityType: "survey",
      entityId: surveyId,
      payload: { reason, previousStatus: survey.status },
    },
  });

  return { success: true, survey: updated };
}

/**
 * Archiva una encuesta.
 */
export async function archiveSurvey(
  surveyId: string,
  actorId: string,
  isAdmin = false
) {
  const survey = await db.survey.findUnique({ where: { id: surveyId } });
  if (!survey) return { notFound: true };
  if (survey.creatorId !== actorId && !isAdmin) return { forbidden: true };

  const updated = await db.survey.update({
    where: { id: surveyId },
    data: { status: "archived" },
  });

  await db.auditLog.create({
    data: {
      actorId,
      action: "survey.archived",
      entityType: "survey",
      entityId: surveyId,
      payload: { previousStatus: survey.status },
    },
  });

  return { success: true, survey: updated };
}

/**
 * Genera código QR en formato SVG.
 */
export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#1c2454", // INTT Navy
      light: "#ffffff",
    },
  });
}

/**
 * Genera código QR en formato PNG (Buffer).
 */
export async function generateQrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    type: "png",
    margin: 2,
    width: 512,
    color: {
      dark: "#1c2454",
      light: "#ffffff",
    },
  });
}

/**
 * Evalúa si una encuesta se encuentra activa temporalmente y dentro de su cuota.
 */
export function evaluateSurveyAvailability(params: {
  status: SurveyStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  maxResponses: number | null;
  currentResponsesCount: number;
}): { available: boolean; reason?: "not_published" | "not_started" | "expired" | "quota_reached" } {
  const { status, startsAt, endsAt, maxResponses, currentResponsesCount } = params;

  if (status !== "published") {
    return { available: false, reason: "not_published" };
  }

  const now = new Date();

  if (startsAt && now < startsAt) {
    return { available: false, reason: "not_started" };
  }

  if (endsAt && now > endsAt) {
    return { available: false, reason: "expired" };
  }

  if (maxResponses && currentResponsesCount >= maxResponses) {
    return { available: false, reason: "quota_reached" };
  }

  return { available: true };
}
