import { Component, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsEmptyStateComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { REPORTES_STATE, type ReportesStateContract } from './business/contracts/reportes.state.contract';
import { ReportesStateService } from './business/state/reportes.state.service';

/**
 * @akuri-page
 * page: reportes-cruzados
 * route: /analitica/reportes-cruzados
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-reportes-cruzados-page',
  standalone: true,
  imports: [
    DsContainerComponent,
    DsHeaderComponent,
    DsPageTitleComponent,
    DsButtonComponent,
    DsEmptyStateComponent,
  ],
  providers: [ReportesStateService, { provide: REPORTES_STATE, useExisting: ReportesStateService }],
  template: `
    <ds-container kind="page" name="reportes-cruzados">
      <ds-container kind="area" name="header" class="pg" style="padding-block: var(--ds-space-2)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Reportes cruzados · Encuesta Visión Cero" subtitle="Analítica · INTT" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <label class="rep__field">Encuesta
                <select class="ds-select" [value]="state.surveyId()" (change)="state.setSurvey(value($event))">
                  <option value="">Seleccione…</option>
                  @for (s of state.sources(); track s.id) {
                    <option [value]="s.id">{{ s.title }}</option>
                  }
                </select>
              </label>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="pg" style="padding-block: var(--ds-space-4)">
        <ds-container kind="section" name="controles" class="rep">
          @if (state.questions().length) {
            <div class="rep__row">
              <label class="rep__field">Pregunta A
                <select class="ds-select" [value]="state.q1()" (change)="state.setQ1(value($event))">
                  @for (q of state.questions(); track q.id) { <option [value]="q.id">{{ q.position ? q.position + '. ' : '' }}{{ q.label }}</option> }
                </select>
              </label>
              <label class="rep__field">Pregunta B
                <select class="ds-select" [value]="state.q2()" (change)="state.setQ2(value($event))">
                  @for (q of state.questions(); track q.id) { <option [value]="q.id">{{ q.position ? q.position + '. ' : '' }}{{ q.label }}</option> }
                </select>
              </label>
              <ds-button [loading]="state.loading()" (click)="state.run()">Cruzar</ds-button>
            </div>
          }

          @if (state.error(); as e) { <p role="alert" class="rep__error">{{ e }}</p> }

          @if (state.result(); as r) {
            <p class="rep__base">
              Base pregunta A: <b>{{ r.baseA }}</b> · Base pregunta B: <b>{{ r.baseB }}</b> ·
              Base del cruce: <b>{{ r.baseBoth }}</b>
            </p>
            <div class="rep__tablewrap">
              <table class="rep__table">
                <thead>
                  <tr><th></th>@for (c of r.categoriesB; track c) { <th>{{ c }}</th> }</tr>
                </thead>
                <tbody>
                  @for (ra of r.categoriesA; track ra) {
                    <tr><th>{{ ra }}</th>@for (cb of r.categoriesB; track cb) { <td>{{ cell(ra, cb) }}</td> }</tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (state.surveyId() && state.questions().length) {
            <ds-empty-state title="Sin cruce" message="Elige dos preguntas y pulsa «Cruzar»." />
          }
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .rep { max-width: 1100px; display: flex; flex-direction: column; gap: var(--ds-space-4); }
    .rep__row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--ds-space-4); }
    .rep__field { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); }
    .rep__field select { padding: var(--ds-space-2); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-md); font-size: var(--ds-text-input); }
    .rep__error { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
    .rep__base { margin: 0; font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .rep__tablewrap { overflow: auto; border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-md); }
    .rep__table { border-collapse: collapse; font-size: var(--ds-text-small); }
    .rep__table th, .rep__table td { border: 1px solid var(--ds-border-subtle); padding: var(--ds-space-1) var(--ds-space-2); text-align: right; white-space: nowrap; }
    .rep__table thead th, .rep__table tbody th { background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on); text-align: left; position: sticky; top: 0; }
  `,
})
export class ReportesCruzadosPage {
  readonly state: ReportesStateContract = inject(REPORTES_STATE);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'reportes-cruzados',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Reportes cruzados · INTT' },
    });
    void this.state.loadSources();
  }

  value(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  cell(a: string, b: string): number {
    return this.state.result()?.cells.find((c) => c.v1 === a && c.v2 === b)?.n ?? 0;
  }
}
