import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Enmascara un dato personal (se aplica en el servidor según el rol). */
function maskValue(value: string | null): string | null {
  return value ? '***' : null;
}

/** ReportingService — lee los read models y consulta `public` (solo lectura). */
@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async surveyDashboard(surveyId: string): Promise<unknown | null> {
    const row = await this.prisma.surveySummaryReport.findUnique({ where: { surveyId } });
    return row ? JSON.parse(row.summaryData) : null;
  }

  async globalDashboard(): Promise<unknown | null> {
    const row = await this.prisma.globalDashboard.findUnique({ where: { id: 'latest' } });
    return row ? JSON.parse(row.payload) : null;
  }

  /** Tabla cruzada entre dos preguntas de una encuesta (read-only sobre public). */
  async crossTab(surveyId: string, questionA: string, questionB: string): Promise<unknown> {
    const cells = await this.prisma.$queryRaw<Array<{ v1: string; v2: string; n: number }>>`
      SELECT
        COALESCE(a1.value_text, '') AS v1,
        COALESCE(a2.value_text, '') AS v2,
        COUNT(*)::int AS n
      FROM public.answers a1
      JOIN public.answers a2 ON a1.response_id = a2.response_id
      WHERE a1.question_id = ${questionA} AND a2.question_id = ${questionB}
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
}
