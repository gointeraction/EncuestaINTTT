import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DsKpiGridComponent, DsChartComponent } from '@cifraflow/design';
import type { DsKpiItem, DsChartSeries } from '@cifraflow/design';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../shared/api-sdk';
import { API_BASE } from '../../../core/api.config';

interface SurveySource {
  id: string;
  title: string;
}
interface OptionCount {
  value: string;
  count: number;
}
interface QuestionAnalytics {
  id: string;
  type: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  options?: OptionCount[];
  average?: number | null;
  comments?: string[];
}
interface SurveyPayload {
  totals: {
    total: number;
    completed: number;
    abandoned: number;
    in_progress: number;
    completionRate: number;
    abandonmentRate: number;
  };
  questions?: QuestionAnalytics[];
}

@Component({
  selector: 'app-panel-encuesta',
  standalone: true,
  imports: [FormsModule, DsKpiGridComponent, DsChartComponent],
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

    @if (kpis().length) {
      <ds-kpi-grid [items]="kpis()" />
    }
    @if (chartSeries().length) {
      <ds-chart type="grouped" [categories]="categories()" [series]="chartSeries()" />
    }
    @if (dashboard(); as d) {
      @if (d.questions?.length) {
        <ul>
          @for (q of d.questions; track q.id) {
            <li>{{ q.label }} — {{ q.kind }}</li>
          }
        </ul>
      }
    } @else {
      <p>Sin datos. Recalcule la sumarización o elija otra encuesta.</p>
    }
  `,
})
export class PanelEncuestaComponent {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);
  readonly fuentes = signal<SurveySource[]>([]);
  readonly dashboard = signal<SurveyPayload | null>(null);
  surveyId = '';

  readonly kpis = computed<DsKpiItem[]>(() => {
    const t = this.dashboard()?.totals;
    if (!t) return [];
    return [
      { label: 'Respuestas', value: t.total, icon: 'file-text', tone: 'neutral' },
      {
        label: 'Finalización',
        value: `${Math.round((t.completionRate ?? 0) * 100)}%`,
        icon: 'check',
        tone: 'success',
      },
      {
        label: 'Abandono',
        value: `${Math.round((t.abandonmentRate ?? 0) * 100)}%`,
        icon: 'alert-circle',
        tone: 'danger',
      },
      { label: 'En curso', value: t.in_progress, icon: 'activity', tone: 'info' },
    ];
  });

  private readonly chartQuestion = computed<QuestionAnalytics | null>(() => {
    const qs = this.dashboard()?.questions ?? [];
    return qs.find((q) => q.kind === 'choice' && (q.options?.length ?? 0) > 0) ?? null;
  });
  readonly categories = computed<string[]>(
    () => this.chartQuestion()?.options?.map((o) => o.value) ?? [],
  );
  readonly chartSeries = computed<DsChartSeries[]>(() => {
    const q = this.chartQuestion();
    return q ? [{ name: q.label, data: q.options!.map((o) => o.count) }] : [];
  });

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
    const res = await firstValueFrom(this.api.reportingControllerSurvey(this.surveyId));
    this.dashboard.set((res as unknown as SurveyPayload) ?? null);
  }
}
