import { Injectable, inject, signal } from '@angular/core';
import { GlobalDataService } from '../data/global.data.service';
import type { GlobalStateContract } from '../contracts/global.state.contract';
import type { GlobalPayload, TimelinePoint } from '../models/global.model';

@Injectable()
export class GlobalStateService implements GlobalStateContract {
  private readonly data = inject(GlobalDataService);

  readonly loading = signal(false);
  readonly payload = signal<GlobalPayload | null>(null);
  readonly timeline = signal<TimelinePoint[]>([]);
  readonly run = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const payload = await this.data.loadGlobal();
      this.payload.set(payload);
      if (payload?.questionnaire) {
        this.timeline.set(await this.data.timeline(payload.questionnaire));
      }
    } finally {
      this.loading.set(false);
    }
  }

  async summarize(): Promise<void> {
    const res = await this.data.summarize();
    this.run.set('Sumarización: ' + JSON.stringify(res));
    await this.load();
  }
}
