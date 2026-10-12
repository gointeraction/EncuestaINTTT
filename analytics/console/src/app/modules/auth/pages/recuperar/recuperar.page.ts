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

          @if (state.step() === 'request') {
            <p class="auth-subtitle">Indica tu correo para consultar o solicitar el cambio.</p>
            <form (submit)="submit($event)" novalidate class="auth-form">
              <div class="auth-field">
                <label for="rec-email">Correo electrónico</label>
                <input id="rec-email" class="auth-input" type="email" autocomplete="username"
                  placeholder="ejemplo@correo.com"
                  [value]="email()"
                  (input)="email.set($any($event.target).value)" (blur)="emailTouched.set(true)" />
                @if (emailErrors().length) { <div class="auth-field-error">{{ emailErrors()[0] }}</div> }
              </div>
              @if (state.error(); as e) { <div class="auth-error" role="alert">{{ e }}</div> }
              <button type="submit" class="auth-btn" [disabled]="!emailValid() || state.busy()">
                {{ state.busy() ? 'Consultando…' : 'Consultar / Solicitar cambio' }}
              </button>
            </form>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          } @else if (state.step() === 'pending') {
            <div class="rec__status" role="status">
              <b>Solicitud en proceso de aprobación</b>
              <p>
                Tu solicitud para <b>{{ email() }}</b> está registrada y espera la autorización de un
                administrador. Cuando sea aprobada podrás definir tu nueva contraseña desde aquí.
              </p>
              <p class="rec__note">Mientras tanto, tu contraseña actual sigue vigente.</p>
            </div>
            @if (state.error(); as e) { <div class="auth-error" role="alert">{{ e }}</div> }
            <button type="button" class="auth-btn" [disabled]="state.busy()" (click)="recheck()">
              {{ state.busy() ? 'Verificando…' : 'Verificar de nuevo' }}
            </button>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          } @else if (state.step() === 'set') {
            <p class="auth-subtitle">Tu solicitud fue autorizada. Define tu nueva contraseña para {{ email() }}.</p>
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
              <button type="submit" class="auth-btn" [disabled]="!resetValid() || state.busy()">
                {{ state.busy() ? 'Guardando…' : 'Cambiar contraseña' }}
              </button>
            </form>
            <p class="auth-signup"><a routerLink="/auth/login">Volver al inicio de sesión</a></p>
          } @else {
            <p class="auth-subtitle">Tu contraseña fue actualizada.</p>
            <div class="auth-ok">Ya puedes iniciar sesión con tu nueva contraseña.</div>
            <p class="auth-signup"><a routerLink="/auth/login">Ir al inicio de sesión</a></p>
          }

          <p class="auth-footer">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .rec__status {
      text-align: left;
      border: 1px solid var(--ds-color-login-field-border);
      border-radius: 12px;
      padding: var(--ds-space-4);
      margin-bottom: var(--ds-space-3);
      color: var(--ds-color-login-title);
    }
    .rec__status b { display: block; margin-bottom: var(--ds-space-2); }
    .rec__status p { margin: 0 0 var(--ds-space-2); font-size: 13px; color: var(--ds-color-login-field-text); }
    .rec__status .rec__note { color: var(--ds-color-login-muted); margin: 0; }
  `,
})
export class RecuperarPage {
  readonly state: RecoverStateContract = inject(RECOVER_STATE);

  readonly email = signal('');
  readonly emailTouched = signal(false);
  readonly newPassword = signal('');
  readonly newTouched = signal(false);
  readonly confirm = signal('');
  readonly confirmTouched = signal(false);

  readonly emailValid = computed(() => EMAIL_RE.test(this.email().trim()));
  readonly emailErrors = computed(() =>
    this.emailTouched() && !this.emailValid() ? ['Ingrese un correo válido (ejemplo@correo.com)'] : [],
  );
  readonly newErrors = computed(() =>
    this.newTouched() && this.newPassword().length < 8
      ? ['La contraseña debe tener al menos 8 caracteres']
      : [],
  );
  readonly resetValid = computed(
    () => this.newPassword().length >= 8 && this.confirm() === this.newPassword(),
  );
  readonly confirmErrors = computed(() =>
    this.confirmTouched() && this.confirm() !== this.newPassword() ? ['Las contraseñas no coinciden'] : [],
  );

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'recuperar',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Recuperar contraseña · INTT' },
    });
  }

  async submit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.emailTouched.set(true);
    if (!this.emailValid()) return;
    await this.state.lookup(this.email().trim());
  }

  async recheck(): Promise<void> {
    await this.state.recheck(this.email().trim());
  }

  async reset(event?: Event): Promise<void> {
    event?.preventDefault();
    this.newTouched.set(true);
    this.confirmTouched.set(true);
    if (!this.resetValid()) return;
    await this.state.submitReset(this.email().trim(), this.newPassword());
  }
}
