import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DsContainerComponent, ThemeService } from '@cifraflow/design';
import { TurnstileComponent } from '../../../../core/turnstile/turnstile.component';
import { LOGIN_STATE, type LoginStateContract } from './business/contracts/login.state.contract';
import { LoginStateService } from './business/state/login.state.service';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * @akuri-page
 * page: login
 * route: /login
 * view: VL1
 * function: FL3
 * spine: display > page > area(body) > section > content
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, DsContainerComponent, TurnstileComponent],
  providers: [LoginStateService, { provide: LOGIN_STATE, useExisting: LoginStateService }],
  template: `
    <ds-container kind="page" name="login">
      <ds-container kind="area" name="body" class="auth-bg">
        <ds-container kind="block" name="login-card" class="auth-card">
          <div class="auth-icon">
            <img
              ngSrc="assets/intt-logo-login.png"
              width="180"
              height="56"
              alt="INTT — Instituto Nacional de Transporte Terrestre"
              priority
            />
          </div>

          <h2 class="auth-title">Bienvenido</h2>
          <p class="auth-subtitle">Inicia sesión para solicitar y consultar tus trámites.</p>

          <form (submit)="submit($event)" novalidate class="auth-form">
            <div class="auth-field">
              <label for="login-email">Correo electrónico</label>
              <input
                id="login-email"
                class="auth-input"
                type="email"
                autocomplete="username"
                placeholder="ejemplo@correo.com"
                [value]="email()"
                [attr.aria-invalid]="emailErrors().length ? 'true' : null"
                [attr.aria-describedby]="emailErrors().length ? 'login-email-error' : null"
                (input)="email.set($any($event.target).value)"
                (blur)="emailTouched.set(true)"
              />
              @if (emailErrors().length) {
                <div id="login-email-error" class="auth-field-error">{{ emailErrors()[0] }}</div>
              }
            </div>

            <div class="auth-field">
              <label for="login-password">Contraseña</label>
              <div class="auth-password">
                <input
                  id="login-password"
                  class="auth-input"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Al menos 8 caracteres"
                  [value]="password()"
                  [attr.aria-invalid]="passwordErrors().length ? 'true' : null"
                  [attr.aria-describedby]="passwordErrors().length ? 'login-password-error' : null"
                  (input)="password.set($any($event.target).value)"
                  (blur)="passwordTouched.set(true)"
                />
                <button
                  type="button"
                  class="auth-toggle"
                  tabindex="-1"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  (click)="showPassword.set(!showPassword())"
                >
                  {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
              @if (passwordErrors().length) {
                <div id="login-password-error" class="auth-field-error">{{ passwordErrors()[0] }}</div>
              }
              <a class="auth-forgot" routerLink="/auth/recuperar">¿Olvidó tu contraseña?</a>
            </div>

            <div class="auth-captcha">
              <app-turnstile (token)="token.set($event)" />
            </div>

            @if (state.error(); as e) {
              <div class="auth-error" role="alert">{{ e }}</div>
            }

            @if (token()) {
              <button type="submit" class="auth-btn" [disabled]="state.status() === 'submitting'">
                {{ state.status() === 'submitting' ? 'Iniciando sesión…' : 'Iniciar sesión' }}
              </button>
            }
          </form>

          <p class="auth-signup">
            ¿No se encuentra registrado aún?
            <a routerLink="/auth/registro">Regístrate</a>
          </p>

          <p class="auth-footer">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: ':host { display: block; height: 100% }',
})
export class LoginPage {
  readonly state: LoginStateContract = inject(LOGIN_STATE);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);
  readonly showPassword = signal(false);
  readonly token = signal('');

  readonly emailErrors = computed(() => {
    if (!this.emailTouched()) return [];
    const v = this.email().trim();
    if (!v) return ['El correo electrónico es requerido'];
    if (!EMAIL_RE.test(v)) return ['Ingrese un correo electrónico válido (ejemplo@correo.com)'];
    return [];
  });

  readonly passwordErrors = computed(() => {
    if (!this.passwordTouched()) return [];
    if (!this.password()) return ['La contraseña es requerida'];
    if (this.password().length < 8) return ['La contraseña debe tener al menos 8 caracteres'];
    return [];
  });

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'login',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Acceso · INTT' },
    });
  }

  async submit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    if (this.emailErrors().length || this.passwordErrors().length) return;
    if (!this.token()) return;

    const ok = await this.state.login(this.email().trim(), this.password(), this.token());
    if (ok) {
      await this.router.navigateByUrl('/auth/welcome');
    }
  }
}
