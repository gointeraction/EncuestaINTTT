import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsContainerComponent, ThemeService } from '@cifraflow/design';
import { REGISTER_STATE, type RegisterStateContract } from './business/contracts/register.state.contract';
import { RegisterStateService } from './business/state/register.state.service';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * @akuri-page
 * page: registro
 * route: /registro
 * view: VL1
 * function: FL3
 * spine: display > page > area(body) > section > content
 */
@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, DsContainerComponent],
  providers: [RegisterStateService, { provide: REGISTER_STATE, useExisting: RegisterStateService }],
  template: `
    <ds-container kind="page" name="registro">
      <ds-container kind="area" name="body" class="auth-bg">
        <ds-container kind="block" name="registro-card" class="auth-card">
          <div class="auth-icon">
            <img
              ngSrc="assets/intt-logo-login.png"
              width="180"
              height="56"
              alt="INTT — Instituto Nacional de Transporte Terrestre"
              priority
            />
          </div>
          <h2 class="auth-title">Crear cuenta</h2>
          <p class="auth-subtitle">Solicita acceso a la consola. Un administrador autorizará tu cuenta.</p>

          @if (state.status() === 'sent') {
            <div class="auth-ok">
              Solicitud enviada. Un administrador revisará tu cuenta; podrás entrar cuando sea
              autorizada.
            </div>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          } @else {
            <form (submit)="submit($event)" novalidate class="auth-form">
              <div class="auth-field">
                <label for="reg-name">Nombre y apellido</label>
                <input id="reg-name" class="auth-input" type="text" autocomplete="name"
                  placeholder="Tu nombre completo"
                  [value]="name()"
                  (input)="name.set($any($event.target).value)" (blur)="nameTouched.set(true)" />
                @if (nameErrors().length) { <div class="auth-field-error">{{ nameErrors()[0] }}</div> }
              </div>

              <div class="auth-field">
                <label for="reg-email">Correo electrónico</label>
                <input id="reg-email" class="auth-input" type="email" autocomplete="username"
                  placeholder="ejemplo@correo.com"
                  [value]="email()"
                  (input)="email.set($any($event.target).value)" (blur)="emailTouched.set(true)" />
                @if (emailErrors().length) { <div class="auth-field-error">{{ emailErrors()[0] }}</div> }
              </div>

              <div class="auth-field">
                <label for="reg-password">Contraseña</label>
                <input id="reg-password" class="auth-input" type="password" autocomplete="new-password"
                  placeholder="Al menos 8 caracteres"
                  [value]="password()"
                  (input)="password.set($any($event.target).value)" (blur)="passwordTouched.set(true)" />
                @if (passwordErrors().length) { <div class="auth-field-error">{{ passwordErrors()[0] }}</div> }
              </div>

              <div class="auth-field">
                <label for="reg-confirm">Confirmar contraseña</label>
                <input id="reg-confirm" class="auth-input" type="password" autocomplete="new-password"
                  placeholder="Repite la contraseña"
                  [value]="confirm()"
                  (input)="confirm.set($any($event.target).value)" (blur)="confirmTouched.set(true)" />
                @if (confirmErrors().length) { <div class="auth-field-error">{{ confirmErrors()[0] }}</div> }
              </div>

              @if (state.error(); as e) { <div class="auth-error" role="alert">{{ e }}</div> }

              <button type="submit" class="auth-btn" [disabled]="state.status() === 'sending'">
                {{ state.status() === 'sending' ? 'Enviando…' : 'Solicitar registro' }}
              </button>
            </form>

            <p class="auth-signup">¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a></p>
          }

          <p class="auth-footer">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: ':host { display: block; height: 100% }',
})
export class RegistroPage {
  readonly state: RegisterStateContract = inject(REGISTER_STATE);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirm = signal('');
  readonly nameTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);
  readonly confirmTouched = signal(false);

  readonly nameErrors = computed(() =>
    this.nameTouched() && !this.name().trim() ? ['El nombre es obligatorio'] : [],
  );
  readonly emailErrors = computed(() => {
    if (!this.emailTouched()) return [];
    const v = this.email().trim();
    if (!v) return ['El correo es obligatorio'];
    if (!EMAIL_RE.test(v)) return ['Ingrese un correo válido (ejemplo@correo.com)'];
    return [];
  });
  readonly passwordErrors = computed(() => {
    if (!this.passwordTouched()) return [];
    if (!this.password()) return ['La contraseña es obligatoria'];
    if (this.password().length < 8) return ['La contraseña debe tener al menos 8 caracteres'];
    return [];
  });
  readonly confirmErrors = computed(() => {
    if (!this.confirmTouched()) return [];
    if (this.confirm() !== this.password()) return ['Las contraseñas no coinciden'];
    return [];
  });

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'registro',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Registro · INTT' },
    });
  }

  async submit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.nameTouched.set(true);
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    this.confirmTouched.set(true);
    if (
      this.nameErrors().length ||
      this.emailErrors().length ||
      this.passwordErrors().length ||
      this.confirmErrors().length
    ) {
      return;
    }
    await this.state.send({
      name: this.name().trim(),
      email: this.email().trim(),
      password: this.password(),
    });
  }
}
