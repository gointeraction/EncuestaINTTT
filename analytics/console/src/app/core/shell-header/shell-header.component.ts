import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-shell-header',
  standalone: true,
  template: `
    @if (session.user(); as u) {
      <header class="app-header">
        <strong>INTT · Visión Cero · Analítica</strong>
        <span class="app-header__user">{{ u.email }} — {{ u.role }}</span>
        <button type="button" (click)="logout()">Salir</button>
      </header>
    }
  `,
  styles: `
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--ds-color-border, #ddd);
      background: var(--ds-color-surface, #fff);
    }
    .app-header__user { color: var(--ds-color-text-muted, #555); font-size: 0.9rem; }
    button { cursor: pointer; }
  `,
})
export class ShellHeaderComponent {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.session.logout();
    await this.router.navigateByUrl('/login');
  }
}
