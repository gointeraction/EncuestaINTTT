import { Injectable, inject, signal } from '@angular/core';
import { AnomaliesDataService } from '../data/anomalies.data.service';
import type { AnomaliesStateContract } from '../contracts/anomalies.state.contract';
import type { AnomaliesPayload } from '../models/anomalies.model';

const SURVEY = 'vision-cero';

@Injectable()
export class AnomaliesStateService implements AnomaliesStateContract {
  private readonly data = inject(AnomaliesDataService);

  readonly loading = signal(false);
  readonly payload = signal<AnomaliesPayload | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.payload.set(await this.data.anomalies(SURVEY));
    } finally {
      this.loading.set(false);
    }
  }
}
