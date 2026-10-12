export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'number'
  | 'scale'
  | 'text'
  | 'textarea';

export interface QuestionDraft {
  id: string;
  label: string;
  type: QuestionType;
  /** Opciones (para choice/multi). */
  options: string[];
}

export interface SurveyDraft {
  title: string;
  slug: string;
  description: string;
}

export const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: 'single_choice', label: 'Opción única' },
  { value: 'multi_choice', label: 'Opción múltiple' },
  { value: 'number', label: 'Numérica' },
  { value: 'scale', label: 'Escala' },
  { value: 'text', label: 'Texto corto' },
  { value: 'textarea', label: 'Texto largo' },
];
