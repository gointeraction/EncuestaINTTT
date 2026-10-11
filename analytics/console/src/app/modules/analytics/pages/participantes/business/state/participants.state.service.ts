import { Injectable, inject, signal } from '@angular/core';
import { ParticipantsDataService } from '../data/participants.data.service';
import type { ParticipantsStateContract } from '../contracts/participants.state.contract';
import type { ParticipantsPage } from '../models/participants.model';

@Injectable()
export class ParticipantsStateService implements ParticipantsStateContract {
  private readonly data = inject(ParticipantsDataService);

  readonly loading = signal(false);
  readonly page = signal<ParticipantsPage | null>(null);

  async load(page: number): Promise<void> {
    this.loading.set(true);
    try {
      this.page.set(await this.data.participants(page));
    } finally {
      this.loading.set(false);
    }
  }

  go(page: number): Promise<void> {
    return this.load(page);
  }
}
