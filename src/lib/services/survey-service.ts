import { db } from "../db";
import { AccessMode, SurveyStatus } from "@prisma/client";
import { slugify, generateShortCode } from "./slug";

export interface CreateSurveyInput {
  title: string;
  description?: string;
  accessMode?: AccessMode;
  allowPartial?: boolean;
  maxResponses?: number;
  startsAt?: string | Date;
  endsAt?: string | Date;
  consentText?: string;
}

export interface UpdateSurveyInput {
  title?: string;
  description?: string;
  status?: SurveyStatus;
  accessMode?: AccessMode;
  allowPartial?: boolean;
  maxResponses?: number | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  consentText?: string | null;
}

import {
  loadLocalSurveys,
  saveLocalSurvey,
  getLocalSurveyById,
  deleteLocalSurvey,
  LocalSurvey,
} from "./local-survey-store";

/**
 * Genera un slug único garantizado en la base de datos o fallback.
 */
async function generateUniqueSlug(baseTitle: string): Promise<string> {
  const baseSlug = slugify(baseTitle) || "encuesta";
  try {
    let slug = baseSlug;
    let attempt = 0;

    while (true) {
      const existing = await db.survey.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) {
        return slug;
      }

      attempt++;
      slug = `${baseSlug}-${generateShortCode(4).toLowerCase()}`;
      if (attempt > 10) {
        return `${baseSlug}-${Date.now().toString(36)}`;
      }
    }
  } catch {
    return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
  }
}

/**
 * Genera un código corto único garantizado.
 */
async function generateUniqueShortCode(): Promise<string> {
  try {
    let attempt = 0;
    while (attempt < 10) {
      const shortCode = generateShortCode(6);
      const existing = await db.survey.findUnique({
        where: { shortCode },
        select: { id: true },
      });

      if (!existing) {
        return shortCode;
      }
      attempt++;
    }
    return generateShortCode(8);
  } catch {
    return generateShortCode(6);
  }
}

/**
 * Crea una nueva encuesta asociada al creador.
 */
export async function createSurvey(creatorId: string, input: CreateSurveyInput) {
  const slug = await generateUniqueSlug(input.title);
  const shortCode = await generateUniqueShortCode();

  try {
    const survey = await db.survey.create({
      data: {
        creatorId,
        title: input.title.trim(),
        description: input.description?.trim(),
        slug,
        shortCode,
        status: "draft",
        accessMode: input.accessMode || "public_anonymous",
        allowPartial: input.allowPartial ?? false,
        maxResponses: input.maxResponses ? Number(input.maxResponses) : null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        consentText: input.consentText?.trim(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { questions: true, responses: true },
        },
      },
    });

    // Registrar auditoría
    await db.auditLog
      .create({
        data: {
          actorId: creatorId,
          action: "survey.created",
          entityType: "survey",
          entityId: survey.id,
          payload: {
            title: survey.title,
            slug: survey.slug,
            status: survey.status,
          },
        },
      })
      .catch(() => {});

    return survey;
  } catch (dbErr) {
    console.warn("[survey-service] Fallback a almacenamiento local para createSurvey:", dbErr);
    const localSurvey: LocalSurvey = {
      id: "survey-" + Date.now(),
      creatorId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      slug,
      shortCode,
      status: "draft",
      accessMode: input.accessMode || "public_anonymous",
      allowPartial: input.allowPartial ?? false,
      maxResponses: input.maxResponses ? Number(input.maxResponses) : null,
      startsAt: input.startsAt ? new Date(input.startsAt).toISOString() : null,
      endsAt: input.endsAt ? new Date(input.endsAt).toISOString() : null,
      consentText: input.consentText?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: creatorId,
        name: "Administrador General",
        email: "admin@intt.gob.ve",
      },
      _count: {
        questions: 0,
        responses: 0,
      },
      questions: [],
    };
    return saveLocalSurvey(localSurvey);
  }
}

/**
 * Lista encuestas con filtros opcionales de creador, estado y paginación.
 */
export async function listSurveys(params: {
  creatorId?: string;
  status?: SurveyStatus;
  limit?: number;
}) {
  try {
    const limit = Math.min(Math.max(params.limit || 20, 1), 100);

    const where: {
      creatorId?: string;
      status?: SurveyStatus;
    } = {};

    if (params.creatorId) where.creatorId = params.creatorId;
    if (params.status) where.status = params.status;

    return await db.survey.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { questions: true, responses: true },
        },
      },
    });
  } catch (err) {
    console.warn("[survey-service] PostgreSQL no disponible. Usando local-survey-store para listSurveys");
    let surveys = loadLocalSurveys();
    if (params.status) {
      surveys = surveys.filter((s) => s.status === params.status);
    }
    return surveys;
  }
}

/**
 * Obtiene el detalle completo de una encuesta por su ID.
 */
export async function getSurveyById(id: string) {
  try {
    return await db.survey.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        questions: {
          orderBy: { position: "asc" },
          include: {
            options: {
              orderBy: { position: "asc" },
            },
          },
        },
        _count: {
          select: { responses: true, questions: true, invitations: true },
        },
      },
    });
  } catch (err) {
    console.warn("[survey-service] Usando local-survey-store para getSurveyById");
    return getLocalSurveyById(id);
  }
}

/**
 * Actualiza los datos o estado de una encuesta existente.
 */
export async function updateSurvey(id: string, input: UpdateSurveyInput, actorId: string) {
  try {
    const existing = await db.survey.findUnique({ where: { id } });
    if (!existing) return null;

    const dataToUpdate: Record<string, unknown> = {};

    if (input.title !== undefined) {
      dataToUpdate.title = input.title.trim();
    }
    if (input.description !== undefined) {
      dataToUpdate.description = input.description?.trim() || null;
    }
    if (input.status !== undefined) {
      dataToUpdate.status = input.status;
    }
    if (input.accessMode !== undefined) {
      dataToUpdate.accessMode = input.accessMode;
    }
    if (input.allowPartial !== undefined) {
      dataToUpdate.allowPartial = input.allowPartial;
    }
    if (input.maxResponses !== undefined) {
      dataToUpdate.maxResponses = input.maxResponses ? Number(input.maxResponses) : null;
    }
    if (input.startsAt !== undefined) {
      dataToUpdate.startsAt = input.startsAt ? new Date(input.startsAt) : null;
    }
    if (input.endsAt !== undefined) {
      dataToUpdate.endsAt = input.endsAt ? new Date(input.endsAt) : null;
    }
    if (input.consentText !== undefined) {
      dataToUpdate.consentText = input.consentText?.trim() || null;
    }

    const updated = await db.survey.update({
      where: { id },
      data: dataToUpdate,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { questions: true, responses: true },
        },
      },
    });

    // Registrar auditoría del cambio
    await db.auditLog
      .create({
        data: {
          actorId,
          action: "survey.updated",
          entityType: "survey",
          entityId: id,
          payload: {
            changes: dataToUpdate,
            previousStatus: existing.status,
            newStatus: updated.status,
          },
        },
      })
      .catch(() => {});

    return updated;
  } catch (err) {
    console.warn("[survey-service] Fallback a local store para updateSurvey:", err);
    const local = getLocalSurveyById(id);
    if (!local) return null;
    if (input.title !== undefined) local.title = input.title.trim();
    if (input.description !== undefined) local.description = input.description?.trim() || null;
    if (input.status !== undefined) local.status = input.status as any;
    if (input.accessMode !== undefined) local.accessMode = input.accessMode;
    if (input.allowPartial !== undefined) local.allowPartial = input.allowPartial;
    if (input.maxResponses !== undefined) local.maxResponses = input.maxResponses ? Number(input.maxResponses) : null;
    if (input.consentText !== undefined) local.consentText = input.consentText?.trim() || null;
    local.updatedAt = new Date().toISOString();
    return saveLocalSurvey(local);
  }
}

/**
 * Elimina una encuesta (solo permitido si está en borrador o si el actor es admin).
 */
export async function deleteSurvey(id: string, actorId: string, isAdmin = false) {
  try {
    const existing = await db.survey.findUnique({ where: { id } });
    if (!existing) return { success: false, notFound: true };

    if (existing.status !== "draft" && !isAdmin) {
      return {
        success: false,
        conflict: true,
        reason: "Solo las encuestas en estado 'draft' pueden ser eliminadas. Para otras, use el estado 'archived'.",
      };
    }

    await db.survey.delete({ where: { id } });

    await db.auditLog
      .create({
        data: {
          actorId,
          action: "survey.deleted",
          entityType: "survey",
          entityId: id,
          payload: {
            title: existing.title,
            status: existing.status,
          },
        },
      })
      .catch(() => {});

    return { success: true };
  } catch (err) {
    console.warn("[survey-service] Fallback a local store para deleteSurvey:", err);
    const ok = deleteLocalSurvey(id);
    return ok ? { success: true } : { success: false, notFound: true };
  }
}
