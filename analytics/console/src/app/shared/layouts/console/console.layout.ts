import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import {
  ConsoleAccountSection,
  ConsoleFooterSection,
  ConsoleHeaderSection,
  ConsoleNavSection,
} from './sections';

/**
 * ConsoleLayout — an app SHELL (the LAYOUT plane).
 *   area shell-header (sections: header + nav + account) — CHROME, its own height.
 *   display (the canvas): holds the <router-outlet/> + the FAB; it fills EXACTLY the space
 *                        between the header and the footer (flex:1 of the host column).
 *   area shell-footer (section: footer) — CHROME, its own height.
 * The header, the display and the footer are siblings, stacked one after the other.
 * The routed PAGE embeds INSIDE the display (its canvas).
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DsContainerComponent,
    DsFabComponent,
    ConsoleHeaderSection,
    ConsoleNavSection,
    ConsoleAccountSection,
    ConsoleFooterSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-container
      kind="area"
      name="header"
      class="flex-row flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2"
      style="background: var(--ds-color-brand-primary); color: var(--ds-color-white)"
    >
      <app-console-header-section />
      <app-console-nav-section />
      <app-console-account-section />
    </ds-container>

    <ds-container kind="display" name="content">
      <router-outlet />
      <ds-fab />
    </ds-container>

    <ds-container
      kind="area"
      name="footer"
      class="px-4 py-1"
      style="background: var(--ds-color-brand-dark); color: var(--ds-color-white)"
    >
      <app-console-footer-section />
    </ds-container>
  `,
  styles: `
    :host { display: flex; flex-direction: column; height: 100dvh; }
  `,
})
export class ConsoleLayout {}
