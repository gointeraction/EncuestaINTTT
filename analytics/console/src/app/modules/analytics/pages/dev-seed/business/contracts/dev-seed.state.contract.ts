import { InjectionToken, type Signal } from '@angular/core';
import type { FixtureFile, SeedRequest, SeedStatus } from '../../../../../../core/dev-seed.client';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const DEV_SEED_STATE = new InjectionToken<DevSeedStateContract>('DEV_SEED_STATE');

export interface DevSeedStateContract {
  readonly status: Signal<SeedStatus | null>;
  readonly fixtures: Signal<FixtureFile[]>;
  readonly fixtureTotal: Signal<number>;
  readonly busy: Signal<boolean>;
  readonly error: Signal<string | null>;
  load(req: SeedRequest): Promise<void>;
  reset(): Promise<void>;
  summarize(): Promise<void>;
  generateFixtures(perType?: number): Promise<void>;
  loadFixtures(): Promise<void>;
  deleteFixtures(name?: string): Promise<void>;
  refresh(): Promise<void>;
}
