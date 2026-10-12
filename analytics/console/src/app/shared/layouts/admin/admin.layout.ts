import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';
import { ConsoleAccountSection, ConsoleFooterSection, ConsoleHeaderSection } from '../console/sections';
import { AdminNavSection } from './sections';

/**
 * AdminLayout — shell del área de ADMINISTRACIÓN. Header OMA: area → row → section.
 *   fila 1 → marca (izq) · cuenta+salir (der);
 *   fila 2 → el menú de administración.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
    DsFabComponent,
    ConsoleHeaderSection,
    AdminNavSection,
    ConsoleAccountSection,
    ConsoleFooterSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-container kind="area" name="header">
      <ds-container
        kind="row"
        name="bar"
        style="background: var(--ds-color-brand-secondary); color: var(--ds-color-white);
               align-items: center; gap: var(--ds-space-4);
               padding: var(--ds-space-3) var(--ds-space-4)"
      >
        <ds-container kind="section" name="brand" style="flex: 1 1 0; min-width: 0">
          <app-console-header-section title="Visión Cero - Administración" />
        </ds-container>
        <ds-container kind="section" name="account" style="flex: 0 0 auto">
          @if (session.user()) {
            <app-console-account-section />
          }
        </ds-container>
      </ds-container>

      @if (session.user()) {
        <ds-container
          kind="row"
          name="nav"
          style="background: var(--ds-color-brand-secondary); color: var(--ds-color-white);
                 padding: var(--ds-space-1) var(--ds-space-4) var(--ds-space-2);
                 border-top: 1px solid color-mix(in srgb, var(--ds-color-white) 18%, transparent)"
        >
          <ds-container kind="section" name="menu">
            <app-admin-nav-section />
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
export class AdminLayout {
  protected readonly session = inject(SessionService);
}
