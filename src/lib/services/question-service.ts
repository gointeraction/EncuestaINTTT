import { db } from "../db";
import { Prisma } from "@prisma/client";

export const VALID_QUESTION_TYPES = [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "dropdown",
  "scale",
  "rating",
  "date",
] as const;

export type QuestionType = (typeof VALID_QUESTION_TYPES)[number];

export interface QuestionOptionInput {
  label: string;
  value: string;
  position?: number;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowOther?: boolean;
}

export interface CreateQuestionInput {
  sectionId?: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  position?: number;
  validationRules?: ValidationRules;
  branchingRules?: Record<string, unknown>;
  options?: QuestionOptionInput[];
}

export interface UpdateQuestionInput {
  sectionId?: string | null;
  label?: string;
  required?: boolean;
  position?: number;
  validationRules?: ValidationRules;
  branchingRules?: Record<string, unknown> | null;
  options?: QuestionOptionInput[];
}

/**
 * Valida la consistencia de las reglas de validación según el tipo de pregunta.
 */
export function validateQuestionSchema(
  type: string,
  options?: QuestionOptionInput[],
  validationRules?: ValidationRules
): { valid: boolean; error?: string } {
  if (!VALID_QUESTION_TYPES.includes(type as QuestionType)) {
    return {
      valid: false,
      error: `Tipo de pregunta '${type}' inválido. Tipos permitidos: ${VALID_QUESTION_TYPES.join(", ")}`,
    };
  }

  // Preguntas de selección deben incluir opciones
  if (["single_choice", "multi_choice", "dropdown"].includes(type)) {
    if (!options || options.length < 2) {
      return {
        valid: false,
        error: `Las preguntas de tipo '${type}' requieren al menos 2 opciones de respuesta.`,
      };
    }
  }

  // Reglas para preguntas de tipo escala / calificación
  if (type === "scale" || type === "rating") {
    if (validationRules) {
      if (validationRules.min !== undefined && validationRules.max !== undefined) {
        if (validationRules.min >= validationRules.max) {
          return {
            valid: false,
            error: "El valor 'min' debe ser estrictamente menor que 'max'.",
          };
        }
      }
    }
  }

  return { valid: true };
}

import {
  getLocalSurveyById,
  saveLocalSurvey,
  LocalQuestion,
} from "./local-survey-store";

/**
 * Agrega una pregunta con sus opciones a una encuesta.
 */
export async function createQuestion(surveyId: string, input: CreateQuestionInput) {
  const schemaCheck = validateQuestionSchema(input.type, input.options, input.validationRules);
  if (!schemaCheck.valid) {
    throw new Error(schemaCheck.error);
  }

  try {
    // Determinar la posición secuencial si no viene provista
    let position = input.position;
    if (position === undefined) {
      const lastQuestion = await db.question.findFirst({
        where: { surveyId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = (lastQuestion?.position ?? -1) + 1;
    }

    return await db.question.create({
      data: {
        surveyId,
        sectionId: input.sectionId,
        type: input.type,
        label: input.label.trim(),
        required: input.required ?? false,
        position,
        validationRules: (input.validationRules as unknown as Prisma.InputJsonValue) ?? {},
        branchingRules: input.branchingRules ? (input.branchingRules as unknown as Prisma.InputJsonValue) : undefined,
        options: input.options && input.options.length > 0
          ? {
              create: input.options.map((opt, idx) => ({
                label: opt.label.trim(),
                value: opt.value.trim(),
                position: opt.position ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        options: {
          orderBy: { position: "asc" },
        },
      },
    });
  } catch (err) {
    console.warn("[question-service] Fallback a local store para createQuestion:", err);
    const local = getLocalSurveyById(surveyId);
    if (!local) throw new Error("Encuesta no encontrada");

    const newQuestionId = "q-" + Date.now();
    const position = input.position !== undefined ? input.position : local.questions.length + 1;
    const newQuestion: LocalQuestion = {
      id: newQuestionId,
      surveyId,
      type: input.type,
      label: input.label.trim(),
      required: input.required ?? false,
      position,
      options: (input.options || []).map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        label: opt.label.trim(),
        value: opt.value.trim(),
        position: opt.position ?? idx + 1,
      })),
    };

    local.questions.push(newQuestion);
    local._count.questions = local.questions.length;
    saveLocalSurvey(local);
    return newQuestion;
  }
}

/**
 * Obtiene todas las preguntas de una encuesta ordenadas por posición.
 */
export async function listQuestionsBySurvey(surveyId: string) {
  try {
    return await db.question.findMany({
      where: { surveyId },
      orderBy: { position: "asc" },
      include: {
        options: {
          orderBy: { position: "asc" },
        },
      },
    });
  } catch (err) {
    console.warn("[question-service] Usando local store para listQuestionsBySurvey");
    const local = getLocalSurveyById(surveyId);
    return local ? local.questions : [];
  }
}

/**
 * Obtiene una pregunta específica con sus opciones.
 */
export async function getQuestionById(questionId: string) {
  try {
    return await db.question.findUnique({
      where: { id: questionId },
      include: {
        options: {
          orderBy: { position: "asc" },
        },
        survey: {
          select: { id: true, creatorId: true, status: true },
        },
      },
    });
  } catch (err) {
    console.warn("[question-service] Usando local store para getQuestionById");
    const local = getLocalSurveyById(questionId);
    if (!local) return null;
    const question = local.questions.find((q) => q.id === questionId);
    if (!question) return null;
    return {
      ...question,
      survey: { id: local.id, creatorId: local.creatorId, status: local.status },
    };
  }
}

/**
 * Actualiza una pregunta y opcionalmente reemplaza sus opciones.
 */
export async function updateQuestion(questionId: string, input: UpdateQuestionInput) {
  const existing = await db.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });

  if (!existing) return null;

  const dataToUpdate: Prisma.QuestionUpdateInput = {};

  if (input.label !== undefined) dataToUpdate.label = input.label.trim();
  if (input.required !== undefined) dataToUpdate.required = input.required;
  if (input.position !== undefined) dataToUpdate.position = input.position;
  if (input.sectionId !== undefined) dataToUpdate.sectionId = input.sectionId;
  if (input.validationRules !== undefined) {
    dataToUpdate.validationRules = input.validationRules as unknown as Prisma.InputJsonValue;
  }
  if (input.branchingRules !== undefined) {
    dataToUpdate.branchingRules = input.branchingRules
      ? (input.branchingRules as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull;
  }

  // Si se proveen nuevas opciones, se actualizan atómicamente
  if (input.options !== undefined) {
    return db.$transaction(async (tx) => {
      // Eliminar opciones anteriores
      await tx.questionOption.deleteMany({
        where: { questionId },
      });

      // Crear las nuevas opciones
      if (input.options && input.options.length > 0) {
        await tx.questionOption.createMany({
          data: input.options.map((opt, idx) => ({
            questionId,
            label: opt.label.trim(),
            value: opt.value.trim(),
            position: opt.position ?? idx,
          })),
        });
      }

      return tx.question.update({
        where: { id: questionId },
        data: dataToUpdate,
        include: {
          options: {
            orderBy: { position: "asc" },
          },
        },
      });
    });
  }

  return db.question.update({
    where: { id: questionId },
    data: dataToUpdate,
    include: {
      options: {
        orderBy: { position: "asc" },
      },
    },
  });
}

/**
 * Elimina una pregunta y sus opciones asociadas (vía CASCADE).
 */
export async function deleteQuestion(questionId: string) {
  const existing = await db.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!existing) return false;

  await db.question.delete({
    where: { id: questionId },
  });

  return true;
}

/**
 * Reordena una lista de preguntas secuencialmente.
 */
export async function reorderQuestions(surveyId: string, questionIdsInOrder: string[]) {
  return db.$transaction(
    questionIdsInOrder.map((id, index) =>
      db.question.update({
        where: { id, surveyId },
        data: { position: index },
      })
    )
  );
}
