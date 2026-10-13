import type { DerivedQuestion, Questionnaire } from './questionnaires.js';

export interface QuestionAgg {
  id: string;
  type: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  /** true si es una pregunta AUTOCONTESTADA (derivada). */
  derived?: boolean;
  /** Preguntas de origen de una autocontestada. */
  sources?: string[];
  /** Número de referencia (orden en el cuestionario) para ubicarla en selectores. */
  position?: number;
  /** Nº de cuestionarios que respondieron ESTA pregunta (la base de cálculo). */
  base: number;
  options: Array<{ value: string; count: number }>;
  /** Distribución valor→conteo (preguntas numéricas/escala). */
  distribution?: Array<{ value: number; count: number }>;
  /** Estadísticos de una pregunta numérica. */
  stats?: {
    count: number;
    mean: number;
    median: number;
    mode: number;
    stdDev: number;
    min: number;
    max: number;
  };
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
    return { sql: `WHERE ("${af}" ->> 'edad')::int BETWEEN $1 AND $2`, params: [a, b] };
  }
  // CONTENCIÓN (`@>`) para que el predicado sea INDEXABLE por el GIN de `answers`:
  //   escalar → {"q":"v"}   ·   miembro de array → {"q":["v"]}
  // (antes usaba `->> =` + `?`, que no usa el índice y forzaba seq scan + parse de jsonb).
  return {
    sql: `WHERE ("${af}" @> $1::jsonb OR "${af}" @> $2::jsonb)`,
    params: [JSON.stringify({ [dimension]: value }), JSON.stringify({ [dimension]: [value] })],
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
      stats: computeStats(numDist.get(k) ?? new Map<number, number>()),
      average: n.count ? n.sum / n.count : null,
    });
  }
  // Preguntas del REGISTRO que aún no aparecen en los datos: se listan igualmente
  // (la DEFINICIÓN del cuestionario) con base 0, para que el catálogo exista aunque
  // todavía no haya respuestas.
  const observed = new Set<string>([...cats.keys(), ...nums.keys()]);
  for (const [k, label] of Object.entries(q.labels)) {
    if (observed.has(k)) continue;
    if (q.bins?.[k]) {
      questions.push({
        id: k,
        type: 'number',
        label,
        kind: 'numeric',
        base: 0,
        options: [],
        distribution: [],
        stats: computeStats(new Map()),
        average: null,
      });
    } else {
      questions.push({
        id: k,
        type: 'single_choice',
        label,
        kind: 'choice',
        base: 0,
        options: [],
        average: null,
      });
    }
  }
  // Preguntas autocontestadas (derivadas): se emiten como preguntas de primera clase,
  // aunque no haya datos (base 0).
  for (const d of q.derived ?? []) {
    const m = derivedCats.get(d.id);
    const options = m
      ? [...m.entries()]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      : [];
    questions.push({
      id: d.id,
      type: 'single_choice',
      label: d.label,
      kind: 'choice',
      derived: true,
      sources: d.sources,
      base: options.reduce((s, o) => s + o.count, 0),
      options,
      average: null,
    });
  }
  // Orden estable: primero las preguntas del cuestionario (por el orden del registro),
  // luego las autocontestadas; se numera cada pregunta (referencia para los selectores).
  const order = new Map(Object.keys(q.labels).map((k, i) => [k, i]));
  questions.sort((a, b) => {
    if (!!a.derived !== !!b.derived) return a.derived ? 1 : -1;
    const oa = order.get(a.id);
    const ob = order.get(b.id);
    if (oa != null && ob != null) return oa - ob;
    return a.id.localeCompare(b.id);
  });
  questions.forEach((x, i) => {
    x.position = i + 1;
  });
  return { questions, total };
}

/** Valor de una pregunta autocontestada a partir de las respuestas de la fila. */
export function derivedValue(d: DerivedQuestion, obj: Record<string, unknown>): string | null {
  if (d.compute) return d.compute(obj);
  const src = d.sources[0];
  if (d.bins && src) {
    const v = obj[src];
    if (typeof v === 'number') return binLabel(d.bins, v);
  }
  return null;
}

/** Estadísticos (media, mediana, moda, desviación estándar, mín/máx, N) de una distribución. */
function computeStats(dist: Map<number, number>): {
  count: number;
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
} {
  const entries = [...dist.entries()].sort((a, b) => a[0] - b[0]);
  const count = entries.reduce((s, [, c]) => s + c, 0);
  if (count === 0) return { count: 0, mean: 0, median: 0, mode: 0, stdDev: 0, min: 0, max: 0 };
  let sum = 0;
  let min = entries[0][0];
  let max = entries[0][0];
  let mode = entries[0][0];
  let modeCount = -1;
  for (const [v, c] of entries) {
    sum += v * c;
    if (v < min) min = v;
    if (v > max) max = v;
    if (c > modeCount) {
      modeCount = c;
      mode = v;
    }
  }
  const mean = sum / count;
  let varSum = 0;
  for (const [v, c] of entries) varSum += c * (v - mean) ** 2;
  const stdDev = count > 1 ? Math.sqrt(varSum / (count - 1)) : 0;
  const half = count / 2;
  let acc = 0;
  let median = mean;
  for (const [v, c] of entries) {
    acc += c;
    if (acc >= half) {
      median = v;
      break;
    }
  }
  return { count, mean, median, mode, stdDev, min, max };
}

/** Etiqueta del rango al que pertenece un valor numérico (último rango abierto: "X+"). */
export function binLabel(bounds: number[], v: number): string {
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

/** Prisma mínimo (solo lo que usa la agregación SQL). */
export interface SqlRunner {
  $queryRawUnsafe<T>(sql: string, ...params: unknown[]): Promise<T>;
}

/**
 * Agrega las respuestas EN SQL (una pasada con `jsonb_each`), sin traer las filas al API.
 * Escala a millones de registros con memoria acotada. Soporta categóricas (single/multi),
 * numéricas y derivadas por `bins` (a partir de la distribución de su fuente).
 * (Las derivadas con `compute` a medida NO se soportan aquí.)
 */
export async function aggregateAnswersSql(
  prisma: SqlRunner,
  q: Questionnaire,
  whereSql: string,
  params: unknown[],
): Promise<{ questions: QuestionAgg[]; total: number; byDriverType: Array<{ id: string; responses: number }> }> {
  const table = q.source.table;
  const af = q.source.answersField;
  const seg = q.source.segmentsField;
  const w = whereSql || '';
  const andW = whereSql ? `${whereSql} AND ` : 'WHERE ';

  const byDriverType = await prisma.$queryRawUnsafe<Array<{ id: string; responses: number }>>(
    `SELECT "${seg}" AS id, COUNT(*)::int AS responses FROM ${table} ${w} GROUP BY 1 ORDER BY 2 DESC`,
    ...params,
  );
  // `total` se deriva del propio GROUP BY (cada fila tiene un segmento no nulo) → una
  // pasada completa MENOS por request.
  const total = byDriverType.reduce((s, r) => s + r.responses, 0);

  const explode = `${table} r CROSS JOIN LATERAL jsonb_each(r."${af}") kv`;

  const scalars = await prisma.$queryRawUnsafe<
    Array<{ key: string; sval: string | null; nval: number | null; c: number }>
  >(
    `SELECT kv.key AS key,
            CASE WHEN jsonb_typeof(kv.value) = 'number' THEN NULL ELSE kv.value #>> '{}' END AS sval,
            CASE WHEN jsonb_typeof(kv.value) = 'number' THEN (kv.value #>> '{}')::float8 ELSE NULL END AS nval,
            COUNT(*)::int AS c
     FROM ${explode}
     ${andW}jsonb_typeof(kv.value) <> 'array' AND kv.value <> 'null' AND (kv.value #>> '{}') <> ''
     GROUP BY 1, 2, 3`,
    ...params,
  );

  const arrays = await prisma.$queryRawUnsafe<Array<{ key: string; elem: string; c: number }>>(
    `SELECT kv.key AS key, elem, COUNT(*)::int AS c
     FROM ${table} r
     CROSS JOIN LATERAL jsonb_each(r."${af}") kv
     CROSS JOIN LATERAL jsonb_array_elements_text(kv.value) elem
     ${andW}jsonb_typeof(kv.value) = 'array'
     GROUP BY 1, 2`,
    ...params,
  );

  // Base por clave: los escalares = suma de conteos (cada fila aporta ≤1 por clave);
  // los arrays = filas DISTINTAS con el array no vacío.
  const baseByKey = new Map<string, number>();
  for (const r of scalars) baseByKey.set(r.key, (baseByKey.get(r.key) ?? 0) + r.c);
  const arrayBase = await prisma.$queryRawUnsafe<Array<{ key: string; base: number }>>(
    `SELECT kv.key AS key, COUNT(DISTINCT r.id)::int AS base
     FROM ${explode}
     ${andW}(CASE WHEN jsonb_typeof(kv.value) = 'array' THEN jsonb_array_length(kv.value) ELSE 0 END) > 0
     GROUP BY 1`,
    ...params,
  );
  for (const b of arrayBase) baseByKey.set(b.key, b.base);

  const byKey = new Map<string, { nums: Map<number, number>; cats: Map<string, number> }>();
  for (const r of scalars) {
    const e = byKey.get(r.key) ?? { nums: new Map(), cats: new Map() };
    if (r.nval !== null && r.nval !== undefined) {
      const v = Number(r.nval);
      e.nums.set(v, (e.nums.get(v) ?? 0) + r.c);
    } else if (r.sval !== null) {
      e.cats.set(r.sval, (e.cats.get(r.sval) ?? 0) + r.c);
    }
    byKey.set(r.key, e);
  }
  for (const r of arrays) {
    const e = byKey.get(r.key) ?? { nums: new Map(), cats: new Map() };
    e.cats.set(r.elem, (e.cats.get(r.elem) ?? 0) + r.c);
    byKey.set(r.key, e);
  }
  const multiKeys = new Set(arrays.map((a) => a.key));

  const questions: QuestionAgg[] = [];
  for (const [k, e] of byKey) {
    if (e.nums.size > 0) {
      const sum = [...e.nums].reduce((s, [v, c]) => s + v * c, 0);
      const cnt = [...e.nums.values()].reduce((s, c) => s + c, 0);
      questions.push({
        id: k,
        type: q.types?.[k] ?? 'number',
        label: q.labels[k] ?? k,
        kind: 'numeric',
        base: baseByKey.get(k) ?? 0,
        options: q.bins?.[k] ? binOptions(q.bins[k], e.nums) : [],
        distribution: [...e.nums.entries()]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value - b.value),
        stats: computeStats(e.nums),
        average: cnt ? sum / cnt : null,
      });
    } else if (e.cats.size > 0) {
      questions.push({
        id: k,
        type: multiKeys.has(k) ? 'multi_choice' : 'single_choice',
        label: q.labels[k] ?? k,
        kind: 'choice',
        base: baseByKey.get(k) ?? 0,
        options: [...e.cats.entries()]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 30),
        average: null,
      });
    }
  }

  const observed = new Set(byKey.keys());
  for (const [k, label] of Object.entries(q.labels)) {
    if (observed.has(k)) continue;
    if (q.bins?.[k]) {
      questions.push({
        id: k, type: q.types?.[k] ?? 'number', label, kind: 'numeric', base: 0, options: [],
        distribution: [], stats: computeStats(new Map()), average: null,
      });
    } else {
      questions.push({ id: k, type: 'single_choice', label, kind: 'choice', base: 0, options: [], average: null });
    }
  }

  for (const d of q.derived ?? []) {
    let options: Array<{ value: string; count: number }> = [];
    const src = d.sources[0];
    const dist = src ? byKey.get(src)?.nums : undefined;
    if (d.bins && dist && dist.size) {
      const agg = new Map<string, number>();
      for (const [v, c] of dist) {
        const label = binLabel(d.bins, v);
        agg.set(label, (agg.get(label) ?? 0) + c);
      }
      options = [...agg.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    }
    questions.push({
      id: d.id, type: 'single_choice', label: d.label, kind: 'choice', derived: true,
      sources: d.sources, base: options.reduce((s, o) => s + o.count, 0), options, average: null,
    });
  }

  const order = new Map(Object.keys(q.labels).map((k, i) => [k, i]));
  questions.sort((a, b) => {
    if (!!a.derived !== !!b.derived) return a.derived ? 1 : -1;
    const oa = order.get(a.id);
    const ob = order.get(b.id);
    if (oa != null && ob != null) return oa - ob;
    return a.id.localeCompare(b.id);
  });
  questions.forEach((x, i) => {
    x.position = i + 1;
  });

  return { questions, total, byDriverType };
}

/** Condición de filtro (una pregunta + un conjunto de valores, vacío = todas). */
export interface FilterCondition {
  questionId: string;
  values: string[];
}

/** Etiqueta de rango ("25-34", "55+") → límites numéricos. */
function rangeLabelToBounds(bounds: number[], label: string): { lo: number; hi: number } | null {
  const s = String(label).trim();
  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i];
    const hi = bounds[i + 1];
    const isLast = i === bounds.length - 2;
    const text = isLast ? `${lo}+` : `${lo}-${hi - 1}`;
    if (text === s) return { lo, hi: isLast ? 1e9 : hi - 1 };
  }
  // Por si la etiqueta es un número exacto.
  const n = Number(s);
  return Number.isFinite(n) ? { lo: n, hi: n } : null;
}

/**
 * WHERE para un conjunto de condiciones de filtro (multi-valor), combinadas con AND/OR.
 * Soporta preguntas JSON (escalar o array) y derivadas por `bins` (rango sobre su fuente).
 * Sin valores → la condición se ignora (equivale a "todas las opciones").
 */
export function buildConditionsWhere(
  q: Questionnaire,
  conditions: FilterCondition[] | undefined,
  combinator: 'and' | 'or',
): { sql: string; params: unknown[] } {
  const af = q.source.answersField;
  const parts: string[] = [];
  const params: unknown[] = [];
  const derivedById = new Map((q.derived ?? []).map((d) => [d.id, d]));
  for (const c of conditions ?? []) {
    if (!c || !SAFE_ID.test(c.questionId)) continue;
    const values = (c.values ?? []).map((v) => String(v)).filter((v) => v !== '');
    if (values.length === 0) continue;

    const d = derivedById.get(c.questionId);
    if (d?.bins && d.sources[0] && SAFE_ID.test(d.sources[0])) {
      const src = d.sources[0];
      const ors: string[] = [];
      for (const v of values) {
        const r = rangeLabelToBounds(d.bins, v);
        if (!r) continue;
        params.push(r.lo, r.hi);
        ors.push(`(("${af}" ->> '${src}')::numeric BETWEEN $${params.length - 1} AND $${params.length})`);
      }
      if (ors.length) parts.push('(' + ors.join(' OR ') + ')');
    } else {
      // CONTENCIÓN indexable (GIN): por cada valor, dos ramas → escalar `{"q":"v"}` o
      // miembro de array `{"q":["v"]}`. Se combinan con OR (BitmapOr de escaneos GIN).
      const ors: string[] = [];
      for (const v of values) {
        const iScalar = params.push(JSON.stringify({ [c.questionId]: v }));
        const iArray = params.push(JSON.stringify({ [c.questionId]: [v] }));
        ors.push(`"${af}" @> $${iScalar}::jsonb`);
        ors.push(`"${af}" @> $${iArray}::jsonb`);
      }
      if (ors.length) parts.push('(' + ors.join(' OR ') + ')');
    }
  }
  const sql = parts.length ? 'WHERE ' + parts.join(combinator === 'or' ? ' OR ' : ' AND ') : '';
  return { sql, params };
}
