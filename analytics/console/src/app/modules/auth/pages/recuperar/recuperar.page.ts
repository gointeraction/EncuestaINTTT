import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsContainerComponent, ThemeService } from '@cifraflow/design';
import { RECOVER_STATE, type RecoverStateContract } from './business/contracts/recover.state.contract';
import { RecoverStateService } from './business/state/recover.state.service';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * @akuri-page
 * page: recuperar
 * route: /recuperar
 * view: VL1
 * function: FL3
 * spine: display > page > area(body) > section > content
 */
@Component({
  selector: 'app-recuperar-page',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, DsContainerComponent],
  providers: [RecoverStateService, { provide: RECOVER_STATE, useExisting: RecoverStateService }],
  template: `
    <ds-container kind="page" name="recuperar">
      <ds-container kind="area" name="body" class="auth-bg">
        <ds-container kind="block" name="recuperar-card" class="auth-card">
          <div class="auth-icon">
            <img
              ngSrc="assets/intt-logo-login.png"
              width="180"
              height="56"
              alt="INTT — Instituto Nacional de Transporte Terrestre"
              priority
            />
          </div>
          <h2 class="auth-title">Recuperar contraseña</h2>

          @if (state.done()) {
            <p class="auth-subtitle">Tu contraseña fue actualizada.</p>
            <div class="auth-ok">Ya puedes iniciar sesión con tu nueva contraseña.</div>
            <p class="auth-signup"><a routerLink="/auth/login">Ir al inicio de sesión</a></p>
          } @else if (state.step() === 'request') {
            <p class="auth-subtitle">Indica tu correo. Un administrador autorizará el cambio.</p>
            <form (submit)="request($event)" novalidate class="auth-form">
              <div class="auth-field">
                <label for="rec-email">Correo electrónico</label>
                <input id="rec-email" class="auth-input" type="email" autocomplete="username"
                  placeholder="ejemplo@correo.com"
                  [value]="email()"
                  (input)="email.set($any($event.target).value)" (blur)="emailTouched.set(true)" />
                @if (emailErrors().length) { <div class="auth-field-error">{{ emailErrors()[0] }}</div> }
              </div>
              @if (state.error(); as e) { <div class="auth-error" role="alert">{{ e }}</div> }
              <button type="submit" class="auth-btn" [disabled]="state.busy()">
                {{ state.busy() ? 'Enviando…' : 'Solicitar cambio' }}
              </button>
            </form>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          } @else if (state.step() === 'sent') {
            <p class="auth-subtitle">
              Tu solicitud para <b>{{ email() }}</b> fue registrada. Un administrador la revisará.
            </p>
            @if (state.error(); as e) { <div class="auth-error" role="alert">{{ e }}</div> }
            <button type="button" class="auth-btn" [disabled]="state.busy()" (click)="continue()">
              {{ state.busy() ? 'Verificando…' : 'Ya fui autorizado, continuar' }}
            </button>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          } @else {
            <p class="auth-subtitle">Define tu nueva contraseña para <b>{{ email() }}</b>.</p>
            <form (submit)="reset($event)" novalidate class="auth-form">
              <div class="auth-field">
                <label for="rec-new">Nueva contraseña</label>
                <input id="rec-new" class="auth-input" type="password" autocomplete="new-password"
                  placeholder="Al menos 8 caracteres"
                  [value]="newPassword()"
                  (input)="newPassword.set($any($event.target).value)" (blur)="newTouched.set(true)" />
                @if (newErrors().length) { <div class="auth-field-error">{{ newErrors()[0] }}</div> }
              </div>
              <div class="auth-field">
                <label for="rec-confirm">Confirmar contraseña</label>
                <input id="rec-confirm" class="auth-input" type="password" autocomplete="new-password"
                  placeholder="Repite la contraseña"
                  [value]="confirm()"
                  (input)="confirm.set($any($event.target).value)" (blur)="confirmTouched.set(true)" />
                @if (confirmErrors().length) { <div class="auth-field-error">{{ confirmErrors()[0] }}</div> }
              </div>
              @if (state.error(); as e) { <div class="auth-error" role="alert">{{ e }}</div> }
              <button type="submit" class="auth-btn" [disabled]="state.busy()">
                {{ state.busy() ? 'Guardando…' : 'Cambiar contraseña' }}
              </button>
            </form>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          }

          <p class="auth-footer">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: ':host { display: block; height: 100% }',
})
export class RecuperarPage {
  readonly state: RecoverStateContract = inject(RECOVER_STATE);

  readonly email = signal('');
  readonly emailTouched = signal(false);
  readonly newPassword = signal('');
  readonly newTouched = signal(false);
  readonly confirm = signal('');
  readonly confirmTouched = signal(false);

  readonly emailErrors = computed(() => {
    if (!this.emailTouched()) return [];
    const v = this.email().trim();
    if (!v) return ['El correo es obligatorio'];
    if (!EMAIL_RE.test(v)) return ['Ingrese un correo válido (ejemplo@correo.com)'];
    return [];
  });
  readonly newErrors = computed(() => {
    if (!this.newTouched()) return [];
    if (this.newPassword().length < 8) return ['La contraseña debe tener al menos 8 caracteres'];
    return [];
  });
  readonly confirmErrors = computed(() => {
    if (!this.confirmTouched()) return [];
    if (this.confirm() !== this.newPassword()) return ['Las contraseñas no coinciden'];
    return [];
  });

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'recuperar',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Recuperar contraseña · INTT' },
    });
  }

  async request(event?: Event): Promise<void> {
    event?.preventDefault();
    this.emailTouched.set(true);
    if (this.emailErrors().length) return;
    await this.state.request(this.email().trim());
  }

  async continue(): Promise<void> {
    await this.state.continueIfApproved(this.email().trim());
  }

  async reset(event?: Event): Promise<void> {
    event?.preventDefault();
    this.newTouched.set(true);
    this.confirmTouched.set(true);
    if (this.newErrors().length || this.confirmErrors().length) return;
    await this.state.submitReset(this.email().trim(), this.newPassword());
  }
}
