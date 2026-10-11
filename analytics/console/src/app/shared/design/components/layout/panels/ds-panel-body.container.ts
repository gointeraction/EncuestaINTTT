import {
  Component, Input,
  inject, computed, ChangeDetectionStrategy, input
} from '@angular/core';
import { ThemeService } from '../../../system/services/theme.service';

/**
 * DsPanelBodyContainer
 *
 * Zona scrolleable del panel. Ocupa todo el espacio vertical restante
 * entre header y footer.
 *
 * Comportamiento:
 * - flex: 1 1 auto con min-height: 0 para permitir overflow
 * - overflow-y: auto con thin scrollbar estilizado
 * - Padding controlado por tokens
 *
 * Uso:
 * ```html
 * <ds-panel-body-container>
 *   <!-- Loading skeleton, list items, empty state... -->
 * </ds-panel-body-container>
 * ```
 */
@Component({
  selector: 'ds-panel-body-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ds-panel-body"
      [class.ds-panel-body--design]="showDesign()"
    >
      @if (showDesign()) {
        <span class="ds-design-badge ds-design-badge--panel-body">
          PANEL BODY
        </span>
      }

      <ng-content></ng-content>
    </div>
  `,
  styles: `
    /* ── Host: flex child que llena el espacio restante ── */
    :host {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
    }

    /* ── Body Base ─────────────────────────────── */
    .ds-panel-body {
      position: relative;
      width: 100%;
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--ds-panel-body-py, 0) var(--ds-panel-body-px, 0);

      /* Thin scrollbar */
      scrollbar-width: thin;
      scrollbar-color: var(--ds-color-design-neutral-400) transparent;
    }

    .ds-panel-body::-webkit-scrollbar {
      width: var(--ds-panel-scrollbar-width, 4px);
    }
    .ds-panel-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .ds-panel-body::-webkit-scrollbar-thumb {
      background: var(--ds-color-design-neutral-400);
      border-radius: 2px;
    }

    /* ── Design Mode ──────────────────────────── */
    .ds-panel-body--design {
      background-color: var(--ds-design-panel-body-bg) !important;
      border: var(--ds-design-border-width, 2px)
              var(--ds-design-border-style, dashed)
              var(--ds-design-panel-body-border) !important;
      border-radius: var(--ds-design-border-radius, 0.5rem);
      min-height: var(--ds-design-min-height, 80px);
    }

    .ds-design-badge {
      position: absolute;
      top: var(--ds-design-badge-offset-top, -0.75rem);
      left: var(--ds-design-badge-offset-left, 0.5rem);
      color: var(--ds-design-badge-text, white);
      font-size: var(--ds-design-badge-font-size, 10px);
      font-weight: var(--ds-design-badge-font-weight, 700);
      padding: var(--ds-design-badge-padding, 0.125rem 0.5rem);
      border-radius: var(--ds-design-badge-radius, 3px);
      box-shadow: var(--ds-design-badge-shadow);
      pointer-events: none;
      z-index: 10;
      letter-spacing: 0.05em;
    }
    .ds-design-badge--panel-body {
      background-color: var(--ds-design-panel-body-badge-bg);
    }
  `
})
export class DsPanelBodyContainer {
  private readonly themeSvc = inject(ThemeService);
  isDesign = input(false);

  protected readonly showDesign = computed(() => this.isDesign() || this.themeSvc.designMode());
}
