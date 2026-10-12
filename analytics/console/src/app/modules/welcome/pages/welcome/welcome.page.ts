import { Component, effect, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DsContainerComponent, DsIconComponent, ThemeService } from '@cifraflow/design';
import { WELCOME_STATE, type WelcomeStateContract } from './business/contracts/welcome.state.contract';
import { WelcomeStateService } from './business/state/welcome.state.service';

/**
 * @akuri-page
 * page: welcome
 * route: /bienvenida
 * view: VL1
 * function: FL3
 * spine: display > page > area(body) > section > content
 */
@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, DsContainerComponent, DsIconComponent],
  providers: [WelcomeStateService, { provide: WELCOME_STATE, useExisting: WelcomeStateService }],
  template: `
    <ds-container kind="page" name="welcome">
      <ds-container kind="area" name="body" class="auth-bg">
        <ds-container kind="block" name="welcome-card" class="auth-card">
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
          <p class="auth-subtitle">
            Selecciona la encuesta y el área con la que quieres trabajar.
          </p>

          <div class="wlb__survey">
            <label for="welcome-survey">Encuesta / cuestionario</label>
            @if (state.surveys().length) {
              <select
                id="welcome-survey"
                [value]="state.activeSurveyId()"
                (change)="state.setSurvey($any($event.target).value)"
              >
                @for (s of state.surveys(); track s.id) {
                  <option [value]="s.id">{{ s.title }}</option>
                }
              </select>
            } @else {
              <p class="wlb__onlyone">{{ state.surveyTitle() }}</p>
            }
          </div>

          <div class="wlb__dests">
            @for (d of state.destinations(); track d.id) {
              <a class="wlb__dest" [routerLink]="d.route">
                <ds-icon [name]="d.icon" class="wlb__dest-icon" />
                <span class="wlb__dest-body">
                  <b>{{ d.label }}</b>
                  <small>{{ d.description }}</small>
                </span>
              </a>
            }
          </div>

          <p class="auth-footer">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .wlb__survey { display: flex; flex-direction: column; gap: var(--ds-space-1); text-align: left; margin-bottom: var(--ds-space-4); }
    .wlb__survey label { font-size: 13px; font-weight: 600; color: var(--ds-color-login-label); }
    .wlb__survey select {
      height: 46px;
      padding: 0 var(--ds-space-4);
      border: 1px solid var(--ds-color-login-field-border);
      border-radius: 999px;
      font-size: 13px;
      font-family: inherit;
      color: var(--ds-color-login-field-text);
      background: var(--ds-color-login-card-bg);
      outline: none;
    }
    .wlb__survey select:focus { border-color: var(--ds-color-login-link); }
    .wlb__onlyone { margin: 0; height: 46px; display: flex; align-items: center; padding: 0 var(--ds-space-4); border: 1px solid var(--ds-color-login-field-border); border-radius: 999px; font-size: 13px; color: var(--ds-color-login-field-text); }
    .wlb__dests { display: flex; flex-direction: column; gap: var(--ds-space-2); }
    .wlb__dest {
      display: flex;
      align-items: center;
      gap: var(--ds-space-3);
      padding: var(--ds-space-3) var(--ds-space-4);
      border: 1px solid var(--ds-color-login-field-border);
      border-radius: 14px;
      text-decoration: none;
      color: var(--ds-color-login-title);
      transition: border-color 0.15s, background 0.15s;
    }
    .wlb__dest:hover { border-color: var(--ds-color-login-link); background: var(--ds-color-login-icon-bg); }
    .wlb__dest-icon { color: var(--ds-color-login-action); flex-shrink: 0; }
    .wlb__dest-body { display: flex; flex-direction: column; text-align: left; }
    .wlb__dest-body b { font-size: var(--ds-text-body); }
    .wlb__dest-body small { font-size: 12px; color: var(--ds-color-login-muted); }
  `,
})
export class WelcomePage {
  readonly state: WelcomeStateContract = inject(WELCOME_STATE);
  private readonly router = inject(Router);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'welcome',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Bienvenida · INTT' },
    });
    // Auto-ruta si el usuario solo tiene un destino disponible (no hay nada que elegir).
    effect(() => {
      const destinations = this.state.destinations();
      if (destinations.length === 1) {
        void this.router.navigateByUrl(destinations[0].route, { replaceUrl: true });
      }
    });
  }
}
