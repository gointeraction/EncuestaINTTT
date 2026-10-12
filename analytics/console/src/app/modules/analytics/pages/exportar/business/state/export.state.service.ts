import { Injectable, computed, inject } from '@angular/core';
import { ExportDataService } from '../data/export.data.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import type { ExportStateContract } from '../contracts/export.state.contract';

@Injectable()
export class ExportStateService implements ExportStateContract {
  private readonly data = inject(ExportDataService);
  private readonly active = inject(ActiveSurveyService);

  readonly surveyId = computed(() => this.active.activeId());

  questionnaireUrl(): string {
    return this.data.questionnaireUrl(this.surveyId());
  }

  collectedUrl(): string {
    return this.data.collectedUrl(this.surveyId());
  }
}
