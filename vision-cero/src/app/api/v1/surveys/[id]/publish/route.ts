import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { publishSurvey } from "@/lib/services/deployment-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/surveys/:id/publish
 * Publica una encuesta previa validación de existencia de al menos 1 pregunta.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const outcome = await publishSurvey(id, auth.user.id, auth.user.role === "admin");

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
        detail: "No tienes permisos para publicar una encuesta de otro creador.",
      });
    }

    if (outcome.conflict) {
      return createProblemResponse({
        type: "https://httpstatuses.com/409",
        title: "Conflicto al Publicar",
        status: 409,
        detail: outcome.conflict,
      });
    }

    return NextResponse.json(outcome.result, { status: 200 });
  } catch (error) {
    console.error("[API Survey Publish error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al publicar la encuesta.",
    });
  }
}
