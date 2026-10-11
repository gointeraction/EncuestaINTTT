import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

interface SurveyTotals {
  total: number;
  completed: number;
  abandoned: number;
  in_progress: number;
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
      WHERE survey_id = ${surveyId}::uuid
    `;
    const totals: SurveyTotals = row ?? { total: 0, completed: 0, abandoned: 0, in_progress: 0 };
    const payload = {
      surveyId,
      totals: {
        ...totals,
        completionRate: totals.total ? totals.completed / totals.total : 0,
        abandonmentRate: totals.total ? totals.abandoned / totals.total : 0,
      },
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
