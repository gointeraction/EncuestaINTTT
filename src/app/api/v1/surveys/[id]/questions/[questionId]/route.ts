import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import {
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  validateQuestionSchema,
} from "@/lib/services/question-service";

interface RouteParams {
  params: Promise<{ id: string; questionId: string }>;
}

/**
 * GET /api/v1/surveys/:id/questions/:questionId
 * Detalle de una pregunta.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "analyst", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id, questionId } = await params;
    const question = await getQuestionById(questionId);

    if (!question || question.surveyId !== id) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Pregunta No Encontrada",
        status: 404,
        detail: `No se encontró la pregunta con ID '${questionId}' en esta encuesta.`,
      });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("[API Question GET :questionId error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al consultar la pregunta.",
    });
  }
}

/**
 * PATCH /api/v1/surveys/:id/questions/:questionId
 * Modifica una pregunta y sus opciones.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id, questionId } = await params;
    const existing = await getQuestionById(questionId);

    if (!existing || existing.surveyId !== id) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Pregunta No Encontrada",
        status: 404,
        detail: `No se encontró la pregunta con ID '${questionId}' en esta encuesta.`,
      });
    }

    if (existing.survey.creatorId !== auth.user.id && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: "No tienes permisos para modificar preguntas de esta encuesta.",
      });
    }

    if (existing.survey.status !== "draft" && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/409",
        title: "Conflicto de Estado",
        status: 409,
        detail: "Solo se pueden editar preguntas en encuestas en estado 'draft'.",
      });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return createProblemResponse({
        type: "https://httpstatuses.com/400",
        title: "Solicitud Inválida",
        status: 400,
        detail: "El cuerpo de la petición debe ser un objeto JSON válido.",
      });
    }

    // Si se envían nuevas opciones, validar consistencia
    if (body.options) {
      const check = validateQuestionSchema(existing.type, body.options, body.validation_rules);
      if (!check.valid) {
        return createProblemResponse({
          type: "https://httpstatuses.com/422",
          title: "Opciones Inválidas",
          status: 422,
          detail: check.error || "Las opciones proporcionadas no son válidas.",
        });
      }
    }

    const updated = await updateQuestion(questionId, {
      sectionId: body.section_id,
      label: body.label,
      required: body.required,
      position: body.position,
      validationRules: body.validation_rules,
      branchingRules: body.branching_rules,
      options: body.options,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API Question PATCH :questionId error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al actualizar la pregunta.",
    });
  }
}

/**
 * DELETE /api/v1/surveys/:id/questions/:questionId
 * Elimina una pregunta.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id, questionId } = await params;
    const existing = await getQuestionById(questionId);

    if (!existing || existing.surveyId !== id) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Pregunta No Encontrada",
        status: 404,
        detail: `No se encontró la pregunta con ID '${questionId}' en esta encuesta.`,
      });
    }

    if (existing.survey.creatorId !== auth.user.id && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: "No tienes permisos para eliminar preguntas de esta encuesta.",
      });
    }

    if (existing.survey.status !== "draft" && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/409",
        title: "Conflicto de Estado",
        status: 409,
        detail: "Solo se pueden eliminar preguntas de encuestas en estado 'draft'.",
      });
    }

    await deleteQuestion(questionId);

    return NextResponse.json({
      success: true,
      message: "Pregunta eliminada exitosamente.",
    });
  } catch (error) {
    console.error("[API Question DELETE :questionId error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al eliminar la pregunta.",
    });
  }
}
