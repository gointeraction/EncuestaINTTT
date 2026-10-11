import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

interface SurveyTotals {
  total: number;
  completed: number;
  abandoned: number;
  in_progress: number;
}

interface QuestionRow {
  id: string;
  type: string;
  label: string;
  position: number;
}

/**
 * ReadModelService — calcula y persiste los read models (esquema `analytics`)
 * a partir de la captura (esquema `public`, SOLO LECTURA). No escribe en public.
 */
@Injectable()
export class ReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  listSurveys(): Promise<Array<{ id: string; title: string }>> {
    return this.prisma.$queryRaw<Array<{ id: string; title: string }>>`
      SELECT id::text AS id, title
      FROM public.surveys
      ORDER BY created_at DESC
      LIMIT 500
    `;
  }

  async summarizeSurvey(surveyId: string): Promise<number> {
    const [row] = await this.prisma.$queryRaw<SurveyTotals[]>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'abandoned')::int AS abandoned,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress
      FROM public.responses
      WHERE survey_id = ${surveyId}
    `;
    const totals: SurveyTotals = row ?? { total: 0, completed: 0, abandoned: 0, in_progress: 0 };
    const questions = await this.questionBreakdown(surveyId);
    const payload = {
      surveyId,
      totals: {
        ...totals,
        completionRate: totals.total ? totals.completed / totals.total : 0,
        abandonmentRate: totals.total ? totals.abandoned / totals.total : 0,
      },
      questions,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.surveySummaryReport.upsert({
      where: { surveyId },
      create: { surveyId, totalCount: totals.total, summaryData: JSON.stringify(payload) },
      update: {
        totalCount: totals.total,
        summaryData: JSON.stringify(payload),
        calculatedAt: new Date(),
      },
    });
    return totals.total;
  }

  /** Desglose por pregunta: conteos (opción), promedio+distribución (escala), comentarios (texto). */
  private async questionBreakdown(surveyId: string): Promise<unknown[]> {
    const questions = await this.prisma.$queryRaw<QuestionRow[]>`
      SELECT id::text AS id, type, label, position
      FROM public.questions
      WHERE survey_id = ${surveyId}
      ORDER BY position ASC
      LIMIT 200
    `;
    const out: unknown[] = [];
    for (const q of questions) {
      const base = { id: q.id, type: q.type, label: q.label, position: q.position };
      if (q.type === 'single_choice' || q.type === 'dropdown') {
        const options = await this.prisma.$queryRaw<Array<{ value: string; count: number }>>`
          SELECT COALESCE(value_text, '') AS value, COUNT(*)::int AS count
          FROM public.answers
          WHERE question_id = ${q.id}
          GROUP BY value
          ORDER BY count DESC
          LIMIT 50
        `;
        out.push({ ...base, kind: 'choice', options });
      } else if (q.type === 'multi_choice') {
        const options = await this.prisma.$queryRaw<Array<{ value: string; count: number }>>`
          SELECT opt AS value, COUNT(*)::int AS count
          FROM public.answers a, jsonb_array_elements_text(a.value_options) AS opt
          WHERE a.question_id = ${q.id} AND a.value_options IS NOT NULL
          GROUP BY opt
          ORDER BY count DESC
          LIMIT 50
        `;
        out.push({ ...base, kind: 'choice', options });
      } else if (q.type === 'scale' || q.type === 'rating') {
        const distribution = await this.prisma.$queryRaw<
          Array<{ value: number; count: number }>
        >`
          SELECT value_numeric::float8 AS value, COUNT(*)::int AS count
          FROM public.answers
          WHERE question_id = ${q.id} AND value_numeric IS NOT NULL
          GROUP BY value_numeric
          ORDER BY value_numeric ASC
        `;
        let weighted = 0;
        let count = 0;
        for (const d of distribution) {
          weighted += Number(d.value) * d.count;
          count += d.count;
        }
        out.push({ ...base, kind: 'numeric', average: count ? weighted / count : null, distribution });
      } else {
        const comments = await this.prisma.$queryRaw<Array<{ value: string }>>`
          SELECT value_text AS value
          FROM public.answers
          WHERE question_id = ${q.id} AND value_text IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 10
        `;
        out.push({ ...base, kind: 'text', comments: comments.map((c) => c.value) });
      }
    }
    return out;
  }

  async summarizeGlobal(): Promise<number> {
    const [surveys] = await this.prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total FROM public.surveys
    `;
    const [responses] = await this.prisma.$queryRaw<
      Array<{ total: number; completed: number; abandoned: number }>
    >`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'abandoned')::int AS abandoned
      FROM public.responses
    `;
    const bySurvey = await this.prisma.$queryRaw<
      Array<{ id: string; title: string; responses: number }>
    >`
      SELECT s.id::text AS id, s.title, COUNT(r.id)::int AS responses
      FROM public.surveys s
      LEFT JOIN public.responses r ON r.survey_id = s.id
      GROUP BY s.id, s.title
      ORDER BY responses DESC
      LIMIT 100
    `;
    const payload = {
      totalSurveys: surveys?.total ?? 0,
      totalResponses: responses?.total ?? 0,
      completed: responses?.completed ?? 0,
      abandoned: responses?.abandoned ?? 0,
      bySurvey,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.globalDashboard.upsert({
      where: { id: 'latest' },
      create: { id: 'latest', payload: JSON.stringify(payload) },
      update: { payload: JSON.stringify(payload) },
    });
    return payload.totalResponses;
  }
}
