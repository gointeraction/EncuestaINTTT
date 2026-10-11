import {
  Component, Input, Output, EventEmitter,
  inject, computed, ChangeDetectionStrategy, input
} from '@angular/core';
import { ThemeService } from '../../../system/services/theme.service';
import { DsIconComponent } from '../../display/icon/icon.component';

/**
 * DsPanelHeaderContainer
 *
 * Header estandarizado para paneles transversales.
 *
 * Estructura interna:
 *   [icon]  [title + subtitle]  [ng-content]  [new-btn?]  [close-btn]
 *
 * @Input icon       — icon name (Lucide or FA class, ej: 'calendar')
 * @Input title      — Título principal del panel
 * @Input subtitle   — Subtítulo opcional (ej: "3 pendientes")
 * @Input showNew    — Muestra el botón "+" de nueva instancia
 * @Input newLabel   — Texto del botón new (default: '')
 *
 * @Output closed    — El usuario clickeó el botón cerrar
 * @Output newClicked — El usuario clickeó el botón "nueva instancia"
 *
 * Uso:
 * ```html
 * <ds-panel-header-container
 *   icon="inbox"
 *   [title]="'Bandeja de Entrada'"
 *   [subtitle]="unreadCount() + ' sin leer'"
 *   [showNew]="true"
 *   (closed)="close()"
 *   (newClicked)="openCreateModal()"
 * >
 *   <!-- Optional extra content between title and action buttons -->
 * </ds-panel-header-container>
 * ```
 */
@Component({
  selector: 'ds-panel-header-container',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ds-panel-header"
      [class.ds-panel-header--design]="showDesign()"
    >
      @if (showDesign()) {
        <span class="ds-design-badge ds-design-badge--panel-header">
          PANEL HEADER
        </span>
      }

      <!-- Icon -->
      @if (icon) {
        <div class="ds-panel-header__icon">
          <ds-icon [name]="icon" size="sm"/>
        </div>
      }

      <!-- Title Block -->
      <div class="ds-panel-header__titles">
        <p class="ds-panel-header__title">{{ title }}</p>
        @if (subtitle) {
          <p class="ds-panel-header__subtitle">{{ subtitle }}</p>
        }
      </div>

      <!-- Extra projected content -->
      <ng-content></ng-content>

      <!-- Spacer -->
      <div class="ds-panel-header__spacer"></div>

      <!-- New Button -->
      @if (showNew) {
        <button
          class="ds-panel-header__new-btn"
          (click)="newClicked.emit()"
          [attr.aria-label]="newLabel || 'Nuevo'"
        >
          <ds-icon name="plus" size="xs"/>
          @if (newLabel) {
            <span>{{ newLabel }}</span>
          }
        </button>
      }

      <!-- Go to Main Button -->
      @if (showGoToMain) {
        <button
          class="ds-panel-header__goto-btn"
          (click)="goToMain.emit()"
          aria-label="Ir a página principal"
        >
          <ds-icon name="external-link" size="sm"/>
        </button>
      }

      <!-- Close Button -->
      <button
        class="ds-panel-header__close-btn"
        (click)="closed.emit()"
        aria-label="Cerrar panel"
      >
        <ds-icon name="x" size="sm"/>
      </button>
    </div>
  `,
  styles: `
    /* ── Header Base ───────────────────────────── */
    .ds-panel-header {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 var(--ds-panel-header-px, 1rem);
      height: var(--ds-panel-header-height, 3.5rem);
      flex-shrink: 0;
      border-bottom: 1px solid var(--ds-border-subtle);
    }

    /* ── Icon ──────────────────────────────────── */
    .ds-panel-header__icon {
      width: var(--ds-panel-header-icon-size, 2rem);
      height: var(--ds-panel-header-icon-size, 2rem);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--ds-surface-muted);
      color: var(--ds-text-muted);
    }

    /* ── Titles ────────────────────────────────── */
    .ds-panel-header__titles {
      display: flex;
      flex-direction: column;
      gap: 0.0625rem;
      min-width: 0;
    }

    .ds-panel-header__title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.25;
      color: var(--ds-surface-card-on);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ds-panel-header__subtitle {
      margin: 0;
      font-size: 0.625rem;
      line-height: 1.3;
      color: var(--ds-text-muted);
    }

    /* ── Spacer ────────────────────────────────── */
    .ds-panel-header__spacer {
      flex: 1 1 auto;
    }

    /* ── New Button ────────────────────────────── */
    .ds-panel-header__new-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid var(--ds-border-subtle);
      background: var(--ds-surface-muted);
      color: var(--ds-text-muted);
      font-size: 0.6875rem;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s, border-color 0.15s;
    }
    .ds-panel-header__new-btn:hover {
      background: var(--ds-surface-hover);
      border-color: color-mix(in oklab, var(--ds-color-black) 55%, transparent);
    }

    /* ── Go To Main Button ─────────────────────────── */
    .ds-panel-header__goto-btn {
      width: var(--ds-panel-close-size, 1.75rem);
      height: var(--ds-panel-close-size, 1.75rem);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      border: none;
      background: transparent;
      color: var(--ds-text-muted);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }
    .ds-panel-header__goto-btn:hover {
      background: var(--ds-surface-hover);
      color: var(--ds-surface-card-on);
    }

    /* ── Close Button ─────────────────────────── */
    .ds-panel-header__close-btn {
      width: var(--ds-panel-close-size, 1.75rem);
      height: var(--ds-panel-close-size, 1.75rem);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      border: none;
      background: transparent;
      color: var(--ds-text-muted);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }
    .ds-panel-header__close-btn:hover {
      background: var(--ds-surface-hover);
      color: var(--ds-surface-card-on);
    }

    /* ── Design Mode ──────────────────────────── */
    .ds-panel-header--design {
      background-color: var(--ds-design-panel-header-bg) !important;
      border: var(--ds-design-border-width, 2px)
              var(--ds-design-border-style, dashed)
              var(--ds-design-panel-header-border) !important;
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
    .ds-design-badge--panel-header {
      background-color: var(--ds-design-panel-header-badge-bg);
    }
  `
})
export class DsPanelHeaderContainer {
  private readonly themeSvc = inject(ThemeService);

  isDesign = input(false);
  /** Icon name (Lucide or FA class, e.g. 'calendar') */
  @Input() icon: string = '';
  /** Panel title */
  @Input() title = '';
  /** Optional subtitle below title */
  @Input() subtitle = '';
  /** Show "new instance" action button */
  @Input() showNew = false;
  /** Text label for the new button (icon-only if empty) */
  @Input() newLabel = '';
  /** Show navigation button to main/full view */
  @Input() showGoToMain = false;

  /** Close button clicked */
  @Output() closed = new EventEmitter<void>();
  /** New button clicked */
  @Output() newClicked = new EventEmitter<void>();
  /** Navigation to main clicked */
  @Output() goToMain = new EventEmitter<void>();

  protected readonly showDesign = computed(() => this.isDesign() || this.themeSvc.designMode());
}
