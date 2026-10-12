import { Component, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
  NumPipe,
} from '@cifraflow/design';
import { ENCUESTAS_STATE, type EncuestasStateContract } from './business/contracts/encuestas.state.contract';
import { EncuestasStateService } from './business/state/encuestas.state.service';
import { FilterBuilderComponent } from '../../../../shared/components/filter-builder/filter-builder.component';

const CHANNEL_LABEL: Record<string, string> = {
  public: 'Autoservicio',
  kiosk: 'Kiosco',
  surveyor: 'Encuestador',
  seed: 'Seed',
};

/**
 * @akuri-page
 * page: encuestas
 * route: /analitica/encuestas
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-encuestas-page',
  standalone: true,
  imports: [NumPipe, DsButtonComponent, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, FilterBuilderComponent],
  providers: [EncuestasStateService, { provide: ENCUESTAS_STATE, useExisting: EncuestasStateService }],
  template: `
    <ds-container kind="page" name="encuestas">
      <ds-container kind="area" name="header" class="pg" style="padding-block: var(--ds-space-2)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Encuestas" subtitle="Todas las respuestas · Analítica · INTT" [showBack]="false" />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="pg" style="padding-block: var(--ds-space-4)">
        <ds-container kind="section" name="filtros">
          <app-filter-builder
            [questions]="state.filterQuestions()"
            [value]="state.filters()"
            (valueChange)="state.setFilters($event)"
          />
          <div class="en__apply">
            <ds-button size="sm" [loading]="state.loading()" (click)="state.applyFilters()">Aplicar filtros</ds-button>
          </div>
        </ds-container>

        <ds-container kind="section" name="lista">
          @if (state.page(); as p) {
            <p class="en__meta">
              {{ p.total | num }} encuestas · página {{ p.page | num }} de {{ p.totalPages | num }}
            </p>
            <table class="en__table">
              <thead>
                <tr>
                  <th>Tipo de conductor</th>
                  <th>Canal</th>
                  <th>Fecha</th>
                  <th>En sorteo</th>
                  <th>Cédula</th>
                </tr>
              </thead>
              <tbody>
                @for (i of p.items; track i.id) {
                  <tr>
                    <td>{{ i.driverType }}</td>
                    <td>{{ channel(i.channel) }}</td>
                    <td>{{ fmtDate(i.momento) }}</td>
                    <td>{{ i.participaSorteo ? 'Sí' : 'No' }}</td>
                    <td>{{ i.cedula }}</td>
                  </tr>
                }
              </tbody>
            </table>
            <div class="en__pager">
              <ds-button size="sm" [disabled]="p.page <= 1" (click)="prev()">Anterior</ds-button>
              <ds-button size="sm" [disabled]="p.page >= p.totalPages" (click)="next()">Siguiente</ds-button>
            </div>
          } @else {
            <p>Sin datos.</p>
          }
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .en__apply { display: flex; justify-content: flex-end; margin-top: var(--ds-space-3); }
    .en__meta { margin: 0 0 var(--ds-space-3); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .en__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .en__table th, .en__table td { text-align: left; padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-subtle); }
    .en__table th { color: var(--ds-text-muted); font-weight: 600; }
    .en__pager { display: flex; gap: var(--ds-space-3); margin-top: var(--ds-space-4); }
  `,
})
export class EncuestasPage {
  readonly state: EncuestasStateContract = inject(ENCUESTAS_STATE);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'encuestas',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Encuestas · INTT' },
    });
  }

  channel(id?: string): string {
    return id ? (CHANNEL_LABEL[id] ?? id) : '';
  }

  fmtDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-VE');
  }

  prev(): void {
    const p = this.state.page();
    if (p && p.page > 1) void this.state.go(p.page - 1);
  }
  next(): void {
    const p = this.state.page();
    if (p && p.page < p.totalPages) void this.state.go(p.page + 1);
  }
}
