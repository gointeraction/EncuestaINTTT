import { Injectable, inject, signal } from '@angular/core';
import {
  DevSeedClient,
  type DatasetFile,
  type FixtureFile,
  type SeedRequest,
  type SeedStatus,
} from '../../../../../../core/dev-seed.client';
import type { TestDataStateContract } from '../contracts/test-data.state.contract';

@Injectable()
export class TestDataStateService implements TestDataStateContract {
  private readonly client = inject(DevSeedClient);

  readonly status = signal<SeedStatus | null>(null);
  readonly fixtures = signal<FixtureFile[]>([]);
  readonly fixtureTotal = signal(0);
  readonly datasets = signal<DatasetFile[]>([]);
  readonly datasetTotal = signal(0);
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

  private async listFixtures(): Promise<void> {
    try {
      const res = await this.client.fixturesList();
      this.fixtures.set(res.fixtures);
      this.fixtureTotal.set(res.total);
    } catch {
      this.fixtures.set([]);
      this.fixtureTotal.set(0);
    }
  }

  private async listDatasets(): Promise<void> {
    try {
      const res = await this.client.datasetsList();
      this.datasets.set(res.datasets);
      this.datasetTotal.set(res.total);
    } catch {
      this.datasets.set([]);
      this.datasetTotal.set(0);
    }
  }

  async load(req: SeedRequest): Promise<void> {
    await this.run(() => this.client.seed(req));
  }

  async reset(): Promise<void> {
    await this.run(() => this.client.reset());
  }

  async summarize(): Promise<void> {
    await this.run(() => this.client.summarize());
  }

  async generateFixtures(perType?: number): Promise<void> {
    await this.run(() => this.client.fixtures(perType));
    await this.listFixtures();
  }

  async loadFixtures(): Promise<void> {
    await this.run(() => this.client.load());
  }

  async deleteFixtures(name?: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.client.deleteFixtures(name);
    } catch {
      this.error.set('No se pudieron borrar los CSV de fixtures.');
    } finally {
      this.busy.set(false);
      await this.listFixtures();
    }
  }

  async generateDatasets(only?: string): Promise<void> {
    await this.run(() => this.client.generateDatasets(only));
    await this.listDatasets();
  }

  async deleteDatasets(name?: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.client.deleteDatasets(name);
    } catch {
      this.error.set('No se pudieron borrar los datasets.');
    } finally {
      this.busy.set(false);
      await this.listDatasets();
    }
  }

  async loadDataset(name: string): Promise<void> {
    await this.run(() => this.client.load(name));
  }

  async refresh(): Promise<void> {
    await this.run(() => this.client.status());
    await Promise.all([this.listFixtures(), this.listDatasets()]);
  }
}
