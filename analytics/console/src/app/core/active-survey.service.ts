import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../shared/api-sdk';

export interface SurveySummary {
  id: string;
  title: string;
}

/**
 * ActiveSurveyService — la encuesta ACTIVA de la consola (multi-encuesta). Carga la lista
 * de encuestas del back-office y mantiene cuál está seleccionada (por defecto la primera,
 * hoy `vision-cero`). Las páginas leen `activeId()` / `active()` en vez de fijar un id.
 */
@Injectable({ providedIn: 'root' })
export class ActiveSurveyService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  readonly surveys = signal<SurveySummary[]>([]);
  readonly activeId = signal<string>('vision-cero');
  readonly active = computed<SurveySummary | null>(
    () => this.surveys().find((s) => s.id === this.activeId()) ?? null,
  );

  private loaded = false;

  /** Carga la lista una sola vez; garantiza que `activeId` esté entre las disponibles. */
  async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const res = await firstValueFrom(this.api.publicReadControllerListSurveys());
      const list = ((res as unknown as SurveySummary[]) ?? []).filter((s) => s && s.id);
      this.surveys.set(list);
      if (list.length && !list.some((s) => s.id === this.activeId())) {
        this.activeId.set(list[0].id);
      }
    } catch {
      /* sin lista: se mantiene el id por defecto */
    }
  }

  setActive(id: string): void {
    if (id) this.activeId.set(id);
  }
}
