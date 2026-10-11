import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DsIconComponent } from '../../display/icon/icon.component';

/**
 * ds-side-box — side panel acting as a mini page.
 * Structural regions (mini-page): [header] slot, body (default ng-content),
 * [footer] slot. Closable on backdrop / Esc / close button; focus moves into
 * the panel on open and is restored on close (same pattern as ds-modal).
 *
 *   <ds-side-box [open]="true" title="Property details" (close)="...">
 *     <ng-container header>
 *       <ds-page-title title="Property" subtitle="MLS #1234"/>
 *     </ng-container>
 *     … body content …
 *     <ng-container footer>
 *       <ds-crud-actions mode="view"/>
 *     </ng-container>
 *   </ds-side-box>
 */
@Component({
  selector: 'ds-side-box',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents;',
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (open()) {
      <div class="ds-sb__backdrop" (mousedown)="closePanel()"></div>
      <aside class="ds-sb__panel" [style.width]="width()" role="dialog" aria-modal="true"
             tabindex="-1" [attr.aria-label]="title()">
        <header class="ds-sb__header">
          <div class="ds-sb__header-content">
            <ng-content select="[header]"/>
          </div>
          <button type="button" class="ds-sb__close" (click)="closePanel()" aria-label="Close panel">
            <ds-icon name="x" size="sm"/>
          </button>
        </header>
        <div class="ds-sb__body">
          <ng-content/>
        </div>
        @if (showFooter()) {
          <footer class="ds-sb__footer">
            <ng-content select="[footer]"/>
          </footer>
        }
      </aside>
    }
  `,
  styles: `
    .ds-sb__backdrop {
      position: fixed; inset: 0; z-index: var(--ds-z-overlay);
      background: var(--ds-component-modal-overlay-bg);
      animation: ds-sb-fade var(--ds-duration-fast) ease-out;
    }
    .ds-sb__panel {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: calc(var(--ds-z-overlay) + 1);
      display: flex; flex-direction: column;
      background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on);
      border-left: 1px solid var(--ds-border-default);
      box-shadow: var(--ds-shadow-lg);
      animation: ds-sb-slide var(--ds-duration-normal) ease-out;
    }
    .ds-sb__header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: var(--ds-space-4); padding: var(--ds-space-5) var(--ds-space-6);
      border-bottom: 1px solid var(--ds-border-divider); flex-shrink: 0;
    }
    .ds-sb__header-content { flex: 1; min-width: 0; }
    .ds-sb__close {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-8); height: var(--ds-size-8);
      border: none; border-radius: var(--ds-radius-md);
      background: transparent; color: var(--ds-text-muted); cursor: pointer;
      transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
      flex-shrink: 0;
    }
    .ds-sb__close:hover { background: var(--ds-surface-hover); }
    .ds-sb__body { flex: 1; overflow-y: auto; padding: var(--ds-space-6); }
    .ds-sb__footer {
      padding: var(--ds-space-4) var(--ds-space-6);
      border-top: 1px solid var(--ds-border-divider); flex-shrink: 0;
    }
    @keyframes ds-sb-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ds-sb-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
  `,
})
export class DsSideBoxComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly width = input('400px');
  readonly showFooter = input(false);
  readonly close = output();

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      if (this.open()) {
        this.previouslyFocused = this.document().activeElement as HTMLElement | null;
        afterNextRender(() => {
          const panel = this.hostEl.nativeElement.querySelector('.ds-sb__panel') as HTMLElement | null;
          panel?.focus();
        });
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });
  }

  protected onEscape(): void {
    if (this.open()) this.closePanel();
  }

  protected closePanel(): void {
    this.close.emit();
  }

  private document(): Document {
    return this.hostEl.nativeElement.ownerDocument ?? this.hostEl.nativeElement;
  }
}