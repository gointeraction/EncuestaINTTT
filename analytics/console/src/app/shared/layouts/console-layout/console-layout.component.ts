import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../core/session.service';

/**
 * ConsoleLayout — shell de las páginas de la consola analítica.
 * Header sencillo (marca navy INTT + logo + navegación + sesión) y un
 * `<router-outlet/>` donde se despliegan las páginas.
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <a class="app-header__brand" routerLink="/">
        <img
          class="app-header__logo"
          src="/intt-logo.png"
          alt="INTT — Instituto Nacional de Transporte Terrestre"
        />
        <span class="app-header__title">Visión Cero · Analítica</span>
      </a>

      <nav class="app-header__nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Global</a>
        <a routerLink="/panel" routerLinkActive="active">Panel</a>
        <a routerLink="/reportes-cruzados" routerLinkActive="active">Cruzados</a>
        <a routerLink="/participantes" routerLinkActive="active">Participantes</a>
      </nav>

      <div class="app-header__session">
        @if (session.user(); as u) {
          <span class="app-header__user">{{ u.email }} · {{ u.role }}</span>
          <button type="button" (click)="logout()">Salir</button>
        }
      </div>
    </header>

    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
    .app-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.4rem 1rem;
      background: #1c2454;
      color: #fff;
    }
    .app-header__brand { display: flex; align-items: center; gap: 0.75rem; color: inherit; text-decoration: none; }
    .app-header__logo { height: 32px; width: auto; display: block; }
    .app-header__title { font-weight: 600; letter-spacing: 0.2px; white-space: nowrap; }
    .app-header__nav { display: flex; gap: 0.25rem; margin-left: 1rem; flex: 1 1 auto; flex-wrap: wrap; }
    .app-header__nav a {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .app-header__nav a.active,
    .app-header__nav a:hover { color: #151c41; background: #ffc907; }
    .app-header__session { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; white-space: nowrap; }
    .app-header__user { color: rgba(255, 255, 255, 0.85); }
    .app-header__session button {
      cursor: pointer;
      background: #ffc907;
      color: #151c41;
      border: 0;
      border-radius: 6px;
      padding: 0.3rem 0.7rem;
      font-weight: 600;
    }
    .app-main { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 1rem; }
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
