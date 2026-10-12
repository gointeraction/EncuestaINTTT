import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';
import { ConsoleAccountSection, ConsoleFooterSection } from '../console/sections';
import { TestDataHeaderSection, TestDataNavSection } from './sections';

/**
 * TestDataLayout — shell PROPIO del módulo `test-data` (herramienta de datos de prueba,
 * SOLO development). Reutiliza las secciones genéricas (cuenta, pie) y aporta su propia
 * cabecera + menú, para NO mezclarse con la consola de analítica.
 */
@Component({
  selector: 'app-test-data-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
    DsHeaderComponent,
    DsFabComponent,
    TestDataHeaderSection,
    TestDataNavSection,
    ConsoleAccountSection,
    ConsoleFooterSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-container kind="area" name="header">
      <ds-header>
        <div
          class="ds-h__row"
          style="background: var(--ds-color-brand-dark); color: var(--ds-color-white); padding: var(--ds-space-2) var(--ds-space-4)"
        >
          <div class="ds-h__section ds-h__section--grow">
            <app-test-data-header-section />
          </div>
          @if (session.user()) {
            <div class="ds-h__section ds-h__section--end">
              <div class="flex items-center gap-6">
                <app-test-data-nav-section />
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
export class TestDataLayout {
  protected readonly session = inject(SessionService);
}
