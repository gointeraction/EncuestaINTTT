import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { buildConditionsWhere } from '../read-model/answers-analysis.js';
import { QUESTIONNAIRES, PRIMARY_QUESTIONNAIRE } from '../read-model/questionnaires.js';
import { AGE_GROUP_LABELS } from '../read-model/answers-analysis.js';
import { ReadModelService } from '../read-model/read-model.service.js';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Dimensión de filtro: envelope (columna), derivada o pregunta categórica. */
export interface FilterDimension {
  id: string;
  label: string;
  type: string;
  options: Array<{ label: string; value: string }>;
}

/** Punto de la línea de tiempo (cuestionarios respondidos por día). */
export interface TimelinePoint {
  day: string;
  total: number;
  completed: number;
}

/** Enmascara un dato personal (se aplica en el servidor según el rol). */
function maskValue(value: string | null): string | null {
  return value ? '***' : null;
}

/**
 * ReportingService — lee los read models y, con filtros, consulta la captura (solo lectura).
 * A2: analysis-filtering.md. Las dimensiones y la fuente se derivan del REGISTRO de cuestionarios.
 */
@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readModel: ReadModelService,
  ) {}

  /** Panel de la encuesta: materializado sin filtro; filtrado en vivo con `dimension`+`value`. */
  async surveyDashboard(surveyId: string, dimension?: string, value?: string): Promise<unknown> {
    if (dimension && value) {
      return this.readModel.summarizeFiltered(surveyId, dimension, value);
    }
    const row = await this.prisma.surveySummaryReport.findUnique({ where: { surveyId } });
    return row ? JSON.parse(row.summaryData) : null;
  }

  async globalDashboard(): Promise<unknown> {
    const row = await this.prisma.globalDashboard.findUnique({ where: { id: 'latest' } });
    return row ? JSON.parse(row.payload) : null;
  }

  /** Dimensiones de filtro disponibles: envelope + derivada (edad) + preguntas categóricas. */
  async dimensions(surveyId: string): Promise<FilterDimension[]> {
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const out: FilterDimension[] = [
      {
        id: q.source.segmentsField,
        label: 'Tipo de conductor',
        type: 'envelope',
        options: Object.entries(q.segments).map(([value, label]) => ({ value, label })),
      },
      {
        id: q.source.channelField ?? 'channel',
        label: 'Canal',
        type: 'envelope',
        options: Object.entries(q.channels).map(([value, label]) => ({ value, label })),
      },
      {
        id: 'edad',
        label: 'Edad',
        type: 'derived',
        options: AGE_GROUP_LABELS.map((g) => ({ value: g, label: g })),
      },
    ];

    const row = await this.prisma.surveySummaryReport.findUnique({ where: { surveyId: q.id } });
    if (row) {
      const data = JSON.parse(row.summaryData) as {
        questions?: Array<{ id: string; label: string; kind: string; options?: Array<{ value: string; count: number }> }>;
      };
      for (const qu of data.questions ?? []) {
        if (qu.kind !== 'choice') continue;
        out.push({
          id: qu.id,
          label: qu.label,
          type: 'choice',
          options: (qu.options ?? []).map((o) => ({ value: o.value, label: o.value })),
        });
      }
    }
    return out;
  }

  /** Cuestionarios respondidos por día. */
  timeline(surveyId: string): Promise<TimelinePoint[]> {
    return this.readModel.timeline(surveyId);
  }

  /** Resumen en vivo con un conjunto de filtros (multi-valor, AND/OR). */
  filtered(
    surveyId: string,
    conditions: Array<{ questionId: string; values: string[] }>,
    combinator: 'and' | 'or',
  ): Promise<unknown> {
    return this.readModel.summarizeWithFilters(surveyId, conditions, combinator);
  }

  /** Panel de anomalías (anti-fraude). */
  anomalies(surveyId: string): Promise<unknown> {
    return this.readModel.anomalies(surveyId);
  }

  /** Tabla cruzada entre dos preguntas del cuestionario (read-only sobre la captura real). */
  async crossTab(
    surveyId: string,
    questionA: string,
    questionB: string,
    conditions?: Array<{ questionId: string; values: string[] }>,
    combinator: 'and' | 'or' = 'and',
  ): Promise<unknown> {
    const src = PRIMARY_QUESTIONNAIRE.source;
    const qq = PRIMARY_QUESTIONNAIRE;
    const { sql, params } = buildConditionsWhere(qq, conditions, combinator);
    const where = sql
      ? `${sql} AND "${src.answersField}" IS NOT NULL`
      : `WHERE "${src.answersField}" IS NOT NULL`;
    const pA = params.length + 1;
    const pB = params.length + 2;
    const cells = await this.prisma.$queryRawUnsafe<Array<{ v1: string; v2: string; n: number }>>(
      `SELECT
         COALESCE("${src.answersField}"::jsonb ->> $${pA}, '') AS v1,
         COALESCE("${src.answersField}"::jsonb ->> $${pB}, '') AS v2,
         COUNT(*)::int AS n
       FROM ${src.table}
       ${where}
       GROUP BY v1, v2
       ORDER BY n DESC
       LIMIT 500`,
      ...params,
      questionA,
      questionB,
    );
    const categoriesA = [...new Set(cells.map((c) => c.v1))];
    const categoriesB = [...new Set(cells.map((c) => c.v2))];
    // Base por pregunta (cuestionarios que respondieron cada una) y base del cruce.
    const baseA = cells.filter((c) => c.v1 !== '').reduce((s, c) => s + c.n, 0);
    const baseB = cells.filter((c) => c.v2 !== '').reduce((s, c) => s + c.n, 0);
    const baseBoth = cells.filter((c) => c.v1 !== '' && c.v2 !== '').reduce((s, c) => s + c.n, 0);
    return { surveyId, questionA, questionB, baseA, baseB, baseBoth, categoriesA, categoriesB, cells };
  }

  /** Lista paginada de participantes del sorteo (read-only); PII enmascarada por rol. */
  async participants(page: number, limit: number, mask: boolean): Promise<Page<unknown>> {
    const offset = (page - 1) * limit;
    const [totals] = await this.prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total
      FROM public.legacy_survey_responses
      WHERE "participaSorteo" = true
    `;
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        nombre: string | null;
        cedula: string | null;
        telefono: string | null;
        codigo: string | null;
        momento: Date | null;
      }>
    >`
      SELECT id, nombre, cedula, telefono, "codigoSorteo" AS codigo, "completedAt" AS momento
      FROM public.legacy_survey_responses
      WHERE "participaSorteo" = true
      ORDER BY "completedAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const items = rows.map((r) => ({
      id: r.id,
      momento: r.momento,
      codigo: r.codigo,
      nombre: mask ? maskValue(r.nombre) : r.nombre,
      cedula: mask ? maskValue(r.cedula) : r.cedula,
      telefono: mask ? maskValue(r.telefono) : r.telefono,
    }));
    const total = totals?.total ?? 0;
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }
}
