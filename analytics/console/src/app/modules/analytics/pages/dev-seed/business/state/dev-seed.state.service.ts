import { Injectable, inject, signal } from '@angular/core';
import { DevSeedClient, type SeedRequest, type SeedStatus } from '../../../../../../core/dev-seed.client';
import type { DevSeedStateContract } from '../contracts/dev-seed.state.contract';

@Injectable()
export class DevSeedStateService implements DevSeedStateContract {
  private readonly client = inject(DevSeedClient);

  readonly status = signal<SeedStatus | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  private async run(op: () => Promise<SeedStatus>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      this.status.set(await op());
    } catch {
      this.error.set('No se pudo contactar el seeder (¿está arriba el servicio `seed` en dev?).');
    } finally {
      this.busy.set(false);
    }
  }

  load(req: SeedRequest): Promise<void> {
    return this.run(() => this.client.seed(req));
  }

  reset(): Promise<void> {
    return this.run(() => this.client.reset());
  }

  summarize(): Promise<void> {
    return this.run(() => this.client.summarize());
  }

  fixtures(perType: number): Promise<void> {
    return this.run(() => this.client.fixtures(perType));
  }

  loadFixtures(): Promise<void> {
    return this.run(() => this.client.load());
  }

  refresh(): Promise<void> {
    return this.run(() => this.client.status());
  }
}
