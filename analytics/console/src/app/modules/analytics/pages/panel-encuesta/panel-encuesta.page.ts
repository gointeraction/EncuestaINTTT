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
  type PanelFilter,
  type QuestionAnalytics,
} from './business/models/panel.model';
import { ActivatedRoute } from '@angular/router';
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
 * búsqueda, tipo, pregunta y segmento por dimensión), KPIs de la muestra, el
 * gráfico según el tipo de pregunta, la línea de tiempo y las tablas de detalle.
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
    <ds-container kind="page" name="panel-encuesta" class="page-max">
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
          @if (state.dimensionId() && state.dimensionValue()) {
            <p class="panel__segment">
              Segmento activo:
              <strong>{{ segmentLabel() }}</strong>
            </p>
          }
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
          <div class="panel__detail">
          <ds-container kind="section" name="grafico">
            @if (questionKpis().length > 1) {
              <ds-kpi-grid [items]="questionKpis()" />
            }
            @switch (chart().type) {
              @case ('donut') {
                <ds-chart-card
                  type="donut"
                  [title]="q.label"
                  [subtitle]="metaLabel(q)"
                  [total]="chart().total ?? 0"
                  totalLabel="RESPUESTAS"
                  [segments]="chart().segments ?? []"
                />
              }
              @case ('grouped') {
                <ds-chart-card
                  type="hbars"
                  [title]="q.label"
                  [subtitle]="metaLabel(q)"
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
                [subtitle]="metaLabel(q)"
                [columns]="tableColumns"
                [rows]="tableRows()"
                emptyTitle="Sin datos"
              />
            </ds-container>
          }
          </div>
          @if (q.kind === 'numeric' && q.stats) {
            <ds-container kind="section" name="estadisticos">
              <h3 class="panel__stats-title">Estadísticos de {{ q.label }}</h3>
              <div class="panel__stats">
                <div><span>Media</span><b>{{ fmt(q.stats.mean) }}</b></div>
                <div><span>Mediana</span><b>{{ fmt(q.stats.median) }}</b></div>
                <div><span>Moda</span><b>{{ fmt(q.stats.mode) }}</b></div>
                <div><span>Desv. estándar</span><b>{{ fmt(q.stats.stdDev) }}</b></div>
                <div><span>Mín</span><b>{{ fmt(q.stats.min) }}</b></div>
                <div><span>Máx</span><b>{{ fmt(q.stats.max) }}</b></div>
                <div><span>N</span><b>{{ q.stats.count }}</b></div>
              </div>
            </ds-container>
          }
        }

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
    /* Gráfico y detalle por categoría, uno al lado del otro (envuelve en pantallas menores). */
    .panel__detail { display: grid; gap: var(--ds-space-4); grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
    @media (max-width: 1024px) { .panel__detail { grid-template-columns: minmax(0, 1fr); } }
    .panel__fuente { display: inline-flex; gap: 0.4rem; align-items: center; color: inherit; }
    .panel__segment { margin: var(--ds-space-2) 0 0; font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .panel__stats-title { margin: 0 0 var(--ds-space-3); font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .panel__stats { display: grid; gap: var(--ds-space-3); grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr)); }
    .panel__stats div { display: flex; flex-direction: column; gap: 2px; border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-md); padding: var(--ds-space-3); background: var(--ds-surface-card); }
    .panel__stats span { font-size: var(--ds-text-caption); color: var(--ds-text-muted); text-transform: uppercase; letter-spacing: var(--ds-letter-spacing-wide); }
    .panel__stats b { font-size: var(--ds-text-large); color: var(--ds-color-brand-primary); font-variant-numeric: tabular-nums; }
  `,
})
export class PanelEncuestaPage {
  readonly state: PanelStateContract = inject(PANEL_STATE);

  readonly tableColumns: DsTableColumn[] = [
    { key: 'label', label: 'Categoría' },
    { key: 'count', label: 'Conteo' },
    { key: 'pct', label: '%', format: (v) => (v == null ? '—' : `${v}%`) },
  ];

  readonly commentColumns: DsTableColumn[] = [
    { key: 'n', label: '#' },
    { key: 'text', label: 'Comentario' },
  ];

  readonly filters = computed<PanelFilter[]>(() => {
    const dimId = this.state.dimensionId();
    const dimension = this.state.dimensions().find((d) => d.id === dimId);
    return [
      {
        label: 'Tipo',
        value: 'tipo',
        options: [
          { label: 'Todos', value: '' },
          { label: 'Opción única', value: 'single_choice' },
          { label: 'Opción múltiple', value: 'multi_choice' },
          { label: 'Escala', value: 'scale' },
          { label: 'Numérica', value: 'number' },
          { label: 'Texto', value: 'short_text' },
        ],
      },
      {
        label: 'Pregunta',
        value: 'pregunta',
        options: this.state.filtered().map((q) => ({
          label: (q.position ? q.position + '. ' : '') + q.label,
          value: q.id,
        })),
      },
      {
        label: 'Segmento',
        value: 'dimension',
        options: this.state.dimensions().map((d) => ({ label: d.label, value: d.id })),
      },
      {
        label: 'Valor',
        value: 'valor',
        options: (dimension?.options ?? []).map((o) => ({ label: o.label, value: o.value })),
      },
    ];
  });

  readonly kpis = computed<DsKpiItem[]>(() => {
    const t = this.state.dashboard()?.totals;
    if (!t) return [];
    // Solo se aceptan cuestionarios COMPLETOS y VÁLIDOS → no hay finalización/abandono/en curso.
    const items: DsKpiItem[] = [
      { label: 'Cuestionarios (muestra)', value: t.total, icon: 'file-text', tone: 'neutral' },
    ];
    const q = this.state.selected();
    if (q) {
      const base = questionBase(q);
      items.push({ label: 'Base (pregunta)', value: base, icon: 'check-circle', tone: 'info' });
      if (base < t.total) {
        items.push({ label: 'No aplica / sin dato', value: t.total - base, icon: 'alert-circle', tone: 'neutral' });
      }
    }
    return items;
  });

  readonly questionKpis = computed<DsKpiItem[]>(() => {
    const q = this.state.selected();
    if (!q) return [];
    const items: DsKpiItem[] = [];
    if (q.kind === 'numeric' && q.average != null) {
      items.push({ label: 'Promedio', value: q.average.toFixed(2), icon: 'activity', tone: 'info' });
    }
    return items;
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
    void this.state.loadSources(inject(ActivatedRoute).snapshot.queryParams['q'] ?? '');
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

  fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '—';
  }

  /** Tipo de respuesta + (si es derivada) su origen + base. */
  metaLabel(q: QuestionAnalytics): string {
    const types: Record<string, string> = {
      single_choice: 'Opción única',
      multi_choice: 'Opción múltiple',
      scale: 'Escala',
      rating: 'Escala',
      number: 'Numérica',
      text: 'Texto',
      short_text: 'Texto',
      long_text: 'Texto',
      dropdown: 'Opción única',
      radio: 'Opción única',
      checkbox: 'Opción múltiple',
    };
    const parts = [types[q.type] ?? q.type];
    if (q.derived) {
      const all = this.state.dashboard()?.questions ?? [];
      const src = (q.sources ?? [])
        .map((id) => all.find((x) => x.id === id)?.label ?? id)
        .join(', ');
      parts.push('Autocontestada' + (src ? ` (de: ${src})` : ''));
    }
    parts.push(`Base: ${questionBase(q)} respuestas`);
    return parts.join(' · ');
  }

  segmentLabel(): string {
    const dimension = this.state.dimensions().find((d) => d.id === this.state.dimensionId());
    return `${dimension?.label ?? '—'} = ${this.state.dimensionValue()}`;
  }

  onSurvey(event: Event): void {
    void this.state.selectSurvey((event.target as HTMLSelectElement).value);
  }

  onFilters(active: Record<string, string>): void {
    this.state.setType(active['tipo'] ?? '');
    this.state.setQuestion(active['pregunta'] ?? '');
    void this.state.setDimension(active['dimension'] ?? '', active['valor'] ?? '');
  }
}
