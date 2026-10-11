import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  afterNextRender,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DsIconComponent } from '../../display/icon/icon.component';

let nextModalId = 0;

/** Selector for elements that can receive keyboard focus (used by the focus trap). */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * ds-modal — behavior modal (standalone + OnPush).
 * Responsive overlay + panel (title/body/footer slots). Closable on overlay click,
 * Esc, or the header close button. Styled only with design tokens.
 * A11y (R4, 2026-09-08):
 *   - focus trap: Tab cycles inside `.ds-modal__panel`, never escapes the dialog;
 *   - scroll-lock: body overflow hidden while open, restored on close;
 *   - moves focus to the panel on open, restores it to the trigger on close;
 *   - `aria-labelledby` points to the rendered title heading.
 */
@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:keydown.tab)': 'onTabKey($event)',
  },
  template: `
    @if (open()) {
      <div class="ds-modal__overlay" (mousedown)="onOverlay()">
        <div
          class="ds-modal__panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-labelledby]="title() ? titleId : null"
          [attr.aria-label]="title() ? null : 'Dialog'"
          (mousedown)="$event.stopPropagation()"
        >
          @if (title()) {
            <header class="ds-modal__header">
              <h2 class="ds-modal__title" [id]="titleId">{{ title() }}</h2>
              <button type="button" class="ds-modal__close" aria-label="Close" (click)="close.emit()">
                <ds-icon name="x" size="xs"/>
              </button>
            </header>
          }
          <div class="ds-modal__body"><ng-content select="[ds-modal-body]"/></div>
          <footer class="ds-modal__footer"><ng-content select="[ds-modal-footer]"/></footer>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    .ds-modal__overlay {
      position: fixed; inset: 0; z-index: var(--ds-z-modal);
      display: flex; align-items: center; justify-content: center;
      padding: var(--ds-space-6);
      background: var(--ds-component-modal-overlay-bg);
    }
    .ds-modal__panel {
      width: 100%; max-width: var(--ds-container-md);
      border-radius: var(--ds-component-modal-radius);
      background: var(--ds-component-modal-bg);
      color: var(--ds-component-modal-on);
      box-shadow: var(--ds-component-modal-shadow);
      border: 1px solid var(--ds-component-modal-border);
      display: flex; flex-direction: column; gap: var(--ds-component-modal-gap);
      padding: var(--ds-component-modal-padding);
      max-height: calc(100vh - var(--ds-space-12));
      overflow: auto;
    }
    .ds-modal__header { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-gap-md); }
    .ds-modal__title {
      margin: 0;
      font-family: var(--ds-font-sans);
      font-size: var(--ds-text-heading-2);
      font-weight: var(--ds-font-weight-semibold);
    }
    .ds-modal__close {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-8); height: var(--ds-size-8);
      border-radius: var(--ds-radius-md);
      border: 1px solid var(--ds-border-subtle);
      background: transparent; color: var(--ds-text-muted); cursor: pointer;
    }
    .ds-modal__close:hover { background: var(--ds-surface-hover); }
    .ds-modal__body {
      font-family: var(--ds-font-sans);
      font-size: var(--ds-text-body);
      color: var(--ds-component-modal-on);
    }
    .ds-modal__footer { display: flex; justify-content: flex-end; gap: var(--ds-gap-sm); }
  `,
})
export class DsModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly close = output<void>();

  protected readonly titleId = `ds-modal-title-${++nextModalId}`;

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previouslyFocused: HTMLElement | null = null;
  private previousBodyOverflow: string | null = null;
  /** True while the panel should receive focus after the current render. */
  private readonly focusPending = signal(false);

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      if (this.open()) {
        this.previouslyFocused = this.document().activeElement as HTMLElement | null;
        this.lockScroll();
        this.focusPending.set(true);
      } else {
        this.unlockScroll();
        this.focusPending.set(false);
        if (this.previouslyFocused) {
          this.previouslyFocused.focus();
          this.previouslyFocused = null;
        }
      }
    });
    afterNextRender(() => {
      if (!this.isBrowser || !this.focusPending()) return;
      const panel = this.hostEl.nativeElement.querySelector('.ds-modal__panel') as HTMLElement | null;
      panel?.focus();
      this.focusPending.set(false);
    });
  }

  protected onEscape(): void {
    if (this.open()) this.close.emit();
  }

  protected onOverlay(): void {
    this.close.emit();
  }

  /** R4 — focus trap: Tab cycles within the panel; never leaves the dialog. */
  protected onTabKey(event: Event): void {
    if (!this.open()) return;
    const keyEvent = event as KeyboardEvent;
    const panel = this.hostEl.nativeElement.querySelector('.ds-modal__panel') as HTMLElement | null;
    if (!panel) return;
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusables.length === 0) {
      keyEvent.preventDefault();
      panel.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.document().activeElement as HTMLElement | null;
    if (keyEvent.shiftKey && (active === first || !panel.contains(active))) {
      keyEvent.preventDefault();
      last.focus();
    } else if (!keyEvent.shiftKey && active === last) {
      keyEvent.preventDefault();
      first.focus();
    }
  }

  private lockScroll(): void {
    const body = this.document().body;
    this.previousBodyOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    const body = this.document().body;
    body.style.overflow = this.previousBodyOverflow ?? '';
    this.previousBodyOverflow = null;
  }

  private document(): Document {
    return this.hostEl.nativeElement.ownerDocument ?? this.hostEl.nativeElement;
  }
}