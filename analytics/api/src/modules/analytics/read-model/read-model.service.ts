import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { QUESTIONNAIRES, PRIMARY_QUESTIONNAIRE, type Questionnaire } from './questionnaires.js';
import { aggregateAnswers, buildFilterWhere, bySegment } from './answers-analysis.js';

/**
 * ReadModelService — calcula y persiste los read models (esquema `analytics`) a partir de la
 * CAPTURA REAL, según el REGISTRO de cuestionarios (A2: questionnaires-registry.md) y el modelo
 * de filtrado (A2: analysis-filtering.md). No escribe en public.
 */
@Injectable()
export class ReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  listSurveys(): Promise<Array<{ id: string; title: string }>> {
    return Promise.resolve(QUESTIONNAIRES.map((q) => ({ id: q.id, title: q.title })));
  }

  async summarizeGlobal(): Promise<number> {
    return this.summarizeGlobalOf(PRIMARY_QUESTIONNAIRE);
  }

  private async summarizeGlobalOf(q: Questionnaire): Promise<number> {
    const src = q.source;
    const [tot] = await this.prisma.$queryRawUnsafe<Array<{ total: number; sorteo: number }>>(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE "${src.sorteoField}")::int AS sorteo
       FROM ${src.table}`,
    );
    const bySeg = await this.prisma.$queryRawUnsafe<Array<{ id: string; responses: number }>>(
      `SELECT "${src.segmentsField}" AS id, COUNT(*)::int AS responses
       FROM ${src.table} GROUP BY 1 ORDER BY 2 DESC`,
    );
    const byChannel = await this.prisma.$queryRawUnsafe<Array<{ id: string; responses: number }>>(
      `SELECT COALESCE("${src.channelField}", 'public') AS id, COUNT(*)::int AS responses
       FROM ${src.table} GROUP BY 1 ORDER BY 2 DESC`,
    );
    const total = tot?.total ?? 0;
    const payload = {
      totalSurveys: 1,
      totalResponses: total,
      completed: total,
      abandoned: 0,
      sorteo: tot?.sorteo ?? 0,
      bySurvey: [{ id: q.id, title: q.title, responses: total }],
      byDriverType: bySeg.map((d) => ({ ...d, label: q.segments[d.id] ?? d.id })),
      byChannel: byChannel.map((c) => ({ ...c, label: q.channels[c.id] ?? c.id })),
      questionnaire: q.id,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.globalDashboard.upsert({
      where: { id: 'latest' },
      create: { id: 'latest', payload: JSON.stringify(payload) },
      update: { payload: JSON.stringify(payload) },
    });
    return total;
  }

  /** Resumen materializado del cuestionario (sin filtros). */
  async summarizeSurvey(surveyId: string): Promise<number> {
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const rows = await this.fetchRows(q);
    const { questions, total } = aggregateAnswers(q, rows);
    const payload = {
      surveyId: q.id,
      title: q.title,
      totals: {
        total,
        responses: total,
        completed: total,
        abandoned: 0,
        in_progress: 0,
        completionRate: total ? 1 : 0,
        abandonmentRate: 0,
      },
      byDriverType: bySegment(rows),
      questions,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.surveySummaryReport.upsert({
      where: { surveyId: q.id },
      create: { surveyId: q.id, totalCount: total, summaryData: JSON.stringify(payload) },
      update: { totalCount: total, summaryData: JSON.stringify(payload), calculatedAt: new Date() },
    });
    return total;
  }

  /**
   * Resumen FILTRADO en vivo: acota los cuestionarios por `(dimension = value)` y reagrega
   * pregunta por pregunta (A2: analysis-filtering.md). Solo-lectura.
   */
  async summarizeFiltered(surveyId: string, dimension: string, value: string): Promise<unknown> {
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const { sql, params } = buildFilterWhere(q, dimension, value);
    const rows = await this.prisma.$queryRawUnsafe<Array<{ answers: string; seg: string }>>(
      `SELECT "${q.source.answersField}" AS answers, "${q.source.segmentsField}" AS seg
       FROM ${q.source.table} ${sql} LIMIT 200000`,
      ...params,
    );
    const { questions, total } = aggregateAnswers(q, rows);
    return {
      surveyId: q.id,
      segment: { dimension, value },
      totals: {
        total,
        responses: total,
        completed: total,
        abandoned: 0,
        in_progress: 0,
        completionRate: total ? 1 : 0,
        abandonmentRate: 0,
      },
      byDriverType: bySegment(rows),
      questions,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Cuestionarios por día, por la FECHA DE CAPTURA (cae a recepción si es nula). */
  async timeline(surveyId: string): Promise<Array<{ day: string; total: number; completed: number }>> {
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const tf = q.source.timeField ?? 'completedAt';
    const cf = q.source.captureField;
    const expr = cf ? `COALESCE("${cf}", "${tf}")` : `"${tf}"`;
    const rows = await this.prisma.$queryRawUnsafe<Array<{ day: Date; total: number }>>(
      `SELECT date_trunc('day', ${expr}) AS day, COUNT(*)::int AS total
       FROM ${q.source.table}
       WHERE ${expr} IS NOT NULL
       GROUP BY 1 ORDER BY 1 ASC LIMIT 400`,
    );
    return rows.map((r) => ({ day: new Date(r.day).toISOString().slice(0, 10), total: r.total, completed: r.total }));
  }

  /** Panel de anomalías (anti-fraude): por dispositivo, respuestas duplicadas y picos por hora. */
  async anomalies(surveyId: string): Promise<unknown> {
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const src = q.source;
    const deviceField = src.deviceField ?? 'device_id';
    const chanField = src.channelField ?? 'channel';
    const timeExpr = src.captureField
      ? `COALESCE("${src.captureField}", "${src.timeField}")`
      : `"${src.timeField}"`;

    const byDevice = await this.prisma.$queryRawUnsafe<
      Array<{ id: string; channel: string; count: number }>
    >(
      `SELECT COALESCE("${deviceField}", '(público)') AS id, COALESCE("${chanField}", 'public') AS channel,
              COUNT(*)::int AS count
       FROM ${src.table} GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 100`,
    );
    const [dup] = await this.prisma.$queryRawUnsafe<Array<{ groups: number; max: number }>>(
      `SELECT COUNT(*)::int AS groups, COALESCE(MAX(c), 0)::int AS max FROM (
         SELECT "${src.answersField}" AS a, COUNT(*)::int AS c
         FROM ${src.table} GROUP BY 1 HAVING COUNT(*) > 1
       ) t`,
    );
    const hourly = await this.prisma.$queryRawUnsafe<Array<{ hour: string; count: number }>>(
      `SELECT to_char(date_trunc('hour', ${timeExpr}), 'YYYY-MM-DD HH24:00') AS hour, COUNT(*)::int AS count
       FROM ${src.table} WHERE ${timeExpr} >= now() - interval '48 hours'
       GROUP BY 1 ORDER BY 1`,
    );
    return { byDevice, duplicateAnswers: { groups: dup?.groups ?? 0, max: dup?.max ?? 0 }, hourly };
  }

  private fetchRows(q: Questionnaire): Promise<Array<{ answers: string; seg: string }>> {
    return this.prisma.$queryRawUnsafe<Array<{ answers: string; seg: string }>>(
      `SELECT "${q.source.answersField}" AS answers, "${q.source.segmentsField}" AS seg
       FROM ${q.source.table} LIMIT 200000`,
    );
  }
}
