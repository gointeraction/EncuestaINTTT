export interface PreguntasSource {
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
  kind: QuestionKind;
  options?: OptionCount[];
  distribution?: DistributionPoint[];
  average?: number | null;
  comments?: string[];
}

/** Fila del catálogo (pregunta + base respondida + forma visual). */
export interface QuestionRow {
  id: string;
  position: number;
  label: string;
  type: string;
  visual: string;
  base: number;
}

export function questionBase(q: QuestionAnalytics): number {
  if (q.kind === 'choice') return (q.options ?? []).reduce((s, o) => s + o.count, 0);
  if (q.kind === 'numeric') return (q.distribution ?? []).reduce((s, d) => s + d.count, 0);
  return (q.comments ?? []).length;
}

export function visualForm(q: QuestionAnalytics): string {
  if (q.kind === 'text') return 'tabla';
  if (q.kind === 'numeric') return 'histograma';
  if (q.type === 'multi_choice') return 'barras';
  return (q.options?.length ?? 0) <= 8 ? 'dona' : 'barras';
}
