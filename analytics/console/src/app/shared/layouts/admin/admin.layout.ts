import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';
import { ConsoleAccountSection, ConsoleFooterSection, ConsoleHeaderSection } from '../console/sections';
import { AdminNavSection } from './sections';

/**
 * AdminLayout — shell PROPIO del área de ADMINISTRACIÓN (roles/usuarios/solicitudes).
 * Reutiliza las secciones genéricas (marca, cuenta, pie) y aporta su menú de dominio.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
    DsHeaderComponent,
    DsFabComponent,
    ConsoleHeaderSection,
    AdminNavSection,
    ConsoleAccountSection,
    ConsoleFooterSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-container kind="area" name="header">
      <ds-header>
        <div
          class="ds-h__row"
          style="background: var(--ds-color-brand-secondary); color: var(--ds-color-white); padding: var(--ds-space-2) var(--ds-space-4)"
        >
          <div class="ds-h__section ds-h__section--grow">
            <app-console-header-section title="Visión Cero - Administración" />
          </div>
          @if (session.user()) {
            <div class="ds-h__section ds-h__section--end">
              <div class="flex items-center gap-6">
                <app-admin-nav-section />
                <app-console-account-section />
              </div>
            </div>
          }
        </div>
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
  `,
})
export class AdminLayout {
  protected readonly session = inject(SessionService);
}
