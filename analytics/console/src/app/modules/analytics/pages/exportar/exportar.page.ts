import { Component, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { downloadUrl } from '../../../../core/download';
import { EXPORT_STATE, type ExportStateContract } from './business/contracts/export.state.contract';
import { ExportStateService } from './business/state/export.state.service';

/**
 * @akuri-page
 * page: exportar
 * route: /analitica/exportar
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-exportar-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [ExportStateService, { provide: EXPORT_STATE, useExisting: ExportStateService }],
  template: `
    <ds-container kind="page" name="exportar">
      <ds-container kind="area" name="header" class="pg" style="padding-block: var(--ds-space-2)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Exportar datos"
                subtitle="Cuestionario y datos recolectados (CSV) · INTT"
                [showBack]="false"
              />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="pg" style="padding-block: var(--ds-space-4)">
        <ds-container kind="section" name="cuestionario">
          <h3 class="exp__title">Cuestionario</h3>
          <p class="exp__text">
            Definición del cuestionario: catálogo de preguntas (propias y autocontestadas) con
            su origen y las preguntas de las que derivan.
          </p>
          <ds-button icon="download" (click)="downloadQuestionnaire()">
            Descargar cuestionario (CSV)
          </ds-button>
        </ds-container>

        <ds-container kind="section" name="datos" style="margin-top: var(--ds-space-6)">
          <h3 class="exp__title">Datos recolectados</h3>
          <p class="exp__text">
            Una fila por entrevista y una columna por pregunta (incluidas las autocontestadas).
            El personal que no sea administrador recibe los datos personales (nombre, cédula,
            teléfono) <b>enmascarados</b>.
          </p>
          <ds-button icon="download" (click)="downloadCollected()">
            Descargar datos recolectados (CSV)
          </ds-button>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .exp__title { margin: 0 0 var(--ds-space-2); font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .exp__text { margin: 0 0 var(--ds-space-3); max-width: 60ch; font-size: var(--ds-text-small); color: var(--ds-text-muted); }
  `,
})
export class ExportarPage {
  readonly state: ExportStateContract = inject(EXPORT_STATE);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'exportar',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Exportar · INTT' },
    });
  }

  downloadQuestionnaire(): void {
    downloadUrl(this.state.questionnaireUrl());
  }

  downloadCollected(): void {
    downloadUrl(this.state.collectedUrl());
  }
}
