import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsPaginationSize = 'sm' | 'md' | 'lg';

/** Size → box + text token mapping. */
const PG_SIZE: Record<DsPaginationSize, { box: string; font: string }> = {
  sm: { box: 'var(--ds-size-8)', font: 'var(--ds-text-label)' },
  md: { box: 'var(--ds-size-9)', font: 'var(--ds-text-small)' },
  lg: { box: 'var(--ds-size-10)', font: 'var(--ds-text-body)' },
};

/**
 * ds-pagination — paged navigation (standalone + OnPush).
 * Pages, prev/next, optional ellipsis for large page counts. Emits pageChange
 * with the new page index (1-based). Token-driven; ellipsis shown when pages
 * are many (window around the current page).
 */
@Component({
  selector: 'ds-pagination',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dsp-color]': 'textColor() || null',
    '[style.--dsp-active-color]': 'activeColor() || null',
  },
  template: `
    <nav class="dsp" [attr.data-pagination]="name()" aria-label="Pagination">
      <button type="button" class="dsp__btn" [disabled]="page() <= 1 || null"
              [style.width]="boxSize()" [style.height]="boxSize()"
              (click)="go(page() - 1)" aria-label="Previous">
        <ds-icon name="chevron-left" size="sm"/>
      </button>

      @for (p of visiblePages(); track p) {
        @if (p === '…') {
          <span class="dsp__ellipsis" [style.width]="boxSize()" [style.height]="boxSize()">…</span>
        } @else {
          <button type="button"
                  class="dsp__page"
                  [class.dsp__page--active]="p === page()"
                  [style.width]="boxSize()" [style.height]="boxSize()"
                  [style.font-size]="fontSize()"
                  (click)="go(p)">{{ p }}</button>
        }
      }

      <button type="button" class="dsp__btn" [disabled]="page() >= total() || null"
              [style.width]="boxSize()" [style.height]="boxSize()"
              (click)="go(page() + 1)" aria-label="Next">
        <ds-icon name="chevron-right" size="sm"/>
      </button>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      --dsp-color: var(--ds-text-muted);
      --dsp-active-color: var(--ds-text-primary);
    }
    .dsp { display: flex; align-items: center; gap: var(--ds-space-1); }
    .dsp__btn, .dsp__page {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--ds-radius-md); border: 1px solid var(--ds-border-default);
      background: transparent; color: var(--dsp-color); cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .dsp__btn:hover:not([disabled]), .dsp__page:hover:not(.dsp__page--active) {
      background: var(--ds-surface-hover); color: var(--dsp-active-color);
    }
    /* R5 (2026-09-08): visible focus ring on pagination controls (WCAG 2.2). */
    .dsp__btn:focus-visible, .dsp__page:focus-visible {
      outline: none;
      box-shadow: var(--ds-shadow-focus);
    }
    .dsp__btn[disabled] { opacity: 0.45; cursor: not-allowed; }
    .dsp__page--active {
      background: var(--ds-color-brand-primary); border-color: var(--ds-color-brand-primary);
      color: var(--ds-color-white);
    }
    .dsp__ellipsis {
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--dsp-color);
    }
  `,
})
export class DsPaginationComponent {
  readonly name = input('');
  readonly page = input<number>(1);
  readonly total = input<number>(1);
  readonly size = input<DsPaginationSize>('md');
  readonly siblingCount = input<number>(1);
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly pageChange = output<number>();

  protected readonly boxSize = computed(() => PG_SIZE[this.size()].box);
  protected readonly fontSize = computed(() => PG_SIZE[this.size()].font);

  /** Visible pages with '…' markers (window around current page). */
  protected readonly visiblePages = computed<Array<number | '…'>>(() => {
    const total = this.total();
    const page = this.page();
    const sibling = Math.max(1, this.siblingCount());
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const left = Math.max(1, page - sibling);
    const right = Math.min(total, page + sibling);
    const pages: Array<number | '…'> = [];
    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('…');
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total) {
      if (right < total - 1) pages.push('…');
      pages.push(total);
    }
    return pages;
  });

  protected go(p: number): void {
    if (p < 1 || p > this.total() || p === this.page()) return;
    this.pageChange.emit(p);
  }
}