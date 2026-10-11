import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { LOGIN_STATE, type LoginStateContract } from './business/contracts/login.state.contract';
import { LoginStateService } from './business/state/login.state.service';

/**
 * @akuri-page
 * page: login
 * route: /login
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent],
  providers: [LoginStateService, { provide: LOGIN_STATE, useExisting: LoginStateService }],
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
            @if (state.error(); as e) { <p role="alert" class="login-error">{{ e }}</p> }
            <button type="submit" [disabled]="state.loading() || f.invalid">
              {{ state.loading() ? 'Entrando…' : 'Entrar' }}
            </button>
          </form>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .login-section { max-width: 420px; }
    .login-form { display: flex; flex-direction: column; gap: var(--ds-space-3); }
    .login-form label { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); }
    .login-form input { padding: var(--ds-space-2); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); }
    .login-form button {
      margin-top: var(--ds-space-2); padding: var(--ds-space-2) var(--ds-space-4); cursor: pointer;
      background: var(--ds-color-brand-primary); color: var(--ds-color-white);
      border: 0; border-radius: var(--ds-radius-md); font-weight: var(--ds-font-weight-semibold);
    }
    .login-error { color: var(--ds-color-state-danger); }
  `,
})
export class LoginPage {
  readonly state: LoginStateContract = inject(LOGIN_STATE);
  private readonly router = inject(Router);

  email = '';
  password = '';

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'login',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Acceso · INTT' },
    });
  }

  async submit(): Promise<void> {
    const ok = await this.state.login(this.email, this.password);
    if (ok) {
      await this.router.navigateByUrl('/');
    }
  }
}
