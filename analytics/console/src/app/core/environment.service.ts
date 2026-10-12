import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Entorno que reporta el back-office (`GET /health` → `environment`). */
@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly http = inject(HttpClient);

  readonly environment = signal<string | null>(null);
  readonly loaded = signal(false);
  /** Solo verdadero en local/development → habilita las herramientas de datos de prueba. */
  readonly isDevelopment = computed(() => this.environment() === 'development');

  async load(): Promise<void> {
    if (this.loaded()) return;
    try {
      const res = await firstValueFrom(
        this.http.get<{ environment?: string }>('/health', { withCredentials: true }),
      );
      this.environment.set(res?.environment ?? null);
    } catch {
      this.environment.set(null);
    } finally {
      this.loaded.set(true);
    }
  }
}
