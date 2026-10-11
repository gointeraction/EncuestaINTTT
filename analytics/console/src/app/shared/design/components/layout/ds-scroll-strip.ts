import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * ds-scroll-strip — reusable horizontal strip for a row of items (icon buttons,
 * mobile section tabs, action icons…). It:
 *  - lays its content in a single NON-wrapping row that fills the available width,
 *  - scrolls horizontally when the items overflow (hidden items reach the viewport),
 *  - supports drag-to-scroll with the pointer (mouse + touch),
 *  - suppresses button clicks while dragging.
 *
 * Usage:  <ds-scroll-strip> <button/> <button/> … </ds-scroll-strip>
 */
@Component({
  selector: 'ds-scroll-strip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ds-scroll-strip',
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'onUp()',
    '(pointerleave)': 'onUp()',
  },
  template: `<ng-content />`,
  styles: `
    .ds-scroll-strip {
      display: flex; align-items: center; gap: var(--ds-space-1);
      width: 100%; min-width: 0;
      overflow-x: auto; overflow-y: hidden; flex-wrap: nowrap;
      cursor: grab;
      scrollbar-width: thin;
      scrollbar-color: var(--ds-border-subtle) transparent;
    }
    .ds-scroll-strip::-webkit-scrollbar { height: 3px; }
    .ds-scroll-strip::-webkit-scrollbar-track { background: transparent; }
    .ds-scroll-strip::-webkit-scrollbar-thumb { background: var(--ds-border-subtle); border-radius: 9999px; }
    .ds-scroll-strip:hover::-webkit-scrollbar-thumb { background: var(--ds-text-muted); }
    .ds-scroll-strip.is-dragging { cursor: grabbing; }
    /* While dragging, ignore clicks on the (projected) buttons. */
    .ds-scroll-strip.is-dragging * { pointer-events: none; }
  `,
})
export class DsScrollStripComponent {
  private down = false;
  private moved = false;
  private startX = 0;
  private startScroll = 0;

  protected onDown(e: PointerEvent): void {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('is-dragging');   // re-enable clicks on a fresh press
    this.down = true;
    this.moved = false;
    this.startX = e.clientX;
    this.startScroll = el.scrollLeft;
  }

  protected onMove(e: PointerEvent): void {
    if (!this.down) return;
    const el = e.currentTarget as HTMLElement;
    const dx = e.clientX - this.startX;
    if (Math.abs(dx) > 5) {
      this.moved = true;
      el.classList.add('is-dragging');
    }
    if (this.moved) el.scrollLeft = this.startScroll - dx;
  }

  protected onUp(): void {
    this.down = false;
  }
}
