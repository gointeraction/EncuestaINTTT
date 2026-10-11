import { Injectable, inject, signal } from '@angular/core';
import { GlobalDataService } from '../data/global.data.service';
import type { GlobalStateContract } from '../contracts/global.state.contract';
import type { GlobalPayload } from '../models/global.model';

@Injectable()
export class GlobalStateService implements GlobalStateContract {
  private readonly data = inject(GlobalDataService);

  readonly loading = signal(false);
  readonly payload = signal<GlobalPayload | null>(null);
  readonly run = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.payload.set(await this.data.loadGlobal());
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
