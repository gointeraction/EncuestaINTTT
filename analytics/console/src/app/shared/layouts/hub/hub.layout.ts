import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';
import { ConsoleAccountSection, ConsoleFooterSection, ConsoleHeaderSection } from '../console/sections';

/**
 * HubLayout — shell de la BIENVENIDA (hub de entrada). Header OMA: area → row → section
 * (marca izq · cuenta+salir der). SIN menú: es el punto de entrada, no un área.
 */
@Component({
  selector: 'app-hub-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
    DsFabComponent,
    ConsoleHeaderSection,
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
          <app-console-header-section title="Visión Cero" />
        </ds-container>
        <ds-container kind="section" name="account" style="flex: 0 0 auto">
          @if (session.user()) {
            <app-console-account-section />
          }
        </ds-container>
      </ds-container>
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
export class HubLayout {
  protected readonly session = inject(SessionService);
}
