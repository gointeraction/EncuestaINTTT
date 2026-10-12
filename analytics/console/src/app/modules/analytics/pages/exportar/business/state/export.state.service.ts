import { Injectable, computed, inject, signal } from '@angular/core';
import { ExportDataService } from '../data/export.data.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import { FilterStateService } from '../../../../../../core/filter-state.service';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type { ExportStateContract } from '../contracts/export.state.contract';

@Injectable()
export class ExportStateService implements ExportStateContract {
  private readonly data = inject(ExportDataService);
  private readonly active = inject(ActiveSurveyService);
  private readonly filterState = inject(FilterStateService);

  readonly surveyId = computed(() => this.active.activeId());
  readonly filters = this.filterState.filters;
  private readonly catalog = signal<FilterQuestion[]>([]);
  readonly filterQuestions = computed(() => this.catalog());

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    await this.active.load();
    try {
      this.catalog.set(await this.data.questions(this.active.activeId()));
    } catch {
      /* sin catálogo */
    }
  }

  setFilters(filters: FilterSet): void {
    this.filterState.set(filters);
  }

  questionnaireUrl(): string {
    return this.data.questionnaireUrl(this.surveyId());
  }

  collectedUrl(): string {
    return this.data.collectedUrl(this.surveyId(), this.filters());
  }

  collectedLongUrl(): string {
    return this.data.collectedLongUrl(this.surveyId(), this.filters());
  }

  collectedRawUrl(): string {
    return this.data.collectedRawUrl(this.surveyId(), this.filters());
  }
}
