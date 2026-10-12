import { InjectionToken, type Signal } from '@angular/core';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type { ResponsesPage } from '../models/encuestas.model';

export const ENCUESTAS_STATE = new InjectionToken<EncuestasStateContract>('ENCUESTAS_STATE');

export interface EncuestasStateContract {
  readonly loading: Signal<boolean>;
  readonly page: Signal<ResponsesPage | null>;
  readonly filters: Signal<FilterSet>;
  readonly filterQuestions: Signal<FilterQuestion[]>;
  load(page: number): Promise<void>;
  go(page: number): Promise<void>;
  setFilters(filters: FilterSet): void;
  applyFilters(): Promise<void>;
}
