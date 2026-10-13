import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { QUESTIONNAIRES, PRIMARY_QUESTIONNAIRE, type Questionnaire } from './questionnaires.js';
import { aggregateAnswersSql, buildFilterWhere, buildConditionsWhere, AGE_GROUP_LABELS, type FilterCondition } from './answers-analysis.js';

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

  /** Resumen materializado del cuestionario (sin filtros). Agrega en SQL (escala a millones). */
  async summarizeSurvey(surveyId: string): Promise<number> {
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const { questions, total, byDriverType } = await aggregateAnswersSql(this.prisma, q, '', []);
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
      byDriverType,
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
   * Resumen FILTRADO (dimension=value), con CACHÉ persistente por clave. A 1M de encuestas
   * la agregación (explode de `answers`) es O(N); se calcula una vez y se sirve por clave.
   */
  async summarizeFiltered(
    surveyId: string,
    dimension: string,
    value: string,
    force = false,
  ): Promise<unknown> {
    const q = this.resolve(surveyId);
    return this.cachedFiltered(
      q,
      `d:${dimension}=${value}`,
      () => this.computeFiltered(q, buildFilterWhere(q, dimension, value), { segment: { dimension, value } }),
      force,
    );
  }

  /**
   * Resumen en vivo con un CONJUNTO de filtros (multi-valor) combinados con AND/OR
   * (A2: analysis-filtering.md). Cada condición sin valores se ignora (= todas).
   * También cacheado por firma de las condiciones.
   */
  async summarizeWithFilters(
    surveyId: string,
    conditions: FilterCondition[],
    combinator: 'and' | 'or',
  ): Promise<unknown> {
    const q = this.resolve(surveyId);
    const clean = (conditions ?? []).filter((c) => c && c.questionId && (c.values ?? []).length);
    const key =
      'f:' + combinator + ':' +
      clean.map((c) => `${c.questionId}=${[...c.values].map(String).sort().join(',')}`).join('|');
    return this.cachedFiltered(
      q,
      key,
      () => this.computeFiltered(q, buildConditionsWhere(q, conditions, combinator), { filters: { conditions: conditions ?? [], combinator } }),
      false,
    );
  }

  /** Resuelve un cuestionario por id (cae al principal). */
  private resolve(surveyId: string): Questionnaire {
    return QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
  }

  /** TTL de la caché de dashboards filtrados (el `scheduler` la refresca cada hora). */
  private static readonly FILTER_TTL_MS = 6 * 60 * 60 * 1000;

  /** Devuelve el dashboard filtrado de la caché (si está fresco) o lo calcula y lo guarda. */
  private async cachedFiltered(
    q: Questionnaire,
    cacheKey: string,
    compute: () => Promise<unknown>,
    force: boolean,
  ): Promise<unknown> {
    const row = await this.prisma.filteredDashboard.findUnique({
      where: { surveyId_cacheKey: { surveyId: q.id, cacheKey } },
    });
    if (!force && row && Date.now() - row.calculatedAt.getTime() < ReadModelService.FILTER_TTL_MS) {
      return JSON.parse(row.payload);
    }
    const payload = await compute();
    const total = (payload as { totals?: { total?: number } })?.totals?.total ?? 0;
    await this.prisma.filteredDashboard.upsert({
      where: { surveyId_cacheKey: { surveyId: q.id, cacheKey } },
      create: { surveyId: q.id, cacheKey, totalCount: total, payload: JSON.stringify(payload) },
      update: { totalCount: total, payload: JSON.stringify(payload), calculatedAt: new Date() },
    });
    return payload;
  }

  /** Agrega el resumen filtrado (una pasada SQL) y arma el payload. */
  private async computeFiltered(
    q: Questionnaire,
    where: { sql: string; params: unknown[] },
    meta: Record<string, unknown>,
  ): Promise<unknown> {
    const { questions, total, byDriverType } = await aggregateAnswersSql(
      this.prisma,
      q,
      where.sql,
      where.params,
    );
    return {
      surveyId: q.id,
      ...meta,
      totals: {
        total, responses: total, completed: total, abandoned: 0, in_progress: 0,
        completionRate: total ? 1 : 0, abandonmentRate: 0,
      },
      byDriverType,
      questions,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calienta (y refresca) la caché de dashboards filtrados para las dimensiones de
   * envelope + derivada (tipo de conductor, canal, edad). Lo invoca el `scheduler` cada
   * hora, de modo que el filtro por esas dimensiones se sirve SIEMPRE desde caché.
   */
  async warmFilteredCache(surveyId: string): Promise<number> {
    const q = this.resolve(surveyId);
    const dims: Array<[string, string]> = [];
    for (const v of Object.keys(q.segments)) dims.push([q.source.segmentsField, v]);
    for (const v of Object.keys(q.channels)) dims.push([q.source.channelField ?? 'channel', v]);
    for (const g of AGE_GROUP_LABELS) dims.push(['edad', g]);
    for (const [dimension, value] of dims) {
      await this.summarizeFiltered(q.id, dimension, value, true);
    }
    return dims.length;
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
  async anomalies(surveyId: string, day?: string): Promise<unknown> {
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
    // Por DÍA (últimos 90) — para el gráfico diario y el selector de día.
    const daily = await this.prisma.$queryRawUnsafe<Array<{ day: string; count: number }>>(
      `SELECT to_char(date_trunc('day', ${timeExpr}), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
       FROM ${src.table} WHERE ${timeExpr} >= now() - interval '90 days'
       GROUP BY 1 ORDER BY 1`,
    );
    // Por HORA: si se indica un día, solo ese día; si no, las últimas 48 h.
    const validDay = typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '';
    const hourly = validDay
      ? await this.prisma.$queryRawUnsafe<Array<{ hour: string; count: number }>>(
          `SELECT to_char(date_trunc('hour', ${timeExpr}), 'YYYY-MM-DD HH24:00') AS hour, COUNT(*)::int AS count
           FROM ${src.table} WHERE ${timeExpr}::date = $1::date
           GROUP BY 1 ORDER BY 1`,
          validDay,
        )
      : await this.prisma.$queryRawUnsafe<Array<{ hour: string; count: number }>>(
          `SELECT to_char(date_trunc('hour', ${timeExpr}), 'YYYY-MM-DD HH24:00') AS hour, COUNT(*)::int AS count
           FROM ${src.table} WHERE ${timeExpr} >= now() - interval '48 hours'
           GROUP BY 1 ORDER BY 1`,
        );
    return { byDevice, duplicateAnswers: { groups: dup?.groups ?? 0, max: dup?.max ?? 0 }, daily, hourly, day: validDay };
  }
}
