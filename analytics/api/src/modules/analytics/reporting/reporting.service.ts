import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Dimensión de filtro: una pregunta categórica usable para segmentar. */
export interface FilterDimension {
  id: string;
  label: string;
  type: string;
  options: Array<{ label: string; value: string }>;
}

/** Punto de la línea de tiempo (respuestas por día). */
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
 * ReportingService — lee los read models y consulta `public` (solo lectura).
 * Aporta las herramientas de visualización: panel (global y segmentado por una
 * dimensión de filtro), catálogo de dimensiones, cruce, línea de tiempo y participantes.
 */
@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Panel de la encuesta: precalculado sin filtro; segmentado en vivo con `dimension`+`value`. */
  async surveyDashboard(surveyId: string, dimension?: string, value?: string): Promise<unknown> {
    if (!dimension || !value) {
      const row = await this.prisma.surveySummaryReport.findUnique({ where: { surveyId } });
      return row ? JSON.parse(row.summaryData) : null;
    }
    return this.segmentedDashboard(surveyId, dimension, value);
  }

  async globalDashboard(): Promise<unknown> {
    const row = await this.prisma.globalDashboard.findUnique({ where: { id: 'latest' } });
    return row ? JSON.parse(row.payload) : null;
  }

  /** Dimensiones de filtro disponibles: preguntas categóricas y sus opciones. */
  async dimensions(surveyId: string): Promise<FilterDimension[]> {
    const questions = await this.prisma.$queryRaw<Array<{ id: string; type: string; label: string }>>`
      SELECT id::text AS id, type, label
      FROM public.questions
      WHERE survey_id = ${surveyId}
        AND type IN ('single_choice', 'dropdown', 'multi_choice')
      ORDER BY position ASC
      LIMIT 50
    `;
    const out: FilterDimension[] = [];
    for (const q of questions) {
      const options = await this.prisma.$queryRaw<Array<{ label: string; value: string }>>`
        SELECT label, value
        FROM public.question_options
        WHERE question_id = ${q.id}
        ORDER BY position ASC
        LIMIT 100
      `;
      out.push({ id: q.id, label: q.label, type: q.type, options });
    }
    return out;
  }

  /** Respuestas por día (línea de tiempo). */
  async timeline(surveyId: string): Promise<TimelinePoint[]> {
    const rows = await this.prisma.$queryRaw<Array<{ day: Date; total: number; completed: number }>>`
      SELECT date_trunc('day', created_at) AS day,
             COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE status = 'completed')::int AS completed
      FROM public.responses
      WHERE survey_id = ${surveyId}
      GROUP BY 1
      ORDER BY 1 ASC
      LIMIT 400
    `;
    return rows.map((r) => ({
      day: new Date(r.day).toISOString().slice(0, 10),
      total: r.total,
      completed: r.completed,
    }));
  }

  /** Tabla cruzada entre dos preguntas de Visión Cero (read-only sobre la captura legacy). */
  async crossTab(surveyId: string, questionA: string, questionB: string): Promise<unknown> {
    const cells = await this.prisma.$queryRaw<Array<{ v1: string; v2: string; n: number }>>`
      SELECT
        COALESCE(answers::jsonb ->> ${questionA}, '') AS v1,
        COALESCE(answers::jsonb ->> ${questionB}, '') AS v2,
        COUNT(*)::int AS n
      FROM public.legacy_survey_responses
      WHERE answers IS NOT NULL
      GROUP BY v1, v2
      ORDER BY n DESC
      LIMIT 500
    `;
    const categoriesA = [...new Set(cells.map((c) => c.v1))];
    const categoriesB = [...new Set(cells.map((c) => c.v2))];
    return { surveyId, questionA, questionB, categoriesA, categoriesB, cells };
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

  // ─── herramientas de visualización sobre `public` (read-only) ───────────────

  /**
   * Panel segmentado: acota las respuestas a quienes contestaron `dimension = value`
   * y recomputa el desglose en vivo (nunca escribe; solo SELECT).
   */
  private async segmentedDashboard(surveyId: string, dimension: string, value: string): Promise<unknown> {
    const scope = Prisma.sql`
      SELECT a0.response_id
      FROM public.answers a0
      WHERE a0.question_id = ${dimension}
        AND (a0.value_text = ${value} OR (a0.value_options IS NOT NULL AND a0.value_options ? ${value}))
    `;
    const [row] = await this.prisma.$queryRaw<
      Array<{ total: number; completed: number; abandoned: number; in_progress: number }>
    >`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'abandoned')::int AS abandoned,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress
      FROM public.responses
      WHERE survey_id = ${surveyId} AND id IN (${scope})
    `;
    const totals = row ?? { total: 0, completed: 0, abandoned: 0, in_progress: 0 };
    const questions = await this.breakdown(surveyId, scope);
    return {
      surveyId,
      segment: { dimension, value },
      totals: {
        ...totals,
        completionRate: totals.total ? totals.completed / totals.total : 0,
        abandonmentRate: totals.total ? totals.abandoned / totals.total : 0,
      },
      questions,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Desglose por pregunta acotado a un conjunto de respuestas (scope). */
  private async breakdown(surveyId: string, scope: Prisma.Sql): Promise<unknown[]> {
    const questions = await this.prisma.$queryRaw<
      Array<{ id: string; type: string; label: string; position: number }>
    >`
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
          WHERE question_id = ${q.id} AND response_id IN (${scope})
          GROUP BY value
          ORDER BY count DESC
          LIMIT 50
        `;
        out.push({ ...base, kind: 'choice', options });
      } else if (q.type === 'multi_choice') {
        const options = await this.prisma.$queryRaw<Array<{ value: string; count: number }>>`
          SELECT opt AS value, COUNT(*)::int AS count
          FROM public.answers a, jsonb_array_elements_text(a.value_options) AS opt
          WHERE a.question_id = ${q.id} AND a.value_options IS NOT NULL AND a.response_id IN (${scope})
          GROUP BY opt
          ORDER BY count DESC
          LIMIT 50
        `;
        out.push({ ...base, kind: 'choice', options });
      } else if (q.type === 'scale' || q.type === 'rating') {
        const distribution = await this.prisma.$queryRaw<Array<{ value: number; count: number }>>`
          SELECT value_numeric::float8 AS value, COUNT(*)::int AS count
          FROM public.answers
          WHERE question_id = ${q.id} AND value_numeric IS NOT NULL AND response_id IN (${scope})
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
          WHERE question_id = ${q.id} AND value_text IS NOT NULL AND response_id IN (${scope})
          ORDER BY created_at DESC
          LIMIT 10
        `;
        out.push({ ...base, kind: 'text', comments: comments.map((c) => c.value) });
      }
    }
    return out;
  }
}
