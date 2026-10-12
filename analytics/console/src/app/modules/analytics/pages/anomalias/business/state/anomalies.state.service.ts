import { Injectable, inject, signal } from '@angular/core';
import { AnomaliesDataService } from '../data/anomalies.data.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import type { AnomaliesStateContract } from '../contracts/anomalies.state.contract';
import type { AnomaliesPayload } from '../models/anomalies.model';

@Injectable()
export class AnomaliesStateService implements AnomaliesStateContract {
  private readonly data = inject(AnomaliesDataService);
  private readonly active = inject(ActiveSurveyService);

  readonly loading = signal(false);
  readonly payload = signal<AnomaliesPayload | null>(null);
  readonly day = signal('');

  /** Si se indica `day`, la serie por hora se limita a ese día. */
  async load(day?: string): Promise<void> {
    const selected = day ?? this.day();
    this.day.set(selected);
    this.loading.set(true);
    try {
      this.payload.set(await this.data.anomalies(this.active.activeId(), selected));
    } finally {
      this.loading.set(false);
    }
  }
}
