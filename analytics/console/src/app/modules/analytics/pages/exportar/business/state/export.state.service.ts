import { Injectable, inject, signal } from '@angular/core';
import { ExportDataService } from '../data/export.data.service';
import type { ExportStateContract } from '../contracts/export.state.contract';

@Injectable()
export class ExportStateService implements ExportStateContract {
  private readonly data = inject(ExportDataService);

  readonly surveyId = signal('vision-cero');

  questionnaireUrl(): string {
    return this.data.questionnaireUrl(this.surveyId());
  }

  collectedUrl(): string {
    return this.data.collectedUrl(this.surveyId());
  }
}
