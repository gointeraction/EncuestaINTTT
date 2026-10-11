import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { getSurveyById, updateSurvey, deleteSurvey } from "@/lib/services/survey-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/surveys/:id
 * Obtiene el detalle de una encuesta específica.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "analyst", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const survey = await getSurveyById(id);

    if (!survey) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró ninguna encuesta con el identificador '${id}'.`,
      });
    }

    return NextResponse.json(survey);
  } catch (error) {
    console.error("[API Survey GET :id error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al consultar la encuesta.",
    });
  }
}

/**
 * PATCH /api/v1/surveys/:id
 * Actualiza los datos o estado de una encuesta.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const existing = await getSurveyById(id);

    if (!existing) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró ninguna encuesta con el identificador '${id}'.`,
      });
    }

    // Solo el creador original o un admin pueden modificar la encuesta
    if (existing.creatorId !== auth.user.id && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: "No tienes permisos para modificar una encuesta creada por otro usuario.",
      });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return createProblemResponse({
        type: "https://httpstatuses.com/400",
        title: "Solicitud Inválida",
        status: 400,
        detail: "El cuerpo de la solicitud debe ser un objeto JSON válido.",
      });
    }

    const updated = await updateSurvey(
      id,
      {
        title: body.title,
        description: body.description,
        status: body.status,
        accessMode: body.access_mode,
        allowPartial: body.allow_partial,
        maxResponses: body.max_responses,
        startsAt: body.starts_at,
        endsAt: body.ends_at,
        consentText: body.consent_text,
      },
      auth.user.id
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API Survey PATCH :id error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al actualizar la encuesta.",
    });
  }
}

/**
 * DELETE /api/v1/surveys/:id
 * Elimina una encuesta (solo borrador, o admin).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const existing = await getSurveyById(id);

    if (!existing) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró ninguna encuesta con el identificador '${id}'.`,
      });
    }

    if (existing.creatorId !== auth.user.id && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: "No tienes permisos para eliminar una encuesta creada por otro usuario.",
      });
    }

    const result = await deleteSurvey(id, auth.user.id, auth.user.role === "admin");

    if (result.conflict) {
      return createProblemResponse({
        type: "https://httpstatuses.com/409",
        title: "Conflicto de Estado",
        status: 409,
        detail: result.reason || "No se puede eliminar la encuesta en su estado actual.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Encuesta eliminada correctamente.",
    });
  } catch (error) {
    console.error("[API Survey DELETE :id error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al eliminar la encuesta.",
    });
  }
}
