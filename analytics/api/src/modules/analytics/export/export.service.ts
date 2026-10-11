import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

interface QuestionRow {
  id: string;
  label: string;
}
interface ResponseRow {
  id: string;
  status: string;
  channel: string;
  submitted_at: Date | null;
  respondent_token: string | null;
  email_hash: string | null;
}
interface AnswerRow {
  response_id: string;
  question_id: string;
  value_text: string | null;
  value_numeric: number | null;
  value_options: string | null;
}

/** RFC 4180: comillas dobles y comas/saltos escapados. */
function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * ExportService — genera el CSV de una encuesta desde `public` (solo lectura),
 * con enmascaramiento de PII aplicado en el servidor según el rol.
 */
@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  /** Enmascara un dato personal; el valor real nunca sale del servidor. */
  maskPii(value: string | null): string {
    return value ? '***' : '';
  }

  async generateSurveyCsv(surveyId: string, mask: boolean): Promise<string> {
    const questions = await this.prisma.$queryRaw<QuestionRow[]>`
      SELECT id::text AS id, label
      FROM public.questions
      WHERE survey_id = ${surveyId}
      ORDER BY position ASC
    `;
    const responses = await this.prisma.$queryRaw<ResponseRow[]>`
      SELECT id::text AS id, status, channel, submitted_at, respondent_token, email_hash
      FROM public.responses
      WHERE survey_id = ${surveyId}
      ORDER BY submitted_at ASC NULLS LAST
    `;
    const answers = await this.prisma.$queryRaw<AnswerRow[]>`
      SELECT
        response_id::text AS response_id,
        question_id::text AS question_id,
        value_text,
        value_numeric::float8 AS value_numeric,
        value_options::text AS value_options
      FROM public.answers
      WHERE question_id IN (SELECT id FROM public.questions WHERE survey_id = ${surveyId})
    `;
    const byResponse = new Map<string, Map<string, AnswerRow>>();
    for (const a of answers) {
      const inner = byResponse.get(a.response_id) ?? new Map<string, AnswerRow>();
      inner.set(a.question_id, a);
      byResponse.set(a.response_id, inner);
    }

    const header = [
      'response_id',
      'status',
      'channel',
      'submitted_at',
      'participante',
      ...questions.map((q) => q.label),
    ];
    const lines = [header.map(csvCell).join(',')];
    for (const r of responses) {
      const pii = r.respondent_token ?? r.email_hash ?? '';
      const cells: unknown[] = [
        r.id,
        r.status,
        r.channel,
        r.submitted_at ? new Date(r.submitted_at).toISOString() : '',
        mask ? this.maskPii(pii) : pii,
        ...questions.map((q) => {
          const a = byResponse.get(r.id)?.get(q.id);
          if (!a) return '';
          if (a.value_text !== null) return a.value_text;
          if (a.value_numeric !== null) return String(a.value_numeric);
          return a.value_options ?? '';
        }),
      ];
      lines.push(cells.map(csvCell).join(','));
    }
    return '\uFEFF' + lines.join('\r\n') + '\r\n';
  }
}
