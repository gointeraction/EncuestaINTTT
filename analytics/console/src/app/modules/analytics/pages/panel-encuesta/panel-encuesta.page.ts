import { Component, computed, inject } from '@angular/core';
import {
  DsChartCardComponent,
  DsContainerComponent,
  DsDataTableCardComponent,
  DsEmptyStateComponent,
  DsFilterBarComponent,
  DsHeaderComponent,
  DsKpiGridComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsChartSeries,
  type DsKpiItem,
  type DsTableColumn,
  type DsTableRow,
  type DonutSegment,
} from '@cifraflow/design';
import { PANEL_STATE, type PanelStateContract } from './business/contracts/panel.state.contract';
import { PanelStateService } from './business/state/panel.state.service';
import {
  questionBase,
  summarize,
  type PanelFilter,
  type QuestionAnalytics,
} from './business/models/panel.model';
import { API_BASE } from '../../../../core/api.config';

/** Paleta de la dona (tokens de data-viz del design system). */
const PALETTE = [
  'var(--ds-viz-series-1)',
  'var(--ds-viz-series-2)',
  'var(--ds-viz-series-3)',
  'var(--ds-viz-series-4)',
  'var(--ds-viz-series-5)',
  'var(--ds-viz-series-6)',
];

interface ChartVm {
  type: 'donut' | 'grouped' | 'none';
  base: number;
  total?: number;
  segments?: DonutSegment[];
  categories?: string[];
  series?: DsChartSeries[];
}

/**
 * @akuri-page
 * page: panel-encuesta
 * route: /panel
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 *
 * Presenta los resultados de una encuesta como estadísticas: filtros (encuesta,
 * búsqueda, tipo y pregunta), KPIs de la muestra, el gráfico según el tipo de
 * pregunta y las tablas (detalle por categoría, resumen de preguntas, abiertas).
 */
@Component({
  selector: 'app-panel-encuesta',
  standalone: true,
  imports: [
    DsChartCardComponent,
    DsContainerComponent,
    DsDataTableCardComponent,
    DsEmptyStateComponent,
    DsFilterBarComponent,
    DsHeaderComponent,
    DsKpiGridComponent,
    DsPageTitleComponent,
  ],
  providers: [PanelStateService, { provide: PANEL_STATE, useExisting: PanelStateService }],
  template: `
    <ds-container kind="page" name="panel-encuesta">
      <ds-container kind="area" name="header" style="padding: var(--ds-space-2) var(--ds-space-4)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Panel por encuesta" subtitle="Analítica · INTT" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <label class="panel__fuente">Encuesta
                <select [value]="state.surveyId()" (change)="onSurvey($event)">
                  <option value="">Seleccione…</option>
                  @for (s of state.sources(); track s.id) {
                    <option [value]="s.id">{{ s.title }}</option>
                  }
                </select>
              </label>
              @if (state.surveyId()) { <a [href]="exportUrl()" download>Exportar CSV</a> }
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="panel__body">
        <!-- FILTROS -->
        <ds-container kind="section" name="filtros">
          <ds-filter-bar
            placeholder="Buscar pregunta…"
            [search]="state.search()"
            (searchChange)="state.setSearch($event)"
            [filters]="filters()"
            (activeFiltersChange)="onFilters($event)"
            [total]="state.filtered().length"
          />
        </ds-container>

        <!-- KPIs DE LA MUESTRA -->
        <ds-container kind="section" name="kpis">
          @if (kpis().length) {
            <ds-kpi-grid [items]="kpis()" />
          } @else {
            <p>Sin datos. Recalcule la sumarización o elija otra encuesta.</p>
          }
        </ds-container>

        <!-- GRÁFICO DE LA PREGUNTA ENFOCADA -->
        @if (state.selected(); as q) {
          <ds-container kind="section" name="grafico">
            @switch (chart().type) {
              @case ('donut') {
                <ds-chart-card
                  type="donut"
                  [title]="q.label"
                  [subtitle]="baseLabel()"
                  [total]="chart().total ?? 0"
                  totalLabel="RESPUESTAS"
                  [segments]="chart().segments ?? []"
                />
              }
              @case ('grouped') {
                <ds-chart-card
                  [title]="q.label"
                  [subtitle]="baseLabel()"
                  [categories]="chart().categories ?? []"
                  [series]="chart().series ?? []"
                />
              }
              @default {
                <ds-empty-state
                  title="Pregunta abierta"
                  body="Esta pregunta no se grafica; sus respuestas se listan en la tabla inferior."
                />
              }
            }
          </ds-container>

          <!-- TABLA: DETALLE POR CATEGORÍA -->
          @if (tableRows().length) {
            <ds-container kind="section" name="tabla-pregunta">
              <ds-data-table-card
                title="Detalle por categoría"
                [subtitle]="q.label + ' · base ' + baseOf(q) + ' respuestas'"
                [columns]="tableColumns"
                [rows]="tableRows()"
                emptyTitle="Sin datos"
              />
            </ds-container>
          }
        }

        <!-- TABLA: RESUMEN DE PREGUNTAS -->
        <ds-container kind="section" name="tabla-preguntas">
          <ds-data-table-card
            title="Preguntas de la encuesta"
            subtitle="Subconjunto filtrado"
            [columns]="summaryColumns"
            [rows]="summaryRows()"
            emptyTitle="Sin preguntas"
            emptyBody="Ajuste los filtros o elija otra encuesta."
          />
        </ds-container>

        <!-- TABLA: RESPUESTAS ABIERTAS -->
        @if (commentRows().length) {
          <ds-container kind="section" name="comentarios">
            <ds-data-table-card
              title="Respuestas abiertas"
              subtitle="Comentarios recientes"
              [columns]="commentColumns"
              [rows]="commentRows()"
              emptyTitle="Sin comentarios"
            />
          </ds-container>
        }
      </ds-container>
    </ds-container>
  `,
  styles: `
    .panel__body { padding: var(--ds-space-4); display: flex; flex-direction: column; gap: var(--ds-space-4); }
    .panel__fuente { display: inline-flex; gap: 0.4rem; align-items: center; color: inherit; }
  `,
})
export class PanelEncuestaPage {
  readonly state: PanelStateContract = inject(PANEL_STATE);

  readonly tableColumns: DsTableColumn[] = [
    { key: 'label', label: 'Categoría' },
    { key: 'count', label: 'Conteo' },
    { key: 'pct', label: '%', format: (v) => (v == null ? '—' : `${v}%`) },
  ];

  readonly summaryColumns: DsTableColumn[] = [
    { key: 'position', label: '#' },
    { key: 'label', label: 'Pregunta' },
    { key: 'type', label: 'Tipo' },
    { key: 'visual', label: 'Visual' },
    { key: 'base', label: 'Respuestas' },
  ];

  readonly commentColumns: DsTableColumn[] = [
    { key: 'n', label: '#' },
    { key: 'text', label: 'Comentario' },
  ];

  readonly filters = computed<PanelFilter[]>(() => [
    {
      label: 'Tipo',
      value: 'tipo',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Opción única', value: 'single_choice' },
        { label: 'Opción múltiple', value: 'multi_choice' },
        { label: 'Escala', value: 'scale' },
        { label: 'Texto', value: 'short_text' },
      ],
    },
    {
      label: 'Pregunta',
      value: 'pregunta',
      options: this.state.filtered().map((q) => ({ label: q.label, value: q.id })),
    },
  ]);

  readonly kpis = computed<DsKpiItem[]>(() => {
    const t = this.state.dashboard()?.totals;
    if (!t) return [];
    return [
      { label: 'Respuestas', value: t.total, icon: 'file-text', tone: 'neutral' },
      { label: 'Finalización', value: `${Math.round((t.completionRate ?? 0) * 100)}%`, icon: 'check', tone: 'success' },
      { label: 'Abandono', value: `${Math.round((t.abandonmentRate ?? 0) * 100)}%`, icon: 'alert-circle', tone: 'danger' },
      { label: 'En curso', value: t.in_progress, icon: 'activity', tone: 'info' },
    ];
  });

  readonly chart = computed<ChartVm>(() => {
    const q = this.state.selected();
    if (!q) return { type: 'none', base: 0 };
    const base = questionBase(q);
    if (q.kind === 'choice') {
      const opts = q.options ?? [];
      if (q.type === 'multi_choice' || opts.length > 8) {
        return {
          type: 'grouped',
          base,
          categories: opts.map((o) => o.value),
          series: [{ name: q.label, data: opts.map((o) => o.count) }],
        };
      }
      const segments: DonutSegment[] = opts.map((o, i) => ({
        label: o.value,
        value: o.count,
        percent: base ? Math.round((o.count / base) * 100) : 0,
        color: PALETTE[i % PALETTE.length],
      }));
      return { type: 'donut', base, total: base, segments };
    }
    if (q.kind === 'numeric') {
      const dist = q.distribution ?? [];
      return {
        type: 'grouped',
        base,
        categories: dist.map((d) => String(d.value)),
        series: [{ name: q.label, data: dist.map((d) => d.count) }],
      };
    }
    return { type: 'none', base };
  });

  readonly tableRows = computed<DsTableRow[]>(() => {
    const q = this.state.selected();
    if (!q) return [];
    if (q.kind === 'choice') {
      const opts = q.options ?? [];
      const base = opts.reduce((s, o) => s + o.count, 0);
      return opts.map((o) => ({ label: o.value, count: o.count, pct: base ? Math.round((o.count / base) * 100) : 0 }));
    }
    if (q.kind === 'numeric') {
      const dist = q.distribution ?? [];
      const base = dist.reduce((s, d) => s + d.count, 0);
      return dist.map((d) => ({ label: String(d.value), count: d.count, pct: base ? Math.round((d.count / base) * 100) : 0 }));
    }
    return [];
  });

  readonly summaryRows = computed<DsTableRow[]>(() =>
    this.state.filtered().map((q, i) => {
      const s = summarize(q);
      return { position: i + 1, label: s.label, type: s.type, visual: s.visual, base: s.base };
    }),
  );

  readonly commentRows = computed<DsTableRow[]>(() => {
    const q = this.state.selected();
    if (!q || q.kind !== 'text') return [];
    return (q.comments ?? []).map((c, i) => ({ n: i + 1, text: c }));
  });

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'panel-encuesta',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Panel por encuesta · INTT' },
    });
    void this.state.loadSources();
  }

  exportUrl(): string {
    return `${API_BASE}/analytics/surveys/${this.state.surveyId()}/export`;
  }

  baseOf(q: QuestionAnalytics): number {
    return questionBase(q);
  }

  baseLabel(): string {
    return `Base: ${this.chart().base} respuestas`;
  }

  onSurvey(event: Event): void {
    void this.state.selectSurvey((event.target as HTMLSelectElement).value);
  }

  onFilters(active: Record<string, string>): void {
    this.state.setType(active['tipo'] ?? '');
    this.state.setQuestion(active['pregunta'] ?? '');
  }
}
