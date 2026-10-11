import type { Questionnaire } from './questionnaires.js';

export interface QuestionAgg {
  id: string;
  type: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  options: Array<{ value: string; count: number }>;
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
        multi.add(k);
        const m = cats.get(k) ?? new Map<string, number>();
        for (const x of v) m.set(String(x), (m.get(String(x)) ?? 0) + 1);
        cats.set(k, m);
      } else if (typeof v === 'number') {
        const n = nums.get(k) ?? { sum: 0, count: 0 };
        n.sum += v;
        n.count++;
        nums.set(k, n);
      } else if (v !== null && v !== undefined && v !== '') {
        const m = cats.get(k) ?? new Map<string, number>();
        m.set(String(v), (m.get(String(v)) ?? 0) + 1);
        cats.set(k, m);
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
      options: [],
      average: n.count ? n.sum / n.count : null,
    });
  }
  questions.sort((a, b) => a.id.localeCompare(b.id));
  return { questions, total };
}
