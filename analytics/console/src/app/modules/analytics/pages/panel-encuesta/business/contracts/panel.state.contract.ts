import { InjectionToken, type Signal } from '@angular/core';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type {
  FilterDimension,
  QuestionAnalytics,
  SurveyPayload,
  SurveySource,
} from '../models/panel.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const PANEL_STATE = new InjectionToken<PanelStateContract>('PANEL_STATE');

export interface PanelStateContract {
  readonly sources: Signal<SurveySource[]>;
  readonly dashboard: Signal<SurveyPayload | null>;
  readonly dimensions: Signal<FilterDimension[]>;
  readonly loading: Signal<boolean>;
  readonly surveyId: Signal<string>;
  readonly search: Signal<string>;
  readonly typeFilter: Signal<string>;
  readonly dimensionId: Signal<string>;
  readonly dimensionValue: Signal<string>;
  readonly filtered: Signal<QuestionAnalytics[]>;
  readonly selected: Signal<QuestionAnalytics | null>;
  readonly filters: Signal<FilterSet>;
  readonly filterQuestions: Signal<FilterQuestion[]>;
  readonly filtering: Signal<boolean>;
  loadSources(initialQuestionId?: string): Promise<void>;
  selectSurvey(id: string): Promise<void>;
  setSearch(value: string): void;
  setType(value: string): void;
  setQuestion(id: string): void;
  setDimension(dimensionId: string, value: string): Promise<void>;
  setFilters(filters: FilterSet): void;
  applyFilters(): Promise<void>;
}
