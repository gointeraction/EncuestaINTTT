import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../shared/api-sdk';
import { API_BASE } from '../../../core/api.config';

interface SurveySource {
  id: string;
  title: string;
}

@Component({
  selector: 'app-panel-encuesta',
  standalone: true,
  imports: [FormsModule, JsonPipe],
  template: `
    <h1>Panel por encuesta</h1>
    <label>Encuesta
      <select [(ngModel)]="surveyId" (ngModelChange)="load()">
        <option value="">Seleccione…</option>
        @for (s of fuentes(); track s.id) {
          <option [value]="s.id">{{ s.title }}</option>
        }
      </select>
    </label>

    @if (surveyId) {
      <p><a [href]="exportUrl()" download>Exportar CSV</a></p>
    }

    @if (dashboard(); as d) {
      <pre>{{ d | json }}</pre>
    } @else {
      <p>Sin datos. Recalcule la sumarización o elija otra encuesta.</p>
    }
  `,
})
export class PanelEncuestaComponent {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);
  readonly fuentes = signal<SurveySource[]>([]);
  readonly dashboard = signal<unknown>(null);
  surveyId = '';

  constructor() {
    void this.loadSources();
  }

  exportUrl(): string {
    return `${API_BASE}/analytics/surveys/${this.surveyId}/export`;
  }

  async loadSources(): Promise<void> {
    const res = await firstValueFrom(this.api.publicReadControllerListSurveys());
    this.fuentes.set((res as unknown as SurveySource[]) ?? []);
  }

  async load(): Promise<void> {
    if (!this.surveyId) {
      this.dashboard.set(null);
      return;
    }
    this.dashboard.set(await firstValueFrom(this.api.reportingControllerSurvey(this.surveyId)));
  }
}
