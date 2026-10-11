import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DsContainerComponent, DsHeaderComponent, DsPageTitleComponent } from '@cifraflow/design';
import { SessionService } from '../../../core/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent],
  template: `
    <ds-container kind="page" name="login">
      <ds-container kind="area" name="header">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Acceso del personal" subtitle="Consola analítica · INTT" [showBack]="false" />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body">
        <ds-container kind="section" name="form" class="login-section">
          <form (ngSubmit)="submit()" #f="ngForm" class="login-form">
            <label>Correo
              <input name="email" type="email" [(ngModel)]="email" required autocomplete="username" />
            </label>
            <label>Clave
              <input name="password" type="password" [(ngModel)]="password" required autocomplete="current-password" />
            </label>
            @if (error(); as e) { <p role="alert" class="login-error">{{ e }}</p> }
            <button type="submit" [disabled]="loading() || f.invalid">
              {{ loading() ? 'Entrando…' : 'Entrar' }}
            </button>
          </form>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .login-section { max-width: 420px; }
    .login-form { display: flex; flex-direction: column; gap: 0.75rem; }
    .login-form label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; }
    .login-form input { padding: 0.5rem; border: 1px solid var(--ds-color-border, #ccc); border-radius: 6px; }
    .login-form button {
      margin-top: 0.5rem; padding: 0.5rem 1rem; cursor: pointer;
      background: #1c2454; color: #fff; border: 0; border-radius: 6px; font-weight: 600;
    }
    .login-error { color: #a70336; }
  `,
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.session.login(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch {
      this.error.set('Credenciales inválidas o servicio no disponible.');
    } finally {
      this.loading.set(false);
    }
  }
}
