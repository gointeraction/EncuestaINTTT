import { Component, computed, inject } from '@angular/core';
import {
  DsChartCardComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsKpiGridComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsChartSeries,
  type DsKpiItem,
} from '@cifraflow/design';
import { ANOMALIES_STATE, type AnomaliesStateContract } from './business/contracts/anomalies.state.contract';
import { AnomaliesStateService } from './business/state/anomalies.state.service';

/**
 * @akuri-page
 * page: anomalias
 * route: /anomalias
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-anomalias-page',
  standalone: true,
  imports: [
    DsContainerComponent,
    DsHeaderComponent,
    DsPageTitleComponent,
    DsKpiGridComponent,
    DsChartCardComponent,
  ],
  providers: [AnomaliesStateService, { provide: ANOMALIES_STATE, useExisting: AnomaliesStateService }],
  template: `
    <ds-container kind="page" name="anomalias" class="page-max">
      <ds-container kind="area" name="header" style="padding: var(--ds-space-2) var(--ds-space-4)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Anomalías · Encuesta Visión Cero"
                subtitle="Anti-fraude · dispositivos, respuestas idénticas y picos"
                [showBack]="false"
              />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <ds-container kind="section" name="kpis">
          @if (kpis().length) {
            <ds-kpi-grid [items]="kpis()" />
          } @else {
            <p>Sin datos.</p>
          }
        </ds-container>

        @if (data(); as a) {
          <div class="an">
            <ds-container kind="section" name="by-device">
              <h3 class="an__title">Cuestionarios por dispositivo</h3>
              <ul class="an__list">
                @for (d of a.byDevice; track d.id + d.channel) {
                  <li>
                    <span>{{ d.id }} <small>· {{ d.channel }}</small></span>
                    <b>{{ d.count }}</b>
                  </li>
                }
              </ul>
            </ds-container>

            <ds-container kind="section" name="duplicates">
              <h3 class="an__title">Respuestas idénticas</h3>
              <ul class="an__list">
                <li><span>Grupos de respuestas idénticas</span><b>{{ a.duplicateAnswers.groups }}</b></li>
                <li><span>Máx. repeticiones de un mismo lote</span><b>{{ a.duplicateAnswers.max }}</b></li>
              </ul>
            </ds-container>
          </div>

          @if (a.hourly.length > 1) {
            <ds-container kind="section" name="hourly" style="margin-top: var(--ds-space-6)">
              <ds-chart-card
                title="Picos por hora"
                subtitle="Cuestionarios por hora (últimas 48 h)"
                [categories]="hourlyChart().categories"
                [series]="hourlyChart().series"
              />
            </ds-container>
          }
        }
      </ds-container>
    </ds-container>
  `,
  styles: `
    .an {
      display: grid; gap: var(--ds-space-6);
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      margin-top: var(--ds-space-6);
    }
    .an__title { margin: 0 0 var(--ds-space-3); font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .an__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }
    .an__list li { display: flex; justify-content: space-between; gap: var(--ds-space-3); font-size: var(--ds-text-small); border-bottom: 1px solid var(--ds-border-subtle); padding-bottom: var(--ds-space-1); }
    .an__list small { color: var(--ds-text-muted); }
    .an__list b { color: var(--ds-color-brand-primary); }
  `,
})
export class AnomaliasPage {
  readonly state: AnomaliesStateContract = inject(ANOMALIES_STATE);

  readonly data = computed(() => this.state.payload());

  readonly kpis = computed<DsKpiItem[]>(() => {
    const a = this.state.payload();
    if (!a) return [];
    const devices = a.byDevice.filter((d) => d.id !== '(público)');
    const maxDevice = a.byDevice.reduce((m, d) => Math.max(m, d.count), 0);
    const peak = a.hourly.reduce((m, h) => Math.max(m, h.count), 0);
    return [
      { label: 'Dispositivos', value: devices.length, icon: 'smartphone', tone: 'neutral' },
      { label: 'Envío mayor', value: maxDevice, icon: 'alert-triangle', tone: 'warning' },
      { label: 'Grupos idénticos', value: a.duplicateAnswers.groups, icon: 'copy', tone: 'danger' },
      { label: 'Pico por hora', value: peak, icon: 'activity', tone: 'warning' },
    ];
  });

  readonly hourlyChart = computed<{ categories: string[]; series: DsChartSeries[] }>(() => {
    const points = this.state.payload()?.hourly ?? [];
    return {
      categories: points.map((p) => p.hour.slice(11)),
      series: [{ name: 'Cuestionarios', data: points.map((p) => p.count) }],
    };
  });

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'anomalias',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Anomalías · INTT' },
    });
    void this.state.load();
  }
}
