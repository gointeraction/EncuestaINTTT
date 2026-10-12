import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent } from '@cifraflow/design';
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
 * ConsoleLayout — shell del área de ANALÍTICA. Header como DOS filas (OMA:
 * area → row → section):
 *   fila 1 → 3 secciones: marca (izq) · encuesta activa (centro) · cuenta+salir (der);
 *   fila 2 → 1 sección: el menú de navegación.
 * El display (router-outlet + FAB) llena el espacio entre header y footer.
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
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
      <ds-container
        kind="row"
        name="bar"
        style="background: var(--ds-color-brand-primary); color: var(--ds-color-white);
               align-items: center; gap: var(--ds-space-4);
               padding: var(--ds-space-3) var(--ds-space-4)"
      >
        <ds-container kind="section" name="brand" style="flex: 1 1 0; min-width: 0">
          <app-console-header-section />
        </ds-container>
        <ds-container kind="section" name="survey" style="flex: 0 0 auto; text-align: center">
          <app-console-survey-section />
        </ds-container>
        <ds-container
          kind="section"
          name="account"
          style="flex: 1 1 0; min-width: 0; display: flex; align-items: center; justify-content: flex-end"
        >
          @if (session.user()) {
            <app-console-account-section />
          }
        </ds-container>
      </ds-container>

      @if (session.user()) {
        <ds-container
          kind="row"
          name="nav"
          style="background: var(--ds-color-brand-primary); color: var(--ds-color-white);
                 padding: var(--ds-space-1) var(--ds-space-4) var(--ds-space-2);
                 border-top: 1px solid color-mix(in srgb, var(--ds-color-white) 18%, transparent)"
        >
          <ds-container kind="section" name="menu">
            <app-console-nav-section />
          </ds-container>
        </ds-container>
      }
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
  `,
})
export class ConsoleLayout {
  protected readonly session = inject(SessionService);

  constructor() {
    const active = inject(ActiveSurveyService);
    // Carga la lista de encuestas solo con sesión (evita un 401 en la pantalla de login).
    effect(() => {
      if (this.session.user()) void active.load();
    });
  }
}
