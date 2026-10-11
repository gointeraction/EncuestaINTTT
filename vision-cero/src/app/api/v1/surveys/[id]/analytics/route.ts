import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { getSurveyAnalytics } from "@/lib/services/analytics-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/surveys/:id/analytics
 * Retorna las métricas analíticas agregadas de la encuesta (US-5.1 y US-5.2).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "analyst", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const channel = searchParams.get("channel") || undefined;
    const deviceType = searchParams.get("device") || undefined;

    const analytics = await getSurveyAnalytics(id, {
      from,
      to,
      channel,
      deviceType,
    });

    if (!analytics) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró la encuesta con ID '${id}'.`,
      });
    }

    return NextResponse.json(analytics, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30, s-maxage=30",
      },
    });
  } catch (error) {
    console.error("[API Survey Analytics error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error al calcular la analítica de la encuesta.",
    });
  }
}
