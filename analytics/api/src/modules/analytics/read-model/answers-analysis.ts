import type { DerivedQuestion, Questionnaire } from './questionnaires.js';

export interface QuestionAgg {
  id: string;
  type: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  /** Nº de cuestionarios que respondieron ESTA pregunta (la base de cálculo). */
  base: number;
  options: Array<{ value: string; count: number }>;
  /** Distribución valor→conteo (preguntas numéricas/escala). */
  distribution?: Array<{ value: number; count: number }>;
  average: number | null;
}

/** Grupos de edad (dimensión derivada `edad`). */
const AGE_GROUPS: Record<string, [number, number]> = {
  '14-24': [14, 24],
  '25-34': [25, 34],
  '35-44': [35, 44],
  '45-54': [45, 54],
  '55+': [55, 120],
};
export const AGE_GROUP_LABELS = Object.keys(AGE_GROUPS);

const SAFE_ID = /^[a-z_]+$/i;

/**
 * Construye el `WHERE` de un filtro `(dimension, value)` sobre la fuente del cuestionario.
 * - envelope (driverType/channel) → columna.
 * - derivada (edad) → rango sobre el entero.
 * - respuesta → clave del JSON (o miembro, para múltiple).
 */
export function buildFilterWhere(
  q: Questionnaire,
  dimension: string,
  value: string,
): { sql: string; params: unknown[] } {
  if (!SAFE_ID.test(dimension)) throw new Error(`Dimensión inválida: ${dimension}`);
  const af = q.source.answersField;
  if (dimension === q.source.segmentsField || dimension === q.source.channelField) {
    return { sql: `WHERE "${dimension}" = $1`, params: [value] };
  }
  if (dimension === 'edad' && AGE_GROUPS[value]) {
    const [a, b] = AGE_GROUPS[value];
    return { sql: `WHERE ("${af}"::jsonb ->> 'edad')::int BETWEEN $1 AND $2`, params: [a, b] };
  }
  return {
    sql: `WHERE (("${af}"::jsonb ->> '${dimension}') = $1 OR ("${af}"::jsonb -> '${dimension}') ? $1)`,
    params: [value],
  };
}

/** Distribución por segmento (driverType). */
export function bySegment(rows: Array<{ seg: string }>): Array<{ id: string; responses: number }> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.seg, (m.get(r.seg) ?? 0) + 1);
  return [...m.entries()]
    .map(([id, responses]) => ({ id, responses }))
    .sort((a, b) => b.responses - a.responses);
}

/** Agrega el JSON de respuestas (categóricas y numéricas) del cuestionario, pregunta por pregunta. */
export function aggregateAnswers(
  q: Questionnaire,
  rows: Array<{ answers: string }>,
): { questions: QuestionAgg[]; total: number } {
  const cats = new Map<string, Map<string, number>>();
  const multi = new Set<string>();
  const nums = new Map<string, { sum: number; count: number }>();
  const numDist = new Map<string, Map<number, number>>(); // distribución de numéricas
  const rowsByKey = new Map<string, number>(); // base por pregunta (cuestionarios que la respondieron)
  const derivedCats = new Map<string, Map<string, number>>(); // autocontestadas (derivadas)
  let total = 0;
  for (const row of rows) {
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(row.answers) as Record<string, unknown>;
    } catch {
      continue;
    }
    total++;
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        if (v.length === 0) continue;
        rowsByKey.set(k, (rowsByKey.get(k) ?? 0) + 1);
        multi.add(k);
        const m = cats.get(k) ?? new Map<string, number>();
        for (const x of v) m.set(String(x), (m.get(String(x)) ?? 0) + 1);
        cats.set(k, m);
      } else if (typeof v === 'number') {
        rowsByKey.set(k, (rowsByKey.get(k) ?? 0) + 1);
        const n = nums.get(k) ?? { sum: 0, count: 0 };
        n.sum += v;
        n.count++;
        nums.set(k, n);
        const dm = numDist.get(k) ?? new Map<number, number>();
        dm.set(v, (dm.get(v) ?? 0) + 1);
        numDist.set(k, dm);
      } else if (v !== null && v !== undefined && v !== '') {
        rowsByKey.set(k, (rowsByKey.get(k) ?? 0) + 1);
        const m = cats.get(k) ?? new Map<string, number>();
        m.set(String(v), (m.get(String(v)) ?? 0) + 1);
        cats.set(k, m);
      }
    }
    // Preguntas AUTOCONTESTADAS: se responden desde las respuestas de esta fila.
    for (const d of q.derived ?? []) {
      const value = derivedValue(d, obj);
      if (value != null) {
        const m = derivedCats.get(d.id) ?? new Map<string, number>();
        m.set(value, (m.get(value) ?? 0) + 1);
        derivedCats.set(d.id, m);
      }
    }
  }
  const questions: QuestionAgg[] = [];
  for (const [k, m] of cats) {
    questions.push({
      id: k,
      type: multi.has(k) ? 'multi_choice' : 'single_choice',
      label: q.labels[k] ?? k,
      kind: 'choice',
      base: rowsByKey.get(k) ?? 0,
      options: [...m.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30),
      average: null,
    });
  }
  for (const [k, n] of nums) {
    questions.push({
      id: k,
      type: 'number',
      label: q.labels[k] ?? k,
      kind: 'numeric',
      base: rowsByKey.get(k) ?? 0,
      options: q.bins?.[k] ? binOptions(q.bins[k], numDist.get(k)) : [],
      distribution: [...(numDist.get(k) ?? new Map<number, number>()).entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value - b.value),
      average: n.count ? n.sum / n.count : null,
    });
  }
  // Preguntas autocontestadas: se emiten como preguntas categóricas de primera clase.
  for (const d of q.derived ?? []) {
    const m = derivedCats.get(d.id);
    if (!m) continue;
    const options = [...m.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
    questions.push({
      id: d.id,
      type: 'single_choice',
      label: d.label,
      kind: 'choice',
      base: options.reduce((s, o) => s + o.count, 0),
      options,
      average: null,
    });
  }
  questions.sort((a, b) => a.id.localeCompare(b.id));
  return { questions, total };
}

/** Valor de una pregunta autocontestada a partir de las respuestas de la fila. */
function derivedValue(d: DerivedQuestion, obj: Record<string, unknown>): string | null {
  if (d.compute) return d.compute(obj);
  const src = d.sources[0];
  if (d.bins && src) {
    const v = obj[src];
    if (typeof v === 'number') return binLabel(d.bins, v);
  }
  return null;
}

/** Etiqueta del rango al que pertenece un valor numérico (último rango abierto: "X+"). */
function binLabel(bounds: number[], v: number): string {
  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i];
    const hi = bounds[i + 1];
    const isLast = i === bounds.length - 2;
    if (v >= lo && (isLast || v < hi)) return isLast ? `${lo}+` : `${lo}-${hi - 1}`;
  }
  return String(v);
}

/** Agrupa una distribución numérica en rangos (bins): "0-4", "5-9", "10+". */
function binOptions(
  bounds: number[],
  dist?: Map<number, number>,
): Array<{ value: string; count: number }> {
  const out: Array<{ value: string; count: number }> = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i];
    const hi = bounds[i + 1];
    const isLast = i === bounds.length - 2;
    let count = 0;
    if (dist) {
      for (const [v, c] of dist) {
        if (v >= lo && (isLast || v < hi)) count += c;
      }
    }
    out.push({ value: isLast ? `${lo}+` : `${lo}-${hi - 1}`, count });
  }
  return out;
}
