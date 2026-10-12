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

/** Serializa una fecha a ISO (o el valor tal cual). */
function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return value === null || value === undefined ? '' : String(value);
}

/** Tamaño de lote del export (filas por consulta) — evita cargar todo en memoria. */
const EXPORT_CHUNK = 25_000;

/**
 * ExportService — genera CSV desde la captura REAL (registry-driven). Dos salidas:
 * la DEFINICIÓN del cuestionario y los DATOS recolectados. Los datos se emiten **por
 * lotes** (streaming) para escalar a millones de filas sin agotar memoria; la PII se
 * enmascara para no-admin.
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
    return '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }

  /**
   * Datos recolectados en CSV, emitidos EN TROZOS (una fila por entrevista, una columna
   * por pregunta + derivadas). Primero el BOM + la cabecera; luego lotes de filas.
   */
  async *collectedCsvChunks(surveyId: string, mask: boolean): AsyncGenerator<string> {
    const q = this.questionnaire(surveyId);
    const src = q.source;
    const orderField = src.captureField ?? src.timeField ?? 'id';
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
    yield '\uFEFF' + header.map(csvCell).join(',') + '\r\n';

    let offset = 0;
    for (;;) {
      const rows = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM ${src.table} ORDER BY "${orderField}" ASC NULLS LAST LIMIT ${EXPORT_CHUNK} OFFSET ${offset}`,
      );
      if (rows.length === 0) break;
      let out = '';
      for (const r of rows) {
        const answers = safeJson(r[src.answersField]);
        const cells: unknown[] = [
          r.id,
          r[chan],
          ...(dev ? [r[dev]] : []),
          r[src.segmentsField],
          iso(r.capturedAt),
          iso(r.completedAt),
          r[sorteo],
          mask ? pii(r.nombre) : r.nombre,
          mask ? pii(r.cedula) : r.cedula,
          mask ? pii(r.telefono) : r.telefono,
          r.codigoSorteo,
          ...qids.map((id) => format(answers[id])),
          ...derived.map((d) => format(derivedValue(d, answers))),
        ];
        out += cells.map(csvCell).join(',') + '\r\n';
      }
      yield out;
      offset += rows.length;
      if (rows.length < EXPORT_CHUNK) break;
    }
  }
  /**
   * CSV LARGO (tidy): una fila por (encuesta × pregunta respondida). Ideal para VERIFICAR
   * y pivotar en Excel/pandas/R/DuckDB/Power BI sin transformar.
   */
  async *collectedLongCsvChunks(surveyId: string): AsyncGenerator<string> {
    const q = this.questionnaire(surveyId);
    const src = q.source;
    const orderField = src.captureField ?? src.timeField ?? 'id';
    const chan = src.channelField ?? 'channel';
    const sorteo = src.sorteoField ?? 'participaSorteo';
    const qids = Object.keys(q.labels);
    yield (
      '\uFEFF' +
      ['response_id', 'survey_id', src.segmentsField, chan, 'capturedAt', 'completedAt', sorteo, 'question_id', 'question_label', 'value']
        .map(csvCell)
        .join(',') +
      '\r\n'
    );

    let offset = 0;
    for (;;) {
      const rows = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM ${src.table} ORDER BY "${orderField}" ASC NULLS LAST LIMIT ${EXPORT_CHUNK} OFFSET ${offset}`,
      );
      if (rows.length === 0) break;
      let out = '';
      for (const r of rows) {
        const answers = safeJson(r[src.answersField]);
        for (const qid of qids) {
          const value = answers[qid];
          if (value === undefined || value === null || value === '') continue;
          out +=
            [r.id, q.id, r[src.segmentsField], r[chan], iso(r.capturedAt), iso(r.completedAt), r[sorteo], qid, q.labels[qid], format(value)]
              .map(csvCell)
              .join(',') + '\r\n';
        }
      }
      yield out;
      offset += rows.length;
      if (rows.length < EXPORT_CHUNK) break;
    }
  }

  /** JSONL (NDJSON): un objeto por línea con el JSON CRUDO de cada encuesta (como el seed). */
  async *collectedRawJsonlChunks(surveyId: string, mask: boolean): AsyncGenerator<string> {
    const q = this.questionnaire(surveyId);
    const src = q.source;
    const orderField = src.captureField ?? src.timeField ?? 'id';
    let offset = 0;
    for (;;) {
      const rows = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM ${src.table} ORDER BY "${orderField}" ASC NULLS LAST LIMIT ${EXPORT_CHUNK} OFFSET ${offset}`,
      );
      if (rows.length === 0) break;
      let out = '';
      for (const r of rows) {
        const obj: Record<string, unknown> = { ...r, survey_id: q.id, answers: safeJson(r[src.answersField]) };
        if (mask) {
          obj['nombre'] = pii(r['nombre']);
          obj['cedula'] = pii(r['cedula']);
          obj['telefono'] = pii(r['telefono']);
        }
        out += JSON.stringify(obj) + '\n';
      }
      yield out;
      offset += rows.length;
      if (rows.length < EXPORT_CHUNK) break;
    }
  }
}
