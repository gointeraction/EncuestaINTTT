import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { SessionService } from '../../../core/session.service';

/**
 * ConsoleLayout — shell de las páginas de la consola (norms del DS):
 * `display` (solo layout) con un `area` header (marca + logo INTT + navegación +
 * sesión) y el `<router-outlet/>` donde se despliega la `page` de cada ruta.
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DsContainerComponent, DsHeaderComponent],
  template: `
    <ds-container kind="display" name="shell">
      <ds-container kind="area" name="header">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow brand">
              <img
                class="brand__logo"
                src="/intt-logo.png"
                alt="INTT — Instituto Nacional de Transporte Terrestre"
              />
              <span class="brand__title">Visión Cero · Analítica</span>
            </div>
            <div class="ds-h__section nav">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Global</a>
              <a routerLink="/panel" routerLinkActive="active">Panel</a>
              <a routerLink="/reportes-cruzados" routerLinkActive="active">Cruzados</a>
              <a routerLink="/participantes" routerLinkActive="active">Participantes</a>
            </div>
            <div class="ds-h__section ds-h__section--end session">
              @if (session.user(); as u) {
                <span class="session__user">{{ u.email }} · {{ u.role }}</span>
                <button type="button" (click)="logout()">Salir</button>
              }
            </div>
          </div>
        </ds-header>
      </ds-container>

      <router-outlet />
    </ds-container>
  `,
  styles: `
    :host { display: contents; }
    :host ::ng-deep ds-container[data-name='header'] {
      background: #1c2454;
      color: #fff;
      padding: 0.4rem 1rem;
    }
    :host ::ng-deep .ds-h__section { flex-direction: row; align-items: center; gap: 0.6rem; }
    .brand__logo { height: 32px; width: auto; display: block; }
    .brand__title { font-weight: 600; white-space: nowrap; }
    .nav { margin-left: 1rem; }
    .nav a { color: rgba(255, 255, 255, 0.85); text-decoration: none; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.9rem; }
    .nav a.active, .nav a:hover { color: #151c41; background: #ffc907; }
    .session { font-size: 0.85rem; white-space: nowrap; }
    .session__user { color: rgba(255, 255, 255, 0.85); }
    .session button {
      cursor: pointer; background: #ffc907; color: #151c41; border: 0;
      border-radius: 6px; padding: 0.3rem 0.7rem; font-weight: 600;
    }
  `,
})
export class ConsoleLayoutComponent {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.session.logout();
    await this.router.navigateByUrl('/login');
  }
}
