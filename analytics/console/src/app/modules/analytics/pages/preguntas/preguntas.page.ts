import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  DsContainerComponent,
  DsDataTableCardComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsTableColumn,
  type DsTableRow,
} from '@cifraflow/design';
import { PREGUNTAS_STATE, type PreguntasStateContract } from './business/contracts/preguntas.state.contract';
import { PreguntasStateService } from './business/state/preguntas.state.service';

/**
 * @akuri-page
 * page: preguntas
 * route: /preguntas
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-preguntas-page',
  standalone: true,
  imports: [
    DsContainerComponent,
    DsHeaderComponent,
    DsPageTitleComponent,
    DsDataTableCardComponent,
  ],
  providers: [PreguntasStateService, { provide: PREGUNTAS_STATE, useExisting: PreguntasStateService }],
  template: `
    <ds-container kind="page" name="preguntas" class="page-max">
      <ds-container kind="area" name="header" style="padding: var(--ds-space-2) var(--ds-space-4)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Preguntas del cuestionario" subtitle="Catálogo · Visión Cero" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <div class="preg__filtros">
                <input type="search" placeholder="Buscar pregunta…"
                       [value]="state.search()" (input)="state.setSearch(value($event))" />
                <select [value]="state.typeFilter()" (change)="state.setType(value($event))">
                  <option value="">Todos los tipos</option>
                  <option value="single_choice">Opción única</option>
                  <option value="multi_choice">Opción múltiple</option>
                  <option value="number">Numérica</option>
                  <option value="text">Texto</option>
                </select>
              </div>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <ds-container kind="section" name="catalogo">
          <ds-data-table-card
            title="Preguntas de la encuesta"
            subtitle="Haz clic en una pregunta para ver su detalle"
            [columns]="columns"
            [rows]="rows()"
            rowsTrack="id"
            [loading]="state.loading()"
            (rowClick)="open($event)"
            emptyTitle="Sin preguntas"
            emptyBody="Ajusta la búsqueda o el tipo."
          />
          @if (state.error(); as e) { <p role="alert" class="preg__error">{{ e }}</p> }
        </ds-container>

        @if (state.derivedRows().length) {
          <ds-container kind="section" name="derivadas" style="margin-top: var(--ds-space-6)">
            <ds-data-table-card
              title="Preguntas autocontestadas (derivadas)"
              subtitle="Se responden a partir de las respuestas anteriores, con un algoritmo"
              [columns]="columns"
              [rows]="rowsDer()"
              rowsTrack="id"
              (rowClick)="open($event)"
              emptyTitle="Sin preguntas derivadas"
            />
          </ds-container>
        }
      </ds-container>
    </ds-container>
  `,
  styles: `
    .preg__filtros { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-3); }
    .preg__filtros input, .preg__filtros select {
      padding: var(--ds-space-2); border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-md); font-size: var(--ds-text-input);
    }
    .preg__error { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
  `,
})
export class PreguntasPage {
  readonly state: PreguntasStateContract = inject(PREGUNTAS_STATE);
  private readonly router = inject(Router);

  protected readonly columns: DsTableColumn[] = [
    { key: 'position', label: '#' },
    { key: 'label', label: 'Pregunta' },
    { key: 'type', label: 'Tipo' },
    { key: 'visual', label: 'Forma' },
    { key: 'base', label: 'Base' },
  ];

  readonly rows = computed<DsTableRow[]>(() =>
    this.state.rows().map((r) => ({
      id: r.id,
      position: r.position,
      label: r.label,
      type: r.type,
      visual: r.visual,
      base: r.base,
    })),
  );

  readonly rowsDer = computed<DsTableRow[]>(() =>
    this.state.derivedRows().map((r) => ({
      id: r.id,
      position: r.position,
      label: r.label,
      type: r.type,
      visual: r.visual,
      base: r.base,
    })),
  );

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'preguntas',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Preguntas del cuestionario · INTT' },
    });
    void this.state.load();
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  open(row: DsTableRow): void {
    const id = (row as Record<string, unknown>)['id'];
    if (id) void this.router.navigate(['/panel'], { queryParams: { q: String(id) } });
  }
}
