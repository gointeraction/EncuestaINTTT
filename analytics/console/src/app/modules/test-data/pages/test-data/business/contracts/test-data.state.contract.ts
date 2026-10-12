import { InjectionToken, type Signal } from '@angular/core';
import type { DatasetFile, FixtureFile, SeedRequest, SeedStatus } from '../../../../../../core/dev-seed.client';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const TEST_DATA_STATE = new InjectionToken<TestDataStateContract>('TEST_DATA_STATE');

export interface TestDataStateContract {
  readonly status: Signal<SeedStatus | null>;
  readonly fixtures: Signal<FixtureFile[]>;
  readonly fixtureTotal: Signal<number>;
  readonly datasets: Signal<DatasetFile[]>;
  readonly datasetTotal: Signal<number>;
  readonly busy: Signal<boolean>;
  readonly error: Signal<string | null>;
  load(req: SeedRequest): Promise<void>;
  reset(): Promise<void>;
  summarize(): Promise<void>;
  generateFixtures(perType?: number): Promise<void>;
  loadFixtures(): Promise<void>;
  deleteFixtures(name?: string): Promise<void>;
  generateDatasets(only?: string): Promise<void>;
  deleteDatasets(name?: string): Promise<void>;
  loadDataset(name: string): Promise<void>;
  refresh(): Promise<void>;
}
