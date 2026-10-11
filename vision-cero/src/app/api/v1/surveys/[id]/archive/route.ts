import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { archiveSurvey } from "@/lib/services/deployment-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/surveys/:id/archive
 * Archiva una encuesta cerrada.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const outcome = await archiveSurvey(id, auth.user.id, auth.user.role === "admin");

    if (outcome.notFound) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró la encuesta con ID '${id}'.`,
      });
    }

    if (outcome.forbidden) {
      return createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: "No tienes permisos para archivar una encuesta de otro creador.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Encuesta archivada exitosamente.",
      survey: outcome.survey,
    });
  } catch (error) {
    console.error("[API Survey Archive error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al archivar la encuesta.",
    });
  }
}
