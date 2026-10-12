import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SeedCounts {
  encuestas: number;
  participantes: number;
  dispositivos: number;
}

export interface SeedStatus {
  environment: string;
  database: string;
  counts: SeedCounts;
}

export interface SeedRequest {
  profile?: string;
  surveys?: number;
  questionsPerSurvey?: number;
  responses?: number;
  legacy?: number;
  seed?: number;
}

export interface FixtureFile {
  name: string;
  rows: number;
  bytes: number;
  modifiedAt: string;
}

export interface FixturesList {
  fixtures: FixtureFile[];
  total: number;
}

/**
 * Cliente del seeder (dev-only). Vive en `core/` (no en la página): la página llega al
 * backend por este puerto, no por HttpClient directo (regla no-http-client-in-page).
 * El path `/seed` lo proxya el nginx de la consola al servicio `seed`.
 */
@Injectable({ providedIn: 'root' })
export class DevSeedClient {
  private readonly http = inject(HttpClient);
  private readonly base = '/seed';

  status(): Promise<SeedStatus> {
    return firstValueFrom(this.http.get<SeedStatus>(`${this.base}/status`));
  }

  seed(req: SeedRequest): Promise<SeedStatus> {
    return firstValueFrom(this.http.post<SeedStatus>(`${this.base}/seed`, req));
  }

  reset(): Promise<SeedStatus> {
    return firstValueFrom(this.http.post<SeedStatus>(`${this.base}/reset`, {}));
  }

  summarize(): Promise<SeedStatus> {
    return firstValueFrom(this.http.post<SeedStatus>(`${this.base}/summarize`, {}));
  }

  fixtures(perType?: number): Promise<SeedStatus> {
    const body = perType ? { perType } : {};
    return firstValueFrom(this.http.post<SeedStatus>(`${this.base}/fixtures`, body));
  }

  /** Lista los CSV de fixtures (nombre, filas, bytes, fecha). */
  fixturesList(): Promise<FixturesList> {
    return firstValueFrom(this.http.get<FixturesList>(`${this.base}/fixtures`));
  }

  /** Borra los CSV de fixtures (todos, o uno por nombre). */
  deleteFixtures(name?: string): Promise<{ removed: number }> {
    return firstValueFrom(
      this.http.delete<{ removed: number }>(`${this.base}/fixtures`, {
        params: name ? { name } : {},
      }),
    );
  }

  load(): Promise<SeedStatus> {
    return firstValueFrom(this.http.post<SeedStatus>(`${this.base}/load`, {}));
  }
}
