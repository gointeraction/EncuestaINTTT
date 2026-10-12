import { Injectable, signal } from '@angular/core';
import type { FilterSet } from '../shared/components/filter-builder/filter-builder.component';

/**
 * Estado COMPARTIDO del constructor de filtros (Panel ↔ Cruzados): al elegir una
 * combinación en el Panel, el Cruce la abre por defecto.
 */
@Injectable({ providedIn: 'root' })
export class FilterStateService {
  readonly filters = signal<FilterSet>({ combinator: 'and', conditions: [] });

  set(filters: FilterSet): void {
    this.filters.set(filters);
  }

  get hasFilters(): boolean {
    return this.filters().conditions.some((c) => c.questionId);
  }
}
