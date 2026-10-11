import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  DsKpiGridComponent,
  DsChartComponent,
} from '@cifraflow/design';
import type { DsKpiItem, DsChartSeries } from '@cifraflow/design';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../shared/api-sdk';
import { API_BASE } from '../../../../core/api.config';

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
  imports: [FormsModule, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsKpiGridComponent, DsChartComponent],
  template: `
    <ds-container kind="page" name="panel-encuesta">
      <ds-container kind="area" name="header">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Panel por encuesta" subtitle="Analítica · INTT" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <label class="fuente">Encuesta
                <select [(ngModel)]="surveyId" (ngModelChange)="load()">
                  <option value="">Seleccione…</option>
                  @for (s of fuentes(); track s.id) { <option [value]="s.id">{{ s.title }}</option> }
                </select>
              </label>
              @if (surveyId) { <a [href]="exportUrl()" download>Exportar CSV</a> }
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body">
        <ds-container kind="section" name="kpis">
          @if (kpis().length) {
            <ds-kpi-grid [items]="kpis()" />
          } @else {
            <p>Sin datos. Recalcule la sumarización o elija otra encuesta.</p>
          }
        </ds-container>

        @if (chartSeries().length) {
          <ds-container kind="section" name="grafica">
            <ds-chart type="grouped" [categories]="categories()" [series]="chartSeries()" />
          </ds-container>
        }

        @if (dashboard()?.questions?.length) {
          <ds-container kind="section" name="preguntas">
            <ul>
              @for (q of (dashboard()?.questions ?? []); track q.id) {
                <li>{{ q.label }} — {{ q.kind }}</li>
              }
            </ul>
          </ds-container>
        }
      </ds-container>
    </ds-container>
  `,
  styles: `.fuente { display: inline-flex; gap: .4rem; align-items: center; color: inherit; }`,
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
      { label: 'Finalización', value: `${Math.round((t.completionRate ?? 0) * 100)}%`, icon: 'check', tone: 'success' },
      { label: 'Abandono', value: `${Math.round((t.abandonmentRate ?? 0) * 100)}%`, icon: 'alert-circle', tone: 'danger' },
      { label: 'En curso', value: t.in_progress, icon: 'activity', tone: 'info' },
    ];
  });

  private readonly chartQuestion = computed<QuestionAnalytics | null>(() => {
    const qs = this.dashboard()?.questions ?? [];
    return qs.find((q) => q.kind === 'choice' && (q.options?.length ?? 0) > 0) ?? null;
  });
  readonly categories = computed<string[]>(() => this.chartQuestion()?.options?.map((o) => o.value) ?? []);
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
