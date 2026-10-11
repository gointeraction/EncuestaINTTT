import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { SessionService } from '../../../core/session.service';

/**
 * ConsoleLayout — shell de la consola (normas del DS).
 * `area` header (dos secciones: logo+título y debajo el menú) · `display` que ocupa
 * SOLO el espacio disponible entre el header y el footer (hostea el router-outlet y
 * el FAB) · `area` footer.
 */
@Component({
  selector: 'app-console-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DsContainerComponent, DsHeaderComponent, DsFabComponent],
  template: `
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
    :host ::ng-deep ds-container[data-name='header'] { background: #1c2454; color: #fff; padding: 0.5rem 1rem; }
    :host ::ng-deep ds-container[data-name='footer'] {
      background: #151c41; color: rgba(255, 255, 255, 0.7);
      padding: 0.4rem 1rem; font-size: 0.8rem;
    }
    :host ::ng-deep ds-container[data-name='content'] { flex: 1 1 auto; min-height: 0; }
    :host ::ng-deep .ds-h__row { gap: 0.5rem; }
    :host ::ng-deep .ds-h__section { flex-direction: row; align-items: center; gap: 0.6rem; }
    .brand__logo { height: 30px; width: auto; display: block; }
    .brand__title { font-weight: 600; white-space: nowrap; }
    .nav a { color: rgba(255, 255, 255, 0.85); text-decoration: none; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.9rem; }
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
  readonly year = new Date().getFullYear();

  async logout(): Promise<void> {
    await this.session.logout();
    await this.router.navigateByUrl('/login');
  }
}
