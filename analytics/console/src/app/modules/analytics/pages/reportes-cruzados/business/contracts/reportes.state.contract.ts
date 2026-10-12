import { InjectionToken, type Signal } from '@angular/core';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type { CrossTabResult, ReportQuestion, ReportSurveySource } from '../models/reportes.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const REPORTES_STATE = new InjectionToken<ReportesStateContract>('REPORTES_STATE');

export interface ReportesStateContract {
  readonly sources: Signal<ReportSurveySource[]>;
  readonly questions: Signal<ReportQuestion[]>;
  readonly result: Signal<CrossTabResult | null>;
  readonly surveyId: Signal<string>;
  readonly q1: Signal<string>;
  readonly q2: Signal<string>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly filters: Signal<FilterSet>;
  readonly filterQuestions: Signal<FilterQuestion[]>;
  loadSources(): Promise<void>;
  setFilters(filters: FilterSet): void;
  setSurvey(id: string): Promise<void>;
  setQ1(id: string): void;
  setQ2(id: string): void;
  run(): Promise<void>;
}
