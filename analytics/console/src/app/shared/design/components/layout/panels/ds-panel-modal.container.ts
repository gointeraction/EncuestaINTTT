import {
  Component, Input, Output, EventEmitter,
  inject, computed, ChangeDetectionStrategy, input
} from '@angular/core';
import { ThemeService } from '../../../system/services/theme.service';
import { DsIconComponent } from '../../display/icon/icon.component';

/**
 * DsPanelModalContainer
 *
 * Modal estandarizado para creación de nuevas instancias dentro de paneles.
 * Se superpone al panel con un backdrop oscuro y un formulario centrado.
 *
 * Comportamiento:
 * - z-index superior al panel (--ds-panel-z-modal: 140)
 * - Backdrop clickeable para cerrar
 * - Centrado vertical y horizontal
 * - Animación fade+scale-in
 * - Delega el formulario vía ng-content
 *
 * Uso:
 * ```html
 * <ds-panel-modal-container
 *   [open]="showCreateModal()"
 *   [title]="'Nuevo Evento'"
 *   icon="calendar-plus"
 *   (closed)="closeModal()"
 * >
 *   <!-- Form fields go here via ng-content -->
 *   <form>...</form>
 * </ds-panel-modal-container>
 * ```
 */
@Component({
  selector: 'ds-panel-modal-container',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <!-- Modal Backdrop -->
      <div
        class="ds-panel-modal-backdrop"
        (click)="closed.emit()"
        aria-hidden="true"
      ></div>

      <!-- Modal Card -->
      <div
        class="ds-panel-modal"
        [class.ds-panel-modal--design]="showDesign()"
        role="dialog"
        [attr.aria-label]="title"
        aria-modal="true"
      >
        @if (showDesign()) {
          <span class="ds-design-badge ds-design-badge--panel-modal">
            PANEL MODAL
          </span>
        }

        <!-- Modal Header -->
        <div class="ds-panel-modal__header">
          @if (icon) {
            <div class="ds-panel-modal__icon">
              <ds-icon [name]="icon" size="sm"/>
            </div>
          }
          <h3 class="ds-panel-modal__title">{{ title }}</h3>
          <div class="ds-panel-modal__spacer"></div>
          <button
            class="ds-panel-modal__close"
            (click)="closed.emit()"
            aria-label="Cerrar modal"
          >
            <ds-icon name="x" size="sm"/>
          </button>
        </div>

        <!-- Modal Body (projected form) -->
        <div class="ds-panel-modal__body">
          <ng-content></ng-content>
        </div>

        <!-- Modal Footer (projected actions) -->
        <div class="ds-panel-modal__footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    }
  `,
  styles: `
    /* ── Backdrop ──────────────────────────────── */
    .ds-panel-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--ds-panel-z-modal, 140);
      background: var(--ds-panel-modal-backdrop, color-mix(in oklab, var(--ds-color-black) 60%, transparent));
      animation: ds-modal-backdrop-in 0.2s ease forwards;
    }

    @keyframes ds-modal-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Modal Card ───────────────────────────── */
    .ds-panel-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: calc(var(--ds-panel-z-modal, 140) + 1);

      width: calc(100vw - 2rem);
      max-width: var(--ds-panel-modal-max-w, 28rem);
      max-height: calc(100vh - 4rem);

      display: flex;
      flex-direction: column;

      background: var(--ds-surface-modal);
      border: 1px solid var(--ds-panel-border-color);
      border-radius: var(--ds-panel-modal-radius, 1rem);
      box-shadow: var(--ds-shadow-lg);

      animation: ds-modal-card-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes ds-modal-card-in {
      from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
      to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    /* ── Modal Header ─────────────────────────── */
    .ds-panel-modal__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--ds-border-subtle);
      flex-shrink: 0;
    }

    .ds-panel-modal__icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--ds-surface-muted);
      color: var(--ds-text-muted);
    }

    .ds-panel-modal__title {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--ds-surface-card-on);
      line-height: 1.25;
    }

    .ds-panel-modal__spacer {
      flex: 1 1 auto;
    }

    .ds-panel-modal__close {
      width: 1.75rem;
      height: 1.75rem;
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
    .ds-panel-modal__close:hover {
      background: var(--ds-surface-hover);
      color: var(--ds-surface-card-on);
    }

    /* ── Modal Body ────────────────────────────── */
    .ds-panel-modal__body {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 1.25rem;

      scrollbar-width: thin;
      scrollbar-color: var(--ds-color-design-neutral-400) transparent;
    }
    .ds-panel-modal__body::-webkit-scrollbar {
      width: var(--ds-panel-scrollbar-width, 4px);
    }
    .ds-panel-modal__body::-webkit-scrollbar-thumb {
      background: var(--ds-color-design-neutral-400);
      border-radius: 2px;
    }

    /* ── Modal Footer ─────────────────────────── */
    .ds-panel-modal__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--ds-border-subtle);
      flex-shrink: 0;
    }

    /* Hide footer if empty (no projected content) */
    .ds-panel-modal__footer:empty {
      display: none;
    }

    /* ── Design Mode ──────────────────────────── */
    .ds-panel-modal--design {
      background-color: var(--ds-design-panel-modal-bg) !important;
      border: var(--ds-design-border-width, 2px)
              var(--ds-design-border-style, dashed)
              var(--ds-design-panel-modal-border) !important;
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
    .ds-design-badge--panel-modal {
      background-color: var(--ds-design-panel-modal-badge-bg);
    }
  `
})
export class DsPanelModalContainer {
  private readonly themeSvc = inject(ThemeService);

  /** Whether the modal is visible */
  @Input() open = false;
  /** Modal title */
  @Input() title = '';
  /** Icon name (Lucide) */
  @Input() icon: string = '';
  /** Design mode toggle */
  isDesign = input(false);

  /** Emits when backdrop or close button is clicked */
  @Output() closed = new EventEmitter<void>();

  protected readonly showDesign = computed(() => this.isDesign() || this.themeSvc.designMode());
}
