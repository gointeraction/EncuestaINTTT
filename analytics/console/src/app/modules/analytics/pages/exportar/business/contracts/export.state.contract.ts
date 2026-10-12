import { InjectionToken, type Signal } from '@angular/core';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const EXPORT_STATE = new InjectionToken<ExportStateContract>('EXPORT_STATE');

export interface ExportStateContract {
  readonly surveyId: Signal<string>;
  readonly filters: Signal<FilterSet>;
  readonly filterQuestions: Signal<FilterQuestion[]>;
  setFilters(filters: FilterSet): void;
  questionnaireUrl(): string;
  collectedUrl(): string;
  collectedLongUrl(): string;
  collectedRawUrl(): string;
}
