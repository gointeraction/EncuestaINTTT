import { InjectionToken, type Signal } from '@angular/core';
import type { QuestionDraft, QuestionType, SurveyDraft } from '../models/builder.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const BUILDER_STATE = new InjectionToken<BuilderStateContract>('BUILDER_STATE');

export interface BuilderStateContract {
  readonly draft: Signal<SurveyDraft>;
  readonly questions: Signal<QuestionDraft[]>;
  readonly notice: Signal<string | null>;
  setTitle(value: string): void;
  setSlug(value: string): void;
  setDescription(value: string): void;
  addQuestion(): void;
  removeQuestion(id: string): void;
  setQuestionLabel(id: string, value: string): void;
  setQuestionType(id: string, value: QuestionType): void;
  setQuestionOptions(id: string, value: string): void;
  save(): void;
}
