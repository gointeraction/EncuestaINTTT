/**
 * Modelos de la página `panel-encuesta` — analítica de resultados por encuesta.
 * Capa de negocio: SIN imports del design system.
 */

export interface SurveySource {
  id: string;
  title: string;
}

export interface OptionCount {
  value: string;
  count: number;
}

export interface DistributionPoint {
  value: number;
  count: number;
}

export type QuestionKind = 'choice' | 'numeric' | 'text';

/** Pregunta tal como la entrega el resumen precalculado del back-office. */
export interface QuestionAnalytics {
  id: string;
  type: string;
  label: string;
  position?: number;
  kind: QuestionKind;
  /** true si es autocontestada (derivada). */
  derived?: boolean;
  /** Preguntas de origen de una autocontestada. */
  sources?: string[];
  /** Nº de cuestionarios que respondieron esta pregunta (base de cálculo). */
  base?: number;
  options?: OptionCount[];
  distribution?: DistributionPoint[];
  stats?: { count: number; mean: number; median: number; mode: number; stdDev: number; min: number; max: number };
  average?: number | null;
  comments?: string[];
}

export interface SurveyTotals {
  total: number;
  completed: number;
  abandoned: number;
  in_progress: number;
  completionRate: number;
  abandonmentRate: number;
}

export interface SurveyPayload {
  surveyId?: string;
  totals: SurveyTotals;
  questions?: QuestionAnalytics[];
  generatedAt?: string;
}

/** Forma visual que corresponde a una pregunta (catálogo visual del marco 05). */
export type VisualForm = 'dona' | 'barras' | 'histograma' | 'tabla';

/** Opción de un filtro (compatible con el input `filters` de `ds-filter-bar`). */
export interface PanelFilter {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
}

/** Resumen visual de una pregunta y su base de respuesta. */
export interface QuestionSummary {
  id: string;
  label: string;
  type: string;
  visual: VisualForm;
  base: number;
}

/** Dimensión de filtro (pregunta categórica) entregada por el back-office. */
export interface FilterDimension {
  id: string;
  label: string;
  type: string;
  options: Array<{ label: string; value: string }>;
}

/** Segmento activo (dimensión + valor) aplicado al panel. */
export interface Segment {
  dimension: string;
  value: string;
}

/** Punto de la línea de tiempo (respuestas por día). */
export interface TimelinePoint {
  day: string;
  total: number;
  completed: number;
}

/** Base aplicable de una pregunta (nº de cuestionarios que la respondieron). */
export function questionBase(q: QuestionAnalytics): number {
  if (q.base != null) return q.base;
  if (q.kind === 'choice') return (q.options ?? []).reduce((s, o) => s + o.count, 0);
  if (q.kind === 'numeric') return (q.distribution ?? []).reduce((s, d) => s + d.count, 0);
  return (q.comments ?? []).length;
}

/** Forma visual por tipo de pregunta (ver 05-data-analisys/03-catalogo-visual.md). */
export function visualFormFor(q: QuestionAnalytics): VisualForm {
  if (q.kind === 'text') return 'tabla';
  if (q.kind === 'numeric') return 'histograma';
  if (q.type === 'multi_choice') return 'barras';
  return (q.options?.length ?? 0) <= 8 ? 'dona' : 'barras';
}

export function summarize(q: QuestionAnalytics): QuestionSummary {
  return { id: q.id, label: q.label, type: q.type, visual: visualFormFor(q), base: questionBase(q) };
}
