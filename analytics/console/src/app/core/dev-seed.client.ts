import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SeedCounts {
  surveys: number;
  responses: number;
  answers: number;
  legacy: number;
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
}
