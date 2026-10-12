import { Component, effect, inject } from '@angular/core';
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
  imports: [RouterLink, DsContainerComponent, DsIconComponent],
  providers: [WelcomeStateService, { provide: WELCOME_STATE, useExisting: WelcomeStateService }],
  template: `
    <ds-container kind="page" name="welcome">
      <ds-container kind="area" name="body" class="hub">
        <div class="hub__head">
          <p class="hub__eyebrow">Encuesta actual</p>
          <h1 class="hub__title">{{ state.surveyTitle() }}</h1>
          <p class="hub__subtitle">
            Elige un área. Solo verás las que tu cuenta y el entorno permiten.
          </p>
        </div>
        <div class="hub__grid">
          @for (d of state.destinations(); track d.id) {
            <a class="hub__card" [routerLink]="d.route">
              <ds-icon [name]="d.icon" class="hub__icon" />
              <h2 class="hub__card-title">{{ d.label }}</h2>
              <p class="hub__card-text">{{ d.description }}</p>
            </a>
          }
        </div>
      </ds-container>
    </ds-container>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .hub {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--ds-space-8);
      padding: var(--ds-space-8) var(--ds-space-4);
      box-sizing: border-box;
    }
    .hub__head { text-align: center; max-width: 40rem; }
    .hub__eyebrow {
      margin: 0 0 var(--ds-space-1);
      font-size: var(--ds-text-caption);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ds-color-brand-secondary);
    }
    .hub__title { margin: 0 0 var(--ds-space-2); font-size: var(--ds-text-heading-2); color: var(--ds-surface-page-on); }
    .hub__subtitle { margin: 0; font-size: var(--ds-text-body); color: var(--ds-text-muted); }
    .hub__grid {
      display: grid;
      gap: var(--ds-space-5);
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      width: 100%;
      max-width: var(--ds-container-lg);
    }
    .hub__card {
      display: flex;
      flex-direction: column;
      gap: var(--ds-space-2);
      padding: var(--ds-space-5);
      background: var(--ds-surface-card);
      color: var(--ds-surface-card-on);
      border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-lg);
      box-shadow: var(--ds-shadow-sm);
      text-decoration: none;
      transition: box-shadow 0.15s, transform 0.15s;
    }
    .hub__card:hover { box-shadow: var(--ds-shadow-md); transform: translateY(-2px); }
    .hub__icon { color: var(--ds-color-brand-primary); }
    .hub__card-title { margin: 0; font-size: var(--ds-text-heading-4); }
    .hub__card-text { margin: 0; font-size: var(--ds-text-small); color: var(--ds-text-muted); }
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
