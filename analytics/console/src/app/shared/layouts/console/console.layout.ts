import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import {
  ConsoleAccountSection,
  ConsoleFooterSection,
  ConsoleHeaderSection,
  ConsoleNavSection,
} from './sections';

/**
 * ConsoleLayout — an app SHELL (the LAYOUT plane).
 *   area header — ONE row with two sections:
 *                   left  → INTT logo + "Visión Cero - Analítica"
 *                   right → the main navigation (ds-nav) + the account/logout.
 *   display     — the canvas: holds the <router-outlet/> + FAB; fills EXACTLY the space
 *                 between the header and the footer (flex:1 of the host column).
 *   area footer — chrome.
 * Header, display and footer are siblings stacked one after the other.
 * The routed PAGE embeds INSIDE the display (its canvas). Only this layout owns the outlet.
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
    ConsoleNavSection,
    ConsoleAccountSection,
    ConsoleFooterSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-container kind="area" name="header">
      <ds-header>
        <div
          class="ds-h__row"
          style="background: var(--ds-color-brand-primary); color: var(--ds-color-white); padding: var(--ds-space-2) var(--ds-space-4)"
        >
          <div class="ds-h__section ds-h__section--grow">
            <app-console-header-section />
          </div>
          <div class="ds-h__section ds-h__section--end">
            <div class="flex items-center gap-6">
              <app-console-nav-section />
              <app-console-account-section />
            </div>
          </div>
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
export class ConsoleLayout {}
