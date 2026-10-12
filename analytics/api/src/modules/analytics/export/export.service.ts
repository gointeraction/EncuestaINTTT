import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import {
  PRIMARY_QUESTIONNAIRE,
  QUESTIONNAIRES,
  type Questionnaire,
} from '../read-model/questionnaires.js';
import { derivedValue } from '../read-model/answers-analysis.js';

/** RFC 4180: comillas dobles y comas/saltos escapados. */
function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Enmascara un dato personal (non-admin); el valor real nunca sale del servidor. */
function pii(value: unknown): unknown {
  return value === null || value === undefined || value === '' ? '' : '***';
}

/** Serializa un valor de respuesta (escalar, lista u objeto) a texto plano. */
function format(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(' | ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function safeJson(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** CSV con BOM (Excel) + CRLF. */
function toCsv(rows: unknown[][]): string {
  return '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/**
 * ExportService — genera CSV desde la captura REAL (registry-driven, tabla
 * `legacy_survey_responses`). Dos salidas: la DEFINICIÓN del cuestionario y los
 * DATOS recolectados (JSON `answers` aplanado), con PII enmascarada para no-admin.
 */
@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  private questionnaire(surveyId: string): Questionnaire {
    return QUESTIONNAIRES.find((q) => q.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
  }

  /** Catálogo del cuestionario: orden, id, etiqueta, origen (propia/derivada) y fuentes. */
  generateQuestionnaireCsv(surveyId: string): string {
    const q = this.questionnaire(surveyId);
    const rows: unknown[][] = [['orden', 'id', 'etiqueta', 'origen', 'fuentes']];
    let i = 1;
    for (const [id, label] of Object.entries(q.labels)) {
      rows.push([i++, id, label, 'propia', '']);
    }
    for (const d of q.derived ?? []) {
      rows.push([i++, d.id, d.label, 'derivada (autocontestada)', d.sources.join(' | ')]);
    }
    return toCsv(rows);
  }

  /** Datos recolectados: una fila por entrevista, una columna por pregunta (+ derivadas). */
  async generateCollectedCsv(surveyId: string, mask: boolean): Promise<string> {
    const q = this.questionnaire(surveyId);
    const src = q.source;
    const orderField = src.captureField ?? src.timeField ?? 'id';
    const rows = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM ${src.table} ORDER BY "${orderField}" ASC NULLS LAST`,
    );

    const chan = src.channelField ?? 'channel';
    const dev = src.deviceField;
    const sorteo = src.sorteoField ?? 'participaSorteo';
    const qids = Object.keys(q.labels);
    const derived = q.derived ?? [];

    const header: unknown[] = [
      'id',
      chan,
      ...(dev ? [dev] : []),
      src.segmentsField,
      'capturedAt',
      'completedAt',
      sorteo,
      'nombre',
      'cedula',
      'telefono',
      'codigoSorteo',
      ...qids.map((id) => q.labels[id]),
      ...derived.map((d) => d.label),
    ];

    const lines = rows.map((r) => {
      const answers = safeJson(r[src.answersField]);
      const cells: unknown[] = [
        r.id,
        r[chan],
        ...(dev ? [r[dev]] : []),
        r[src.segmentsField],
        r.capturedAt,
        r.completedAt,
        r[sorteo],
        mask ? pii(r.nombre) : r.nombre,
        mask ? pii(r.cedula) : r.cedula,
        mask ? pii(r.telefono) : r.telefono,
        r.codigoSorteo,
        ...qids.map((id) => format(answers[id])),
        ...derived.map((d) => format(derivedValue(d, answers))),
      ];
      return cells.map(csvCell).join(',');
    });

    return '\uFEFF' + [header.map(csvCell).join(','), ...lines].join('\r\n') + '\r\n';
  }
}
