import { NextRequest, NextResponse } from "next/server";
import { createProblemResponse } from "@/lib/auth";
import { evaluateRespondentEligibility } from "@/lib/services/eligibility-service";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const RESPONDENT_COOKIE_NAME = "sdd_resp_token";

/**
 * GET /api/v1/public/surveys/:slug
 * Valida la elegibilidad del encuestado y emite session_token ANTES de entregar las preguntas.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const invitationToken = searchParams.get("token");
    const verifiedEmail = searchParams.get("email");
    const existingRespondentToken = request.cookies.get(RESPONDENT_COOKIE_NAME)?.value || null;

    const evaluation = await evaluateRespondentEligibility({
      slugOrCode: slug,
      invitationToken,
      existingRespondentToken,
      verifiedEmail,
    });

    if (!evaluation.eligible) {
      return createProblemResponse({
        type: `https://httpstatuses.com/${evaluation.statusHttp || 403}`,
        title: evaluation.title || "Acceso Denegado",
        status: evaluation.statusHttp || 403,
        detail: evaluation.reason || "No eres elegible para acceder a esta encuesta.",
      });
    }

    const response = NextResponse.json(
      {
        session_token: evaluation.sessionToken,
        survey: evaluation.survey,
        questions: evaluation.questions,
      },
      {
        status: 200,
        headers: {
          "X-Session-Token": evaluation.sessionToken || "",
          "Cache-Control": "no-store, private",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("[API Public Survey GET error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error al procesar la elegibilidad de la encuesta.",
    });
  }
}
