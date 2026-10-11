import { Component, inject } from '@angular/core';
import {
  DsContainerComponent,
  DsHeaderComponent,
  DsNavComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsNavItem,
} from '@cifraflow/design';
import { WELCOME_STATE, type WelcomeStateContract } from './business/contracts/welcome.state.contract';
import { WelcomeStateService } from './business/state/welcome.state.service';

/**
 * @akuri-page
 * page: welcome
 * route: /auth/welcome
 * view: VL1
 * function: FL1
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsNavComponent],
  providers: [WelcomeStateService, { provide: WELCOME_STATE, useExisting: WelcomeStateService }],
  template: `
    <ds-container kind="page" name="welcome">
      <ds-container
        kind="area"
        name="header"
        style="padding: var(--ds-space-2) var(--ds-space-4)"
      >
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Bienvenido" subtitle="Consola analítica · INTT" [showBack]="false" />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <ds-container kind="section" name="intro" class="welcome-section">
          @if (state.user(); as u) {
            <p class="welcome-text">
              Sesión iniciada como <strong>{{ u.email }}</strong> · rol <strong>{{ u.role }}</strong>.
            </p>
          } @else {
            <p class="welcome-text">Sesión iniciada.</p>
          }
          <ds-nav name="welcome-links" [items]="links" variant="pills" />
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .welcome-section { max-width: 720px; display: flex; flex-direction: column; gap: var(--ds-space-4); }
    .welcome-text { margin: 0; font-size: var(--ds-text-body); color: var(--ds-surface-page-on); }
  `,
})
export class WelcomePage {
  readonly state: WelcomeStateContract = inject(WELCOME_STATE);

  protected readonly links: DsNavItem[] = [
    { label: 'Global', route: '/' },
    { label: 'Panel', route: '/panel' },
    { label: 'Cruzados', route: '/reportes-cruzados' },
    { label: 'Participantes', route: '/participantes' },
  ];

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'welcome',
      ui: { view: 'VL1' },
      logic: { function: 'FL1' },
      seo: { title: 'Bienvenido · INTT' },
    });
  }
}
