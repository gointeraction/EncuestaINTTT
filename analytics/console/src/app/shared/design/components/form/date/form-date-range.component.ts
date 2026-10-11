import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';
import { CALENDAR_MONTHS, CALENDAR_WEEKDAYS, addDaysIso, buildCalendarGrid, formatIso, todayIso as todayIsoUtil } from './calendar.util';

export type DsFormDateRangeState = 'default' | 'error' | 'success';

export interface DsFormDateRangeValue {
  from: string; // ISO YYYY-MM-DD
  to: string;   // ISO YYYY-MM-DD
}

interface DsFormDateRangePanelPos {
  left: number;
  top: number;
  width: number;
}

/**
 * ds-form-date-range — calendar range picker (standalone + OnPush).
 * Two-month calendar; click a start day then an end day (range preview on
 * hover). Value is { from, to } ISO strings; emits valueChange with the new
 * range (from/to '' when incomplete/cleared). Token-driven (--dsdr-*).
 */
@Component({
  selector: 'ds-form-date-range',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dsdr-surface]': 'surface() || null',
    '[style.--dsdr-color]': 'textColor() || null',
    '[style.--dsdr-active-color]': 'activeColor() || null',
    '[class.ds-form-date-range--error]': "state() === 'error'",
    '[class.ds-form-date-range--success]': "state() === 'success'",
  },
  template: `
    <div class="dsdr" [attr.data-date-range]="name()">
      @if (label(); as l) {
        <label class="dsdr__label" [attr.for]="id()">{{ l }}</label>
      }
      <div class="dsdr__control">
        <button type="button"
                class="dsdr__trigger"
                [disabled]="disabled()"
                [id]="id()"
                aria-haspopup="dialog"
                [attr.aria-expanded]="open()"
                (click)="toggle()">
          <ds-icon class="dsdr__calendar-icon" name="calendar" size="sm"/>
          <span class="dsdr__value" [class.dsdr__placeholder]="!value()?.from">
            {{ displayValue() || placeholder() }}
          </span>
          <ds-icon class="dsdr__chevron" name="chevron-down" size="sm"/>
        </button>
        @if (clearable() && value()?.from) {
          <button type="button" class="dsdr__clear" (click)="clear($event)" aria-label="Clear">
            <ds-icon name="x" size="xs"/>
          </button>
        }
      </div>
      @if (state() === 'error' && message(); as m) {
        <p class="dsdr__message dsdr__message--error">{{ m }}</p>
      } @else if (hint(); as h) {
        <p class="dsdr__message dsdr__message--hint">{{ h }}</p>
      }
    </div>

    @if (open()) {
      <div class="dsdr__backdrop" (mousedown)="close()"></div>
      <div class="dsdr__panel" role="dialog"
           [style.left.px]="pos()?.left"
           [style.top.px]="pos()?.top"
           [style.width.px]="pos()?.width">
        <div class="dsdr__months">
          @for (offset of [0, 1]; track offset) {
            <div class="dsdr__month">
              <div class="dsdr__header">
                @if (offset === 0) {
                  <button type="button" class="dsdr__nav" (click)="month(-1)" aria-label="Previous month">
                    <ds-icon name="chevron-left" size="sm"/>
                  </button>
                } @else {
                  <span></span>
                }
                <span class="dsdr__title">{{ CALENDAR_MONTHS[monthAt(offset)] }} {{ yearAt(offset) }}</span>
                @if (offset === 1) {
                  <button type="button" class="dsdr__nav" (click)="month(1)" aria-label="Next month">
                    <ds-icon name="chevron-right" size="sm"/>
                  </button>
                } @else {
                  <span></span>
                }
              </div>
              <div class="dsdr__weekdays">
                @for (w of CALENDAR_WEEKDAYS; track w) {
                  <span class="dsdr__weekday">{{ w }}</span>
                }
              </div>
              <div class="dsdr__days" role="grid"
                   [attr.aria-label]="gridLabel(offset)"
                   (keydown)="onGridKeydown($event)">
                @for (cell of gridAt(offset); track cell.key) {
                  @if (cell.blank) {
                    <span class="dsdr__day dsdr__day--blank"></span>
                  } @else {
                    <button type="button"
                            class="dsdr__day"
                            [class.dsdr__day--in-range]="inRange(cell.iso)"
                            [class.dsdr__day--start]="cell.iso === value()?.from"
                            [class.dsdr__day--end]="cell.iso === value()?.to"
                            [class.dsdr__day--today]="cell.iso === todayIso()"
                            role="gridcell"
                            [attr.aria-selected]="cell.iso === value()?.from || cell.iso === value()?.to"
                            [attr.aria-label]="fullDate(cell.iso)"
                            [disabled]="disabledDate(cell.iso)"
                            (mouseenter)="preview(cell.iso)"
                            (click)="pick(cell.iso)">{{ cell.day }}</button>
                  }
                }
              </div>
            </div>
          }
        </div>
        <div class="dsdr__footer">
          <span class="dsdr__selection">{{ displayValue() }}</span>
          <button type="button" class="dsdr__today" (click)="pickToday()">Today</button>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --dsdr-surface: var(--ds-form-input-bg);
      --dsdr-color: var(--ds-form-input-bg-on);
      --dsdr-active-color: var(--ds-color-brand-primary);
      --dsdr-border: var(--ds-form-input-border);
      --dsdr-border-focus: var(--ds-form-input-border-focus);
    }
    .dsdr { display: flex; flex-direction: column; gap: var(--ds-gap-sm); }
    .dsdr__control { position: relative; }
    .dsdr__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .dsdr__trigger {
      display: flex; align-items: center; gap: var(--ds-space-2); justify-content: space-between;
      width: 100%; height: var(--ds-size-11);
      padding: 0 var(--ds-space-3);
      background: var(--dsdr-surface); color: var(--dsdr-color);
      border: 1px solid var(--dsdr-border); border-radius: var(--ds-form-radius-standard);
      font-size: var(--ds-text-input); text-align: left; cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .dsdr__trigger:hover:not([disabled]) { border-color: var(--ds-form-input-border-hover); }
    .dsdr__trigger:focus-visible {
      border-color: var(--dsdr-border-focus);
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--dsdr-border-focus) 25%, transparent);
      outline: none;
    }
    .dsdr__trigger[disabled] { background: var(--ds-form-input-bg-disabled); color: var(--ds-form-input-bg-disabled-on); cursor: not-allowed; }
    .dsdr__calendar-icon { color: var(--ds-text-muted); }
    .dsdr__value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dsdr__placeholder { color: var(--ds-form-placeholder); }
    .dsdr__clear {
      display: inline-flex; align-items: center; justify-content: center;
      position: absolute; right: calc(var(--ds-size-5) + var(--ds-space-1));
      top: 50%; transform: translateY(-50%);
      width: var(--ds-size-5); height: var(--ds-size-5); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-full);
    }
    .dsdr__clear:hover { color: var(--dsdr-active-color); background: var(--ds-surface-hover); }
    .dsdr__chevron { color: var(--ds-text-muted); }
    .dsdr__message { font-size: var(--ds-text-caption); }
    .dsdr__message--hint { color: var(--ds-text-muted); }
    .dsdr__message--error { color: var(--ds-status-danger); }
    :host(.ds-form-date-range--error) .dsdr__label { color: var(--ds-status-danger); }
    :host(.ds-form-date-range--success) .dsdr__label { color: var(--ds-status-success); }

    .dsdr__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-overlay); background: transparent; }
    .dsdr__panel {
      position: fixed; z-index: calc(var(--ds-z-overlay) + 1);
      background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-md);
      box-shadow: var(--ds-shadow-lg);
    }
    .dsdr__months { display: flex; gap: var(--ds-space-4); padding: var(--ds-space-3); }
    .dsdr__month { flex: 1; min-width: 14rem; }
    .dsdr__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 var(--ds-space-1) var(--ds-space-2);
    }
    .dsdr__nav {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-md);
    }
    .dsdr__nav:hover { background: var(--ds-surface-hover); color: var(--dsdr-active-color); }
    .dsdr__title { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-semibold); }
    .dsdr__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); }
    .dsdr__weekday {
      font-size: var(--ds-text-caption); color: var(--ds-text-muted);
      text-align: center; font-weight: var(--ds-font-weight-medium);
    }
    .dsdr__days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
    .dsdr__day {
      display: inline-flex; align-items: center; justify-content: center;
      width: 100%; aspect-ratio: 1; border: none; background: transparent;
      color: var(--ds-surface-elevated-on); font-size: var(--ds-text-small);
      cursor: pointer; border-radius: var(--ds-radius-md);
    }
    .dsdr__day:hover:not(:disabled) { background: var(--ds-surface-hover); }
    .dsdr__day--today { box-shadow: inset 0 0 0 1px var(--dsdr-active-color); }
    .dsdr__day--in-range { background: color-mix(in oklab, var(--dsdr-active-color) 14%, transparent); border-radius: 0; }
    .dsdr__day--start, .dsdr__day--end { background: var(--dsdr-active-color); color: var(--ds-color-white); font-weight: var(--ds-font-weight-semibold); border-radius: var(--ds-radius-md); }
    .dsdr__day--blank { visibility: hidden; }
    .dsdr__day:disabled { opacity: 0.35; cursor: not-allowed; }
    .dsdr__footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--ds-space-2) var(--ds-space-3); border-top: 1px solid var(--ds-border-default);
    }
    .dsdr__selection { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .dsdr__today {
      border: none; background: transparent; color: var(--dsdr-active-color);
      font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-medium);
      cursor: pointer; border-radius: var(--ds-radius-sm);
    }
    .dsdr__today:hover { background: var(--ds-surface-hover); }
  `,
})
export class DsFormDateRangeComponent {
  readonly name = input('');
  readonly id = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly message = input('');
  readonly state = input<DsFormDateRangeState>('default');
  readonly value = input<DsFormDateRangeValue | null>(null);
  readonly placeholder = input('Select date range');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly clearable = input(false);
  readonly disabled = input(false);
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly valueChange = output<DsFormDateRangeValue>();

  protected readonly CALENDAR_MONTHS = CALENDAR_MONTHS;
  protected readonly CALENDAR_WEEKDAYS = CALENDAR_WEEKDAYS;

  protected readonly open = signal(false);
  protected readonly pos = signal<DsFormDateRangePanelPos | null>(null);
  protected readonly viewMonth = signal(0);
  protected readonly viewYear = signal(0);
  /** First day of an in-progress range selection (clicked but no end yet). */
  protected readonly pendingFrom = signal('');

  /** Title of the month shown at offset 0/1. */
  protected monthAt(offset: number): number {
    return (this.viewMonth() + offset) % 12;
  }

  protected yearAt(offset: number): number {
    return this.viewYear() + Math.floor((this.viewMonth() + offset) / 12);
  }

  protected gridAt(offset: number) {
    return buildCalendarGrid(this.yearAt(offset), this.monthAt(offset));
  }

  protected readonly displayValue = computed(() => {
    const v = this.value();
    if (!v?.from && !v?.to) return '';
    return v.from ? `${formatIso(v.from)} – ${v.to ? formatIso(v.to) : '…'}` : '';
  });

  protected todayIso(): string {
    return todayIsoUtil();
  }

  /** Full readable date for gridcell labels, e.g. "12 September 2026". */
  protected fullDate(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${CALENDAR_MONTHS[m - 1]} ${y}`;
  }

  /** Readable label for a month grid, e.g. "September 2026". */
  protected gridLabel(offset: number): string {
    return `${CALENDAR_MONTHS[this.monthAt(offset)]} ${this.yearAt(offset)}`;
  }

  /**
   * Grid keyboard navigation (R6 — ARIA grid pattern) per month grid:
   * Left/Right = day, Up/Down = week, Home/End = first/last day of the grid.
   */
  protected onGridKeydown(event: KeyboardEvent): void {
    const current = event.target as HTMLButtonElement | null;
    const grid = event.currentTarget as HTMLElement;
    if (!current) return;
    const days = Array.from(grid.querySelectorAll<HTMLButtonElement>('.dsdr__day:not(.dsdr__day--blank):not(:disabled)'));
    if (!days.length) return;
    const idx = days.indexOf(current);
    const moveTo = (el: HTMLButtonElement | undefined): void => {
      if (!el) return;
      event.preventDefault();
      el.focus();
    };
    switch (event.key) {
      case 'ArrowLeft': moveTo(days[idx - 1]); break;
      case 'ArrowRight': moveTo(days[idx + 1]); break;
      case 'ArrowUp': moveTo(days[idx - 7]); break;
      case 'ArrowDown': moveTo(days[idx + 7]); break;
      case 'Home': moveTo(days[0]); break;
      case 'End': moveTo(days[days.length - 1]); break;
    }
  }

  protected disabledDate(iso: string): boolean {
    const min = this.min();
    const max = this.max();
    return (min !== '' && iso < min) || (max !== '' && iso > max);
  }

  /** True if iso is strictly between from/to (exclusive ends). */
  protected inRange(iso: string): boolean {
    const v = this.value();
    const start = v?.from || this.pendingFrom();
    const end = v?.to || '';
    if (!start || !end) return false;
    return iso > start && iso < end;
  }

  /** Preview range on hover when an end is pending. */
  protected preview(iso: string): void {
    if (!this.pendingFrom()) return;
    const v = this.value();
    if (v?.from || v?.to) return; // completed range: no hover preview
    // Nothing to do — preview uses pendingFrom only in inRange().
  }

  protected pick(iso: string): void {
    if (this.disabledDate(iso)) return;
    const v = this.value();
    // Case 1: no range yet → start a new range.
    if (!v?.from || (v.from && v.to)) {
      this.pendingFrom.set(iso);
      this.valueChange.emit({ from: iso, to: '' });
      return;
    }
    // Case 2: from set, no to → complete the range (order-normalized).
    const from = v.from;
    const to = iso;
    this.pendingFrom.set('');
    this.valueChange.emit(from <= to ? { from, to } : { from: to, to: from });
  }

  protected pickToday(): void {
    const t = todayIsoUtil();
    if (this.disabledDate(t)) return;
    this.valueChange.emit({ from: t, to: t });
    this.close();
  }

  constructor(private readonly hostEl: ElementRef<HTMLElement>) {
    const now = new Date();
    this.viewMonth.set(now.getMonth());
    this.viewYear.set(now.getFullYear());
  }

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    const triggerEl = this.hostEl.nativeElement.querySelector('.dsdr__trigger');
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 4, width: Math.max(r.width, 14 * 2 + 1.25 * 7) });
    // Sync view to selected value (or today).
    const v = this.value();
    if (v?.from) {
      const [y, m] = v.from.split('-').map(Number);
      this.viewYear.set(y);
      this.viewMonth.set(m - 1);
    } else {
      const now = new Date();
      this.viewYear.set(now.getFullYear());
      this.viewMonth.set(now.getMonth());
    }
    this.pendingFrom.set('');
    this.open.set(true);
    // R6: move focus into the calendar once rendered (from → today → first).
    const focus = v?.from || todayIsoUtil();
    setTimeout(() => {
      const grid = this.hostEl.nativeElement.querySelector<HTMLElement>('.dsdr__days');
      const days = grid ? Array.from(grid.querySelectorAll<HTMLButtonElement>('.dsdr__day:not(.dsdr__day--blank):not(:disabled)')) : [];
      const target = days.find((el) => el.getAttribute('aria-label') === this.fullDate(focus)) ?? days[0];
      target?.focus();
    }, 0);
  }

  protected close(): void {
    this.open.set(false);
    this.pendingFrom.set('');
  }

  protected month(delta: number): void {
    let m = this.viewMonth() + delta;
    let y = this.viewYear();
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.pendingFrom.set('');
    this.valueChange.emit({ from: '', to: '' });
  }
}