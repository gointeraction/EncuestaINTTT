import { InjectionToken, type Signal } from '@angular/core';
import type {
  AnswerValue,
  QuestionDef,
  QuestionnaireDef,
  SubmitResult,
} from '../models/individual.model';

export interface ActiveSection {
  id: string;
  title: string;
  questions: QuestionDef[];
}

export const INDIVIDUAL_STATE = new InjectionToken<IndividualStateContract>('INDIVIDUAL_STATE');

export interface IndividualStateContract {
  readonly loading: Signal<boolean>;
  readonly busy: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly definition: Signal<QuestionnaireDef | null>;
  readonly driverType: Signal<string>;
  readonly sections: Signal<ActiveSection[]>;
  readonly answers: Signal<Record<string, AnswerValue>>;
  readonly clientSubmissionId: Signal<string>;
  readonly result: Signal<SubmitResult | null>;
  load(): Promise<void>;
  setDriverType(id: string): void;
  setAnswer(id: string, value: AnswerValue): void;
  toggleAnswer(id: string, option: string): void;
  submit(): Promise<void>;
  newSession(): void;
  remove(): Promise<void>;
}
