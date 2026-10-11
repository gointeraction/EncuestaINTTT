import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';

/**
 * ConsoleLayout — shell de la consola (normas del DS): `area` header (dos filas:
 * logo+título y debajo el menú) · `display` que ocupa el espacio entre header y
 * footer (router-outlet + FAB) · `area` footer. Solo este layout renderiza el
 * `<router-outlet>`.
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [NgOptimizedImage, RouterOutlet, RouterLink, RouterLinkActive, DsContainerComponent, DsHeaderComponent, DsFabComponent],
  template: `
    <ds-container kind="area" name="header">
      <ds-header>
        <div class="ds-h__row">
          <div class="ds-h__section ds-h__section--grow brand">
            <img
              ngSrc="/intt-logo.png"
              width="110"
              height="30"
              alt="INTT — Instituto Nacional de Transporte Terrestre"
              class="brand__logo"
            />
            <span class="brand__title">Visión Cero · Analítica</span>
          </div>
          <div class="ds-h__section ds-h__section--end session">
            @if (session.user(); as u) {
              <span class="session__user">{{ u.email }} · {{ u.role }}</span>
              <button type="button" (click)="logout()">Salir</button>
            }
          </div>
        </div>
        <div class="ds-h__row">
          <div class="ds-h__section ds-h__section--grow nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Global</a>
            <a routerLink="/panel" routerLinkActive="active">Panel</a>
            <a routerLink="/reportes-cruzados" routerLinkActive="active">Cruzados</a>
            <a routerLink="/participantes" routerLinkActive="active">Participantes</a>
          </div>
        </div>
      </ds-header>
    </ds-container>

    <ds-container kind="display" name="content">
      <router-outlet />
      <ds-fab />
    </ds-container>

    <ds-container kind="area" name="footer">
      <span>INTT · Visión Cero · {{ year }}</span>
    </ds-container>
  `,
  styles: `
    :host { display: flex; flex-direction: column; height: 100dvh; }
    :host ::ng-deep ds-container[data-name='header'] {
      background: var(--ds-color-brand-primary);
      color: var(--ds-color-white);
      padding: var(--ds-space-2) var(--ds-space-4);
    }
    :host ::ng-deep ds-container[data-name='footer'] {
      background: var(--ds-color-brand-dark);
      color: var(--ds-color-white);
      padding: var(--ds-space-1) var(--ds-space-4);
      font-size: var(--ds-text-caption);
    }
    :host ::ng-deep ds-container[data-name='content'] { flex: 1 1 auto; min-height: 0; }
    :host ::ng-deep .ds-h__section { flex-direction: row; align-items: center; gap: var(--ds-space-2); }
    .brand__logo { height: 30px; width: auto; display: block; }
    .brand__title { font-weight: var(--ds-font-weight-semibold); white-space: nowrap; }
    .nav a {
      color: var(--ds-color-white);
      text-decoration: none;
      padding: var(--ds-space-1) var(--ds-space-2);
      border-radius: var(--ds-radius-md);
      font-size: var(--ds-text-small);
    }
    .nav a.active, .nav a:hover { color: var(--ds-color-brand-dark); background: var(--ds-color-brand-accent); }
    .session { font-size: var(--ds-text-small); white-space: nowrap; }
    .session__user { color: var(--ds-color-white); }
    .session button {
      cursor: pointer;
      background: var(--ds-color-brand-accent);
      color: var(--ds-color-brand-dark);
      border: 0;
      border-radius: var(--ds-radius-md);
      padding: var(--ds-space-1) var(--ds-space-3);
      font-weight: var(--ds-font-weight-semibold);
    }
  `,
})
export class ConsoleLayout {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly year = new Date().getFullYear();

  async logout(): Promise<void> {
    await this.session.logout();
    await this.router.navigateByUrl('/login');
  }
}
