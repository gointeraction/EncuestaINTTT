import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { DsContainerComponent, ThemeService } from '@cifraflow/design';
import { TurnstileComponent } from '../../../../core/turnstile/turnstile.component';
import { LOGIN_STATE, type LoginStateContract } from './business/contracts/login.state.contract';
import { LoginStateService } from './business/state/login.state.service';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const EXTERNAL = 'https://put.intt.gob.ve';

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
  imports: [NgOptimizedImage, DsContainerComponent, TurnstileComponent],
  providers: [LoginStateService, { provide: LOGIN_STATE, useExisting: LoginStateService }],
  template: `
    <ds-container kind="page" name="login">
      <ds-container kind="area" name="body" class="login-bg">
        <ds-container kind="block" name="login-card" class="login-card">
          <div class="login-icon">
            <img
              ngSrc="assets/intt-logo-login.png"
              width="180"
              height="56"
              alt="INTT — Instituto Nacional de Transporte Terrestre"
              priority
            />
          </div>

          <h2 class="login-title">Bienvenido</h2>
          <p class="login-subtitle">Inicia sesión para solicitar y consultar tus trámites.</p>

          <form (submit)="submit($event)" novalidate class="login-form">
            <div class="login-field">
              <label for="login-email">Correo electrónico</label>
              <input
                id="login-email"
                class="login-input"
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
                <div id="login-email-error" class="login-field-error">{{ emailErrors()[0] }}</div>
              }
            </div>

            <div class="login-field">
              <label for="login-password">Contraseña</label>
              <div class="login-password">
                <input
                  id="login-password"
                  class="login-input"
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
                  class="login-toggle"
                  tabindex="-1"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  (click)="showPassword.set(!showPassword())"
                >
                  {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
              @if (passwordErrors().length) {
                <div id="login-password-error" class="login-field-error">{{ passwordErrors()[0] }}</div>
              }
              <a class="login-forgot" [href]="external + '/contrasena.php'" rel="noopener">
                ¿Olvidó tu contraseña?
              </a>
            </div>

            <div class="login-captcha">
              <app-turnstile (token)="token.set($event)" />
            </div>

            @if (state.error(); as e) {
              <div class="login-error" role="alert">{{ e }}</div>
            }

            @if (token()) {
              <button type="submit" class="login-btn" [disabled]="state.status() === 'submitting'">
                {{ state.status() === 'submitting' ? 'Iniciando sesión…' : 'Iniciar sesión' }}
              </button>
            }
          </form>

          <p class="login-signup">
            ¿No se encuentra registrado aún?
            <a [href]="external + '/registro.php'" rel="noopener">Regístrate</a>
          </p>
          <div class="login-signup">
            <a [href]="external + '/correo.php'" rel="noopener">¿Olvidó su Correo?</a>
          </div>

          <p class="login-footer">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .login-bg {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
      box-sizing: border-box;
      background: url('/assets/login-bg.jpg') center center / cover no-repeat;
    }
    .login-card {
      width: 100%;
      max-width: 480px;
      background: var(--ds-color-login-card-bg);
      border-radius: 20px;
      box-shadow: 0 20px 60px var(--ds-color-login-shadow);
      padding: 44px 48px 36px;
      text-align: center;
    }
    .login-icon {
      width: 360px;
      max-width: 100%;
      height: 96px;
      margin: 0 auto 20px;
      border-radius: 14px;
      background: var(--ds-color-login-icon-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-icon img { height: 56px; width: auto; }
    .login-title { font-size: 26px; font-weight: 700; color: var(--ds-color-login-title); margin: 0 0 8px; }
    .login-subtitle { font-size: 14px; color: var(--ds-color-login-muted); line-height: 1.6; margin: 0 0 30px; }
    .login-form { display: flex; flex-direction: column; }
    .login-field { display: flex; flex-direction: column; margin-bottom: 16px; text-align: left; }
    .login-field label { font-size: 13px; font-weight: 600; color: var(--ds-color-login-label); margin-bottom: 7px; }
    .login-input {
      border: 1px solid var(--ds-color-login-field-border);
      border-radius: 999px;
      height: 46px;
      font-size: 13px;
      color: var(--ds-color-login-field-text);
      padding: 0 20px;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .login-input:focus { border-color: var(--ds-color-login-link); }
    .login-password { position: relative; display: flex; align-items: center; }
    .login-password .login-input { padding-right: 90px; }
    .login-toggle {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      color: var(--ds-color-login-muted);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      padding: 0;
    }
    .login-toggle:hover { color: var(--ds-color-login-link); }
    .login-field-error { color: var(--ds-color-login-error); font-size: 11px; margin-top: 5px; }
    .login-forgot {
      display: block;
      text-align: right;
      font-size: 12px;
      color: var(--ds-color-login-link);
      text-decoration: none;
      margin-top: 8px;
      margin-bottom: 6px;
    }
    .login-captcha { margin: 18px 0; display: flex; justify-content: center; }
    .login-error {
      color: var(--ds-color-login-error);
      font-size: 13px;
      margin-top: 15px;
      text-align: center;
      background-color: var(--ds-color-login-error-bg);
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid var(--ds-color-login-error);
    }
    .login-btn {
      background-color: var(--ds-color-login-action);
      color: var(--ds-color-white);
      border: none;
      border-radius: 999px;
      height: 48px;
      font-size: 14px;
      font-weight: 600;
      width: 100%;
      letter-spacing: 0.3px;
      font-family: inherit;
      cursor: pointer;
      margin-top: 6px;
      transition: background 0.2s;
    }
    .login-btn:hover { background-color: var(--ds-color-login-action-hover); }
    .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .login-signup { text-align: center; font-size: 12px; color: var(--ds-color-login-muted); margin: 18px 0 0; }
    .login-signup a { color: var(--ds-color-login-link); font-weight: 600; text-decoration: none; }
    .login-footer { text-align: center; font-size: 10px; color: var(--ds-color-login-footer); margin: 26px 0 0; letter-spacing: 0.6px; }
    @media (max-width: 576px) {
      .login-card { padding: 34px 26px 28px; border-radius: 16px; }
      .login-title { font-size: 22px; }
    }
  `,
})
export class LoginPage {
  readonly state: LoginStateContract = inject(LOGIN_STATE);
  private readonly router = inject(Router);

  readonly external = EXTERNAL;
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
