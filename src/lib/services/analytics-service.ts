import { db } from "../db";

export interface AnalyticsFilters {
  from?: string | Date;
  to?: string | Date;
  channel?: string;
  deviceType?: string;
}

export interface QuestionAnalytics {
  question_id: string;
  type: string;
  label: string;
  total_answers: number;
  average?: number;
  distribution?: Array<{
    option?: string;
    scale?: number;
    count: number;
    pct?: number;
  }>;
  recent_texts?: string[];
}

export interface SurveyAnalyticsResult {
  survey_id: string;
  totals: {
    responses: number;
    completed: number;
    abandoned: number;
    completion_rate: number;
    abandonment_rate: number;
  };
  questions: QuestionAnalytics[];
  timeline: Array<{
    date: string;
    responses: number;
  }>;
}

import { getLocalSurveyById } from "./local-survey-store";

/**
 * Calcula las métricas analíticas agregadas para una encuesta (US-5.1 y US-5.2).
 */
export async function getSurveyAnalytics(
  surveyId: string,
  filters: AnalyticsFilters = {}
): Promise<SurveyAnalyticsResult | null> {
  try {
    const survey = await db.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { position: "asc" },
          include: {
            options: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    if (!survey) {
      const local = getLocalSurveyById(surveyId);
      if (local) {
        return getLocalAnalytics(local);
      }
      return null;
    }

  // Construir cláusula where para responses
  const whereClause: Record<string, unknown> = { surveyId };

  if (filters.from || filters.to) {
    const dateFilter: Record<string, Date> = {};
    if (filters.from) dateFilter.gte = new Date(filters.from);
    if (filters.to) dateFilter.lte = new Date(filters.to);
    whereClause.startedAt = dateFilter;
  }

  if (filters.channel) {
    whereClause.channel = filters.channel;
  }

  // 1. Obtener todas las respuestas con sus respuestas individuales
  const responses = await db.response.findMany({
    where: whereClause,
    include: {
      answers: true,
    },
    orderBy: { startedAt: "asc" },
  });

  const totalResponses = responses.length;
  const completedResponses = responses.filter((r) => r.status === "completed").length;
  const abandonedResponses = responses.filter((r) => r.status === "abandoned").length;

  const completionRate = totalResponses > 0 ? Number((completedResponses / totalResponses).toFixed(4)) : 0;
  const abandonmentRate = totalResponses > 0 ? Number((abandonedResponses / totalResponses).toFixed(4)) : 0;

  // 2. Agregaciones por pregunta
  const questionsAnalytics: QuestionAnalytics[] = [];

  for (const q of survey.questions) {
    // Recolectar respuestas para esta pregunta
    const answersForQ = responses.flatMap((r) =>
      r.answers.filter((a) => a.questionId === q.id)
    );

    const totalAnswers = answersForQ.length;

    if (q.type === "scale" || q.type === "rating") {
      const numericValues = answersForQ
        .map((a) => (a.valueNumeric !== null ? Number(a.valueNumeric) : null))
        .filter((n): n is number => n !== null);

      const sum = numericValues.reduce((acc, curr) => acc + curr, 0);
      const avg = numericValues.length > 0 ? Number((sum / numericValues.length).toFixed(2)) : 0;

      // Distribución por escala
      const counts: Record<number, number> = {};
      for (const val of numericValues) {
        counts[val] = (counts[val] || 0) + 1;
      }

      const distribution = Object.entries(counts).map(([scaleStr, count]) => ({
        scale: Number(scaleStr),
        count,
        pct: totalAnswers > 0 ? Number(((count / totalAnswers) * 100).toFixed(1)) : 0,
      }));

      distribution.sort((a, b) => a.scale - b.scale);

      questionsAnalytics.push({
        question_id: q.id,
        type: q.type,
        label: q.label,
        total_answers: totalAnswers,
        average: avg,
        distribution,
      });
    } else if (["single_choice", "dropdown"].includes(q.type)) {
      const counts: Record<string, number> = {};
      for (const opt of q.options) {
        counts[opt.value] = 0;
      }

      for (const a of answersForQ) {
        if (a.valueText) {
          counts[a.valueText] = (counts[a.valueText] || 0) + 1;
        }
      }

      const distribution = q.options.map((opt) => {
        const count = counts[opt.value] || 0;
        return {
          option: opt.label,
          count,
          pct: totalAnswers > 0 ? Number(((count / totalAnswers) * 100).toFixed(1)) : 0,
        };
      });

      questionsAnalytics.push({
        question_id: q.id,
        type: q.type,
        label: q.label,
        total_answers: totalAnswers,
        distribution,
      });
    } else if (q.type === "multi_choice") {
      const counts: Record<string, number> = {};
      for (const opt of q.options) {
        counts[opt.value] = 0;
      }

      for (const a of answersForQ) {
        if (Array.isArray(a.valueOptions)) {
          for (const item of a.valueOptions) {
            const valStr = String(item);
            counts[valStr] = (counts[valStr] || 0) + 1;
          }
        }
      }

      const distribution = q.options.map((opt) => {
        const count = counts[opt.value] || 0;
        return {
          option: opt.label,
          count,
          pct: totalAnswers > 0 ? Number(((count / totalAnswers) * 100).toFixed(1)) : 0,
        };
      });

      questionsAnalytics.push({
        question_id: q.id,
        type: q.type,
        label: q.label,
        total_answers: totalAnswers,
        distribution,
      });
    } else {
      // Texto corto o largo: resumen de últimas 5 respuestas
      const recentTexts = answersForQ
        .map((a) => a.valueText)
        .filter((t): t is string => Boolean(t && t.trim()))
        .slice(-5);

      questionsAnalytics.push({
        question_id: q.id,
        type: q.type,
        label: q.label,
        total_answers: totalAnswers,
        recent_texts: recentTexts,
      });
    }
  }

  // 3. Serie temporal por día (YYYY-MM-DD)
  const timelineMap: Record<string, number> = {};
  for (const r of responses) {
    if (r.status === "completed" && r.submittedAt) {
      const dateKey = r.submittedAt.toISOString().slice(0, 10);
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
    }
  }

  const timeline = Object.entries(timelineMap).map(([date, count]) => ({
    date,
    responses: count,
  }));
  timeline.sort((a, b) => a.date.localeCompare(b.date));

    return {
      survey_id: survey.id,
      totals: {
        responses: totalResponses,
        completed: completedResponses,
        abandoned: abandonedResponses,
        completion_rate: completionRate,
        abandonment_rate: abandonmentRate,
      },
      questions: questionsAnalytics,
      timeline,
    };
  } catch (err) {
    console.warn("[analytics-service] Fallback a local survey para getSurveyAnalytics:", err);
    const local = getLocalSurveyById(surveyId);
    if (!local) return null;
    return getLocalAnalytics(local);
  }
}

function getLocalAnalytics(local: ReturnType<typeof getLocalSurveyById> & object): SurveyAnalyticsResult {
  return {
    survey_id: local.id,
    totals: {
      responses: local._count?.responses || 0,
      completed: local._count?.responses || 0,
      abandoned: 0,
      completion_rate: 1,
      abandonment_rate: 0,
    },
    questions: (local.questions || []).map((q: any) => ({
      question_id: q.id,
      type: q.type,
      label: q.label,
      total_answers: 0,
      distribution: (q.options || []).map((opt: any) => ({
        option: opt.label,
        count: 0,
        pct: 0,
      })),
      recent_texts: [],
    })),
    timeline: [],
  };
}
