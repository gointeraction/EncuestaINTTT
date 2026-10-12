import { Component, computed, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsChartCardComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsKpiGridComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsChartSeries,
  type DsKpiItem,
} from '@cifraflow/design';
import { GLOBAL_STATE, type GlobalStateContract } from './business/contracts/global.state.contract';
import { GlobalStateService } from './business/state/global.state.service';

/**
 * @akuri-page
 * page: global
 * route: /analitica
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-global-page',
  standalone: true,
  imports: [
    DsContainerComponent,
    DsHeaderComponent,
    DsPageTitleComponent,
    DsKpiGridComponent,
    DsButtonComponent,
    DsChartCardComponent,
  ],
  providers: [GlobalStateService, { provide: GLOBAL_STATE, useExisting: GlobalStateService }],
  template: `
    <ds-container kind="page" name="global" class="page-max">
      <ds-container
        kind="area"
        name="header"
        style="padding: var(--ds-space-2) var(--ds-space-4)"
      >
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Panel global · Encuesta Visión Cero" subtitle="Siniestros de motocicletas · INTT" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <ds-button size="sm" [loading]="state.loading()" (click)="summarize()">
                Recalcular sumarización
              </ds-button>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <ds-container kind="section" name="kpis">
          @if (kpis().length) {
            <ds-kpi-grid [items]="kpis()" />
          } @else {
            <p>Sin datos. Pulse «Recalcular sumarización».</p>
          }
          @if (state.run(); as r) { <p>{{ r }}</p> }
        </ds-container>

        @if (data(); as g) {
          <div class="gb">
            <ds-container kind="section" name="by-driver">
              <h3 class="gb__title">Por tipo de conductor</h3>
              <ul class="gb__list">
                @for (d of g.byDriverType; track d.id) {
                  <li><span>{{ d.label }}</span><b>{{ d.responses }}</b></li>
                }
              </ul>
            </ds-container>

            <ds-container kind="section" name="by-channel">
              <h3 class="gb__title">Por canal</h3>
              <ul class="gb__list">
                @for (c of g.byChannel; track c.id) {
                  <li><span>{{ c.label ?? c.id }}</span><b>{{ c.responses }}</b></li>
                }
              </ul>
            </ds-container>
          </div>
        }

        @if (state.timeline().length > 1) {
          <ds-container kind="section" name="timeline" style="margin-top: var(--ds-space-6)">
            <ds-chart-card
              title="Cuestionarios en el tiempo"
              subtitle="Cuestionarios respondidos por día"
              [categories]="timelineChart().categories"
              [series]="timelineChart().series"
            />
          </ds-container>
        }
      </ds-container>
    </ds-container>
  `,
  styles: `
    .gb {
      display: grid; gap: var(--ds-space-6);
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      margin-top: var(--ds-space-6);
    }
    .gb__title { margin: 0 0 var(--ds-space-3); font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .gb__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }
    .gb__list li { display: flex; justify-content: space-between; gap: var(--ds-space-3); font-size: var(--ds-text-small); border-bottom: 1px solid var(--ds-border-subtle); padding-bottom: var(--ds-space-1); }
    .gb__list b { color: var(--ds-color-brand-primary); }
  `,
})
export class GlobalPage {
  readonly state: GlobalStateContract = inject(GLOBAL_STATE);

  readonly data = computed(() => this.state.payload());

  readonly kpis = computed<DsKpiItem[]>(() => {
    const g = this.state.payload();
    if (!g) return [];
    return [
      { label: 'Cuestionarios', value: g.totalResponses, icon: 'file-text', tone: 'info' },
      { label: 'En el sorteo', value: g.sorteo, icon: 'check-circle', tone: 'success' },
      { label: 'Tipos de conductor', value: g.byDriverType.length, icon: 'users', tone: 'neutral' },
      { label: 'Canales', value: g.byChannel.length, icon: 'pie-chart', tone: 'neutral' },
    ];
  });

  readonly timelineChart = computed<{ categories: string[]; series: DsChartSeries[] }>(() => {
    const points = this.state.timeline();
    return {
      categories: points.map((p) => p.day),
      series: [{ name: 'Cuestionarios', data: points.map((p) => p.total) }],
    };
  });

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'global',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Panel global · INTT' },
    });
    void this.state.load();
  }

  summarize(): void {
    void this.state.summarize();
  }
}
