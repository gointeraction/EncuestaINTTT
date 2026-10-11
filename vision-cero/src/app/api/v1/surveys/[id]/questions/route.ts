import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { getSurveyById } from "@/lib/services/survey-service";
import {
  createQuestion,
  listQuestionsBySurvey,
  validateQuestionSchema,
} from "@/lib/services/question-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/surveys/:id/questions
 * Retorna la lista ordenada de preguntas de la encuesta.
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
        detail: `No se encontró la encuesta con ID '${id}'.`,
      });
    }

    const questions = await listQuestionsBySurvey(id);
    return NextResponse.json({
      survey_id: id,
      total: questions.length,
      questions,
    });
  } catch (error) {
    console.error("[API Survey Questions GET error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al obtener las preguntas.",
    });
  }
}

/**
 * POST /api/v1/surveys/:id/questions
 * Agrega una nueva pregunta a la encuesta.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const survey = await getSurveyById(id);

    if (!survey) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró la encuesta con ID '${id}'.`,
      });
    }

    if (survey.creatorId !== auth.user.id && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/403",
        title: "Acceso Denegado",
        status: 403,
        detail: "No puedes agregar preguntas a una encuesta que no te pertenece.",
      });
    }

    if (survey.status !== "draft" && auth.user.role !== "admin") {
      return createProblemResponse({
        type: "https://httpstatuses.com/409",
        title: "Conflicto de Estado",
        status: 409,
        detail: "Solo se pueden agregar preguntas a encuestas en estado 'draft'.",
      });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.label !== "string" || !body.label.trim()) {
      return createProblemResponse({
        type: "https://httpstatuses.com/422",
        title: "Entidad No Procesable",
        status: 422,
        detail: "El campo 'label' de la pregunta es obligatorio.",
      });
    }

    const validationCheck = validateQuestionSchema(
      body.type,
      body.options,
      body.validation_rules
    );
    if (!validationCheck.valid) {
      return createProblemResponse({
        type: "https://httpstatuses.com/422",
        title: "Reglas de Pregunta Inválidas",
        status: 422,
        detail: validationCheck.error || "Esquema de pregunta no válido.",
      });
    }

    const created = await createQuestion(id, {
      sectionId: body.section_id,
      type: body.type,
      label: body.label,
      required: body.required,
      position: body.position,
      validationRules: body.validation_rules,
      branchingRules: body.branching_rules,
      options: body.options,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[API Survey Questions POST error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al crear la pregunta.",
    });
  }
}
