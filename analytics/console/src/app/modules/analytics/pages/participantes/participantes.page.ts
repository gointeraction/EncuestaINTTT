import { Component, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { PARTICIPANTS_STATE, type ParticipantsStateContract } from './business/contracts/participants.state.contract';
import { ParticipantsStateService } from './business/state/participants.state.service';

/**
 * @akuri-page
 * page: participantes
 * route: /analitica/participantes
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-participantes-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [
    ParticipantsStateService,
    { provide: PARTICIPANTS_STATE, useExisting: ParticipantsStateService },
  ],
  template: `
    <ds-container kind="page" name="participantes" class="page-max">
      <ds-container kind="area" name="header" style="padding: var(--ds-space-2) var(--ds-space-4)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Participantes del sorteo"
                subtitle="Analítica · INTT"
                [showBack]="false"
              />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <ds-container kind="section" name="lista">
          @if (state.page(); as p) {
            <p class="pt__meta">
              {{ p.total }} participantes · página {{ p.page }} de {{ p.totalPages }}
            </p>
            <table class="pt__table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Código</th>
                  <th>Momento</th>
                </tr>
              </thead>
              <tbody>
                @for (i of p.items; track i.id) {
                  <tr>
                    <td>{{ i.nombre }}</td>
                    <td>{{ i.cedula }}</td>
                    <td>{{ i.telefono }}</td>
                    <td>{{ i.codigo }}</td>
                    <td>{{ i.momento }}</td>
                  </tr>
                }
              </tbody>
            </table>
            <div class="pt__pager">
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
    .pt__meta { margin: 0 0 var(--ds-space-3); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .pt__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .pt__table th, .pt__table td { text-align: left; padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-subtle); }
    .pt__table th { color: var(--ds-text-muted); font-weight: 600; }
    .pt__pager { display: flex; gap: var(--ds-space-3); margin-top: var(--ds-space-4); }
  `,
})
export class ParticipantesPage {
  readonly state: ParticipantsStateContract = inject(PARTICIPANTS_STATE);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'participantes',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Participantes · INTT' },
    });
    void this.state.load(1);
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
