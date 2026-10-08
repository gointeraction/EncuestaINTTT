import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { createSurvey, listSurveys } from "@/lib/services/survey-service";
import { SurveyStatus } from "@prisma/client";

/**
 * GET /api/v1/surveys
 * Lista encuestas. Requiere rol 'creator', 'analyst' o 'admin'.
 */
export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["creator", "analyst", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as SurveyStatus | null;
    const limitParam = searchParams.get("limit");

    // Los creadores ven sus encuestas a menos que sean admin
    const creatorId =
      auth.user.role === "creator" ? auth.user.id : searchParams.get("creator_id") || undefined;

    const surveys = await listSurveys({
      creatorId,
      status: statusParam || undefined,
      limit: limitParam ? parseInt(limitParam, 10) : 20,
    });

    return NextResponse.json({
      data: surveys,
      total: surveys.length,
    });
  } catch (error) {
    console.error("[API Surveys GET error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al listar las encuestas.",
    });
  }
}

/**
 * POST /api/v1/surveys
 * Crea una nueva encuesta. Requiere rol 'creator' o 'admin'.
 */
export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.title !== "string" || !body.title.trim()) {
      return createProblemResponse({
        type: "https://httpstatuses.com/422",
        title: "Entidad No Procesable",
        status: 422,
        detail: "El campo 'title' es obligatorio y debe ser un texto no vacío.",
      });
    }

    const survey = await createSurvey(auth.user.id, {
      title: body.title,
      description: body.description,
      accessMode: body.access_mode,
      allowPartial: body.allow_partial,
      maxResponses: body.max_responses,
      startsAt: body.starts_at,
      endsAt: body.ends_at,
      consentText: body.consent_text,
    });

    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    console.error("[API Surveys POST error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al crear la encuesta.",
    });
  }
}
