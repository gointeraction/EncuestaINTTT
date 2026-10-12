import { Injectable, computed, inject, signal } from '@angular/core';
import { ParticipantsDataService } from '../data/participants.data.service';
import { FilterStateService } from '../../../../../../core/filter-state.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type { ParticipantsStateContract } from '../contracts/participants.state.contract';
import type { ParticipantsPage } from '../models/participants.model';

@Injectable()
export class ParticipantsStateService implements ParticipantsStateContract {
  private readonly data = inject(ParticipantsDataService);
  private readonly filterState = inject(FilterStateService);
  private readonly active = inject(ActiveSurveyService);

  readonly loading = signal(false);
  readonly page = signal<ParticipantsPage | null>(null);
  readonly filters = this.filterState.filters;
  private readonly catalog = signal<FilterQuestion[]>([]);
  readonly filterQuestions = computed(() => this.catalog());

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    await this.active.load();
    try {
      const qs = await this.data.questions(this.active.activeId());
      this.catalog.set(
        qs.map((q) => ({
          id: q.id, label: q.label, position: q.position,
          options: (q.options ?? []).map((o) => ({ value: o.value, label: o.value })),
        })),
      );
    } catch {
      /* sin catálogo: el constructor de filtros queda vacío */
    }
    await this.load(1);
  }

  setFilters(filters: FilterSet): void {
    this.filterState.set(filters);
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    try {
      this.page.set(await this.data.records('participants', page, 20, this.filters()));
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilters(): Promise<void> {
    await this.load(1);
  }

  go(page: number): Promise<void> {
    return this.load(page);
  }
}
