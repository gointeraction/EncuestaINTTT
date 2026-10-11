import { Component, computed, inject, signal } from '@angular/core';
import { DsKpiGridComponent, type DsKpiItem } from '@cifraflow/design';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../shared/api-sdk';
import { SessionService } from '../../core/session.service';

interface GlobalPayload {
  totalSurveys: number;
  totalResponses: number;
  completed: number;
  abandoned: number;
  bySurvey: Array<{ id: string; title: string; responses: number }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DsKpiGridComponent],
  template: `
    <h1>Panel global</h1>
    <p>
      <button type="button" (click)="summarize()">Recalcular sumarización</button>
      <a href="/panel">Panel por encuesta</a>
    </p>

    @if (kpis().length) {
      <ds-kpi-grid [items]="kpis()" />
    } @else {
      <p>Sin datos. Pulse «Recalcular sumarización».</p>
    }
    @if (run(); as r) { <p>{{ r }}</p> }
  `,
})
export class DashboardComponent {
  readonly session = inject(SessionService);
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  readonly global = signal<GlobalPayload | null>(null);
  readonly run = signal<string | null>(null);

  readonly kpis = computed<DsKpiItem[]>(() => {
    const g = this.global();
    if (!g) return [];
    return [
      { label: 'Encuestas', value: g.totalSurveys, icon: 'database', tone: 'info' },
      { label: 'Respuestas', value: g.totalResponses, icon: 'file-text', tone: 'neutral' },
      { label: 'Completadas', value: g.completed, icon: 'check', tone: 'success' },
      { label: 'Abandonadas', value: g.abandoned, icon: 'alert-circle', tone: 'danger' },
    ];
  });

  constructor() {
    void this.loadGlobal();
  }

  async loadGlobal(): Promise<void> {
    const res = await firstValueFrom(this.api.reportingControllerGlobal());
    this.global.set((res as unknown as GlobalPayload) ?? null);
  }

  async summarize(): Promise<void> {
    const res = await firstValueFrom(this.api.summarizationControllerSummarize());
    this.run.set('Sumarización: ' + JSON.stringify(res));
    await this.loadGlobal();
  }
}
