import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';
import { ActiveSurveyService } from '../../../core/active-survey.service';
import {
  ConsoleAccountSection,
  ConsoleFooterSection,
  ConsoleHeaderSection,
  ConsoleNavSection,
  ConsoleSurveySection,
} from './sections';

/**
 * ConsoleLayout — shell del área de ANALÍTICA. Header en DOS filas:
 *   fila 1 → marca (izq) · encuesta activa (centro) · cuenta + salir (der);
 *   fila 2 → el menú de navegación (ancho completo).
 * El display (router-outlet + FAB) llena el espacio entre header y footer.
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
    DsHeaderComponent,
    DsFabComponent,
    ConsoleHeaderSection,
    ConsoleSurveySection,
    ConsoleNavSection,
    ConsoleAccountSection,
    ConsoleFooterSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-container kind="area" name="header">
      <ds-header>
        <div
          class="ds-h__row cl__top"
          style="background: var(--ds-color-brand-primary); color: var(--ds-color-white); padding: var(--ds-space-3) var(--ds-space-4)"
        >
          <div class="cl__left">
            <app-console-header-section />
          </div>
          <div class="cl__center">
            <app-console-survey-section />
          </div>
          <div class="cl__right">
            @if (session.user()) {
              <app-console-account-section />
            }
          </div>
        </div>

        @if (session.user()) {
          <div
            class="ds-h__row cl__nav"
            style="background: var(--ds-color-brand-primary); color: var(--ds-color-white); padding: 0 var(--ds-space-4) var(--ds-space-2)"
          >
            <app-console-nav-section />
          </div>
        }
      </ds-header>
    </ds-container>

    <ds-container kind="display" name="content">
      <router-outlet />
      <ds-fab />
    </ds-container>

    <ds-container
      kind="area"
      name="footer"
      style="background: var(--ds-color-brand-dark); color: var(--ds-color-white); padding: var(--ds-space-1) var(--ds-space-4)"
    >
      <app-console-footer-section />
    </ds-container>
  `,
  styles: `
    :host { display: flex; flex-direction: column; height: 100dvh; }
    .cl__top { align-items: center; }
    .cl__left { flex: 1 1 0; min-width: 0; display: flex; align-items: center; }
    .cl__center { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
    .cl__right { flex: 1 1 0; min-width: 0; display: flex; align-items: center; justify-content: flex-end; }
    .cl__nav { border-top: 1px solid color-mix(in srgb, var(--ds-color-white) 18%, transparent); padding-top: var(--ds-space-1); }
  `,
})
export class ConsoleLayout {
  protected readonly session = inject(SessionService);

  constructor() {
    void inject(ActiveSurveyService).load();
  }
}
