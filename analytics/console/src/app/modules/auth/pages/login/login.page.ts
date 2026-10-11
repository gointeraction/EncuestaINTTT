import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsFormFieldComponent,
  DsFormInputComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
  type DsFormFieldState,
} from '@cifraflow/design';
import { LOGIN_STATE, type LoginStateContract } from './business/contracts/login.state.contract';
import { LoginStateService } from './business/state/login.state.service';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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
  imports: [
    DsContainerComponent,
    DsHeaderComponent,
    DsPageTitleComponent,
    DsFormFieldComponent,
    DsFormInputComponent,
    DsButtonComponent,
  ],
  providers: [LoginStateService, { provide: LOGIN_STATE, useExisting: LoginStateService }],
  template: `
    <ds-container kind="page" name="login">
      <ds-container
        kind="area"
        name="header"
        style="padding: var(--ds-space-2) var(--ds-space-4)"
      >
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Acceso del personal" subtitle="Consola analítica · INTT" [showBack]="false" />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container
        kind="area"
        name="body"
        style="justify-content: center; align-items: center"
      >
        <ds-container kind="block" name="login-card" class="login-card">
          <form (ngSubmit)="submit()" novalidate class="login-form">
            <ds-form-field
              #emailField
              label="Correo"
              for="login-email"
              hint="Usa tu correo institucional (@intt.gob.ve)"
              [required]="true"
              [state]="emailState()"
              [errors]="emailErrors()"
            >
              <ds-form-input
                controlId="login-email"
                type="email"
                autocomplete="username"
                placeholder="usuario@intt.gob.ve"
                [value]="email()"
                [state]="emailState()"
                [describedBy]="emailField.describedBy()"
                (valueChange)="email.set($event)"
                (blur)="emailTouched.set(true)"
              />
            </ds-form-field>

            <ds-form-field
              #passwordField
              label="Clave"
              for="login-password"
              hint="Mínimo 8 caracteres"
              [required]="true"
              [state]="passwordState()"
              [errors]="passwordErrors()"
            >
              <ds-form-input
                controlId="login-password"
                type="password"
                autocomplete="current-password"
                [value]="password()"
                [state]="passwordState()"
                [describedBy]="passwordField.describedBy()"
                (valueChange)="password.set($event)"
                (blur)="passwordTouched.set(true)"
              />
            </ds-form-field>

            @if (state.error(); as e) { <p role="alert" class="login-error">{{ e }}</p> }

            <ds-button type="submit" variant="primary" [loading]="state.loading()">
              {{ state.loading() ? 'Entrando…' : 'Entrar' }}
            </ds-button>
          </form>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: var(--ds-space-6);
      background: var(--ds-surface-card);
      color: var(--ds-surface-card-on);
      border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-lg);
      box-shadow: var(--ds-shadow-md);
    }
    .login-form { display: flex; flex-direction: column; gap: var(--ds-space-4); }
    .login-error { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
  `,
})
export class LoginPage {
  readonly state: LoginStateContract = inject(LOGIN_STATE);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);

  readonly emailErrors = computed(() => {
    if (!this.emailTouched()) return [];
    const v = this.email().trim();
    if (!v) return ['El correo es obligatorio'];
    if (!EMAIL_RE.test(v)) return ['Formato de correo inválido'];
    return [];
  });

  readonly passwordErrors = computed(() => {
    if (!this.passwordTouched()) return [];
    if (!this.password()) return ['La clave es obligatoria'];
    if (this.password().length < 8) return ['La clave debe tener al menos 8 caracteres'];
    return [];
  });

  readonly emailState = computed<DsFormFieldState>(() =>
    this.emailErrors().length ? 'error' : 'default',
  );
  readonly passwordState = computed<DsFormFieldState>(() =>
    this.passwordErrors().length ? 'error' : 'default',
  );

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'login',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Acceso · INTT' },
    });
  }

  async submit(): Promise<void> {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    if (this.emailErrors().length || this.passwordErrors().length) return;

    const ok = await this.state.login(this.email().trim(), this.password());
    if (ok) {
      await this.router.navigateByUrl('/');
    }
  }
}
