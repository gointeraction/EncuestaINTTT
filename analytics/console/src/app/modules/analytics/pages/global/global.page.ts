import { Component, computed, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsKpiGridComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsKpiItem,
} from '@cifraflow/design';
import { GLOBAL_STATE, type GlobalStateContract } from './business/contracts/global.state.contract';
import { GlobalStateService } from './business/state/global.state.service';

/**
 * @akuri-page
 * page: global
 * route: /
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
  ],
  providers: [GlobalStateService, { provide: GLOBAL_STATE, useExisting: GlobalStateService }],
  template: `
    <ds-container kind="page" name="global">
      <ds-container
        kind="area"
        name="header"
        style="padding: var(--ds-space-2) var(--ds-space-4)"
      >
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Panel global" subtitle="Visión Cero · INTT" [showBack]="false" />
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
      </ds-container>
    </ds-container>
  `,
})
export class GlobalPage {
  readonly state: GlobalStateContract = inject(GLOBAL_STATE);

  readonly kpis = computed<DsKpiItem[]>(() => {
    const g = this.state.payload();
    if (!g) return [];
    return [
      { label: 'Encuestas', value: g.totalSurveys, icon: 'database', tone: 'info' },
      { label: 'Respuestas', value: g.totalResponses, icon: 'file-text', tone: 'neutral' },
      { label: 'Completadas', value: g.completed, icon: 'check', tone: 'success' },
      { label: 'Abandonadas', value: g.abandoned, icon: 'alert-circle', tone: 'danger' },
    ];
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
