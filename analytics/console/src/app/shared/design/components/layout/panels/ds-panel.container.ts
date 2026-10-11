import {
  Component, Input, Output, EventEmitter,
  inject, computed, ChangeDetectionStrategy, input
} from '@angular/core';
import { ThemeService } from '../../../system/services/theme.service';

/**
 * DsPanelContainer
 *
 * Shell principal para paneles laterales transversales (slide-in derecho).
 *
 * Comportamiento:
 * - Posición fija, anclado al borde derecho del viewport
 * - Backdrop clickeable para cerrar
 * - Animación slide-in desde la derecha
 * - Delega contenido a header/body/footer via ng-content
 *
 * Uso:
 * ```html
 * <ds-panel-container [open]="isOpen()" (closed)="close()">
 *   <ds-panel-header-container .../>
 *   <ds-panel-body-container>...</ds-panel-body-container>
 *   <ds-panel-footer-container>...</ds-panel-footer-container>
 * </ds-panel-container>
 * ```
 */
@Component({
  selector: 'ds-panel-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <!-- Backdrop -->
      <div
        class="ds-panel-backdrop"
        (click)="closed.emit()"
        aria-hidden="true"
      ></div>

      <!-- Panel Shell -->
      <aside
        class="ds-panel-shell"
        [class.ds-panel-shell--design]="showDesign()"
        role="complementary"
        [attr.aria-label]="ariaLabel"
      >
        @if (showDesign()) {
          <span class="ds-design-badge ds-design-badge--panel">
            PANEL CONTAINER
          </span>
        }

        <ng-content></ng-content>
      </aside>
    }
  `,
  styles: `
    /* ── Backdrop ──────────────────────────────── */
    .ds-panel-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--ds-panel-z-backdrop, 125);
      /* Transparent backdrop — lets the underlying page show through */
    }

    /* ── Panel Shell ──────────────────────────── */
    .ds-panel-shell {
      position: fixed;
      right: 0;
      top: var(--ds-panel-top-offset, 3.5rem);
      width: var(--ds-panel-width, 22rem);
      height: calc(100vh - var(--ds-panel-top-offset, 3.5rem));
      z-index: var(--ds-panel-z-panel, 130);

      display: flex;
      flex-direction: column;

      background: var(--ds-panel-bg);
      border-left: 1px solid var(--ds-panel-border-color);
      border-radius: var(--ds-radius-lg, 0);
      box-shadow: var(--ds-panel-shadow);

      animation: ds-panel-slide-in
        var(--ds-duration-normal, 0.28s)
        var(--ds-ease-standard, cubic-bezier(0.16, 1, 0.3, 1))
        forwards;
    }

    @keyframes ds-panel-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    /* ── Design Mode ──────────────────────────── */
    .ds-panel-shell--design {
      background-color: var(--ds-design-panel-bg) !important;
      border: var(--ds-design-border-width, 2px)
              var(--ds-design-border-style, dashed)
              var(--ds-design-panel-border) !important;
      border-radius: var(--ds-design-border-radius, 0.5rem);
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
    .ds-design-badge--panel {
      background-color: var(--ds-design-panel-badge-bg);
    }
  `
})
export class DsPanelContainer {
  private readonly themeSvc = inject(ThemeService);

  /** Whether the panel is visible */
  @Input() open = false;
  /** Accessibility label for the panel */
  @Input() ariaLabel = 'Panel';
  /** Design mode toggle */
  isDesign = input(false);

  /** Emits when the backdrop is clicked (panel requests close) */
  @Output() closed = new EventEmitter<void>();

  protected readonly showDesign = computed(() => this.isDesign() || this.themeSvc.designMode());
}
