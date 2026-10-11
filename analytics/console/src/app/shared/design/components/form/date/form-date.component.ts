import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';
import { CALENDAR_MONTHS, CALENDAR_WEEKDAYS, buildCalendarGrid, formatIso, todayIso as todayIsoUtil } from './calendar.util';

export type DsFormDateState = 'default' | 'error' | 'success';

interface DsFormDatePanelPos {
  left: number;
  top: number;
  width: number;
}

/**
 * ds-form-date — calendar date picker (standalone + OnPush).
 * Token-driven (--dsd-*). Fixed-position calendar panel below the trigger
 * (ds-modal pattern, no overflow clipping). Value is an ISO 'YYYY-MM-DD'
 * string; emits valueChange with the new ISO date (or '' on clear).
 */
@Component({
  selector: 'ds-form-date',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dsd-surface]': 'surface() || null',
    '[style.--dsd-color]': 'textColor() || null',
    '[style.--dsd-active-color]': 'activeColor() || null',
    '[class.ds-form-date--error]': "state() === 'error'",
    '[class.ds-form-date--success]': "state() === 'success'",
  },
  template: `
    <div class="dsd" [attr.data-date]="name()">
      @if (label(); as l) {
        <label class="dsd__label" [attr.for]="id()">{{ l }}</label>
      }
      <div class="dsd__control">
        <button type="button"
                class="dsd__trigger"
                [disabled]="disabled()"
                [id]="id()"
                #trigger
                aria-haspopup="dialog"
                [attr.aria-expanded]="open()"
                (click)="toggle()">
          <ds-icon class="dsd__calendar-icon" name="calendar" size="sm"/>
          <span class="dsd__value" [class.dsd__placeholder]="!value()">{{ displayValue() || placeholder() }}</span>
          <ds-icon class="dsd__chevron" name="chevron-down" size="sm"/>
        </button>
        @if (clearable() && value()) {
          <button type="button" class="dsd__clear" (click)="clear($event)" aria-label="Clear">
            <ds-icon name="x" size="xs"/>
          </button>
        }
      </div>
      @if (state() === 'error' && message(); as m) {
        <p class="dsd__message dsd__message--error">{{ m }}</p>
      } @else if (hint(); as h) {
        <p class="dsd__message dsd__message--hint">{{ h }}</p>
      }
    </div>

    @if (open()) {
      <div class="dsd__backdrop" (mousedown)="close()"></div>
      <div class="dsd__panel" role="dialog"
           [style.left.px]="pos()?.left"
           [style.top.px]="pos()?.top"
           [style.width.px]="pos()?.width">
        <div class="dsd__header">
          <button type="button" class="dsd__nav" (click)="month(-1)" aria-label="Previous month">
            <ds-icon name="chevron-left" size="sm"/>
          </button>
          <span class="dsd__title">{{ CALENDAR_MONTHS[viewMonth()] }} {{ viewYear() }}</span>
          <button type="button" class="dsd__nav" (click)="month(1)" aria-label="Next month">
            <ds-icon name="chevron-right" size="sm"/>
          </button>
        </div>
        <div class="dsd__weekdays">
          @for (w of CALENDAR_WEEKDAYS; track w) {
            <span class="dsd__weekday">{{ w }}</span>
          }
        </div>
        <div class="dsd__days" role="grid"
             [attr.aria-label]="gridLabel()"
             (keydown)="onGridKeydown($event)">
          @for (cell of grid(); track cell.key) {
            @if (cell.blank) {
              <span class="dsd__day dsd__day--blank"></span>
            } @else {
              <button type="button"
                      class="dsd__day"
                      [class.dsd__day--selected]="cell.iso === value()"
                      [class.dsd__day--today]="cell.iso === todayIso()"
                      role="gridcell"
                      [attr.aria-selected]="cell.iso === value()"
                      [attr.aria-label]="fullDate(cell.iso)"
                      [disabled]="disabledDate(cell.iso)"
                      (click)="select(cell.iso)">{{ cell.day }}</button>
            }
          }
        </div>
        <div class="dsd__footer">
          <button type="button" class="dsd__today" (click)="select(todayIso())">Today</button>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --dsd-surface: var(--ds-form-input-bg);
      --dsd-color: var(--ds-form-input-bg-on);
      --dsd-active-color: var(--ds-color-brand-primary);
      --dsd-border: var(--ds-form-input-border);
      --dsd-border-focus: var(--ds-form-input-border-focus);
    }
    .dsd { display: flex; flex-direction: column; gap: var(--ds-gap-sm); }
    .dsd__control { position: relative; }
    .dsd__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .dsd__trigger {
      display: flex; align-items: center; gap: var(--ds-space-2); justify-content: space-between;
      width: 100%; height: var(--ds-size-11);
      padding: 0 var(--ds-space-3);
      background: var(--dsd-surface); color: var(--dsd-color);
      border: 1px solid var(--dsd-border); border-radius: var(--ds-form-radius-standard);
      font-size: var(--ds-text-input); text-align: left; cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .dsd__trigger:hover:not([disabled]) { border-color: var(--ds-form-input-border-hover); }
    .dsd__trigger:focus-visible {
      border-color: var(--dsd-border-focus);
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--dsd-border-focus) 25%, transparent);
      outline: none;
    }
    .dsd__trigger[disabled] { background: var(--ds-form-input-bg-disabled); color: var(--ds-form-input-bg-disabled-on); cursor: not-allowed; }
    .dsd__calendar-icon { color: var(--ds-text-muted); }
    .dsd__value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dsd__placeholder { color: var(--ds-form-placeholder); }
    .dsd__clear {
      display: inline-flex; align-items: center; justify-content: center;
      position: absolute; right: calc(var(--ds-size-5) + var(--ds-space-1));
      top: 50%; transform: translateY(-50%);
      width: var(--ds-size-5); height: var(--ds-size-5); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-full);
    }
    .dsd__clear:hover { color: var(--dsd-active-color); background: var(--ds-surface-hover); }
    .dsd__chevron { color: var(--ds-text-muted); }
    .dsd__message { font-size: var(--ds-text-caption); }
    .dsd__message--hint { color: var(--ds-text-muted); }
    .dsd__message--error { color: var(--ds-status-danger); }
    :host(.ds-form-date--error) .dsd__label { color: var(--ds-status-danger); }
    :host(.ds-form-date--success) .dsd__label { color: var(--ds-status-success); }

    .dsd__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-overlay); background: transparent; }
    .dsd__panel {
      position: fixed; z-index: calc(var(--ds-z-overlay) + 1);
      background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-md);
      box-shadow: var(--ds-shadow-lg);
    }
    .dsd__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--ds-space-2) var(--ds-space-3);
    }
    .dsd__nav {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-md);
    }
    .dsd__nav:hover { background: var(--ds-surface-hover); color: var(--dsd-active-color); }
    .dsd__title { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-semibold); }
    .dsd__weekdays {
      display: grid; grid-template-columns: repeat(7, 1fr);
      padding: var(--ds-space-1) var(--ds-space-2);
    }
    .dsd__weekday {
      font-size: var(--ds-text-caption); color: var(--ds-text-muted);
      text-align: center; font-weight: var(--ds-font-weight-medium);
    }
    .dsd__days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
    .dsd__day {
      display: inline-flex; align-items: center; justify-content: center;
      width: 100%; aspect-ratio: 1; border: none; background: transparent;
      color: var(--ds-surface-elevated-on); font-size: var(--ds-text-small);
      cursor: pointer; border-radius: var(--ds-radius-md);
    }
    .dsd__day:hover:not(:disabled) { background: var(--ds-surface-hover); }
    .dsd__day--today { box-shadow: inset 0 0 0 1px var(--dsd-active-color); }
    .dsd__day--selected { background: var(--dsd-active-color); color: var(--ds-color-white); font-weight: var(--ds-font-weight-semibold); }
    .dsd__day--blank { visibility: hidden; }
    .dsd__day:disabled { opacity: 0.35; cursor: not-allowed; }
    .dsd__footer { display: flex; justify-content: flex-end; padding: var(--ds-space-1) var(--ds-space-3); }
    .dsd__today {
      border: none; background: transparent; color: var(--dsd-active-color);
      font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-medium);
      cursor: pointer; border-radius: var(--ds-radius-sm);
    }
    .dsd__today:hover { background: var(--ds-surface-hover); }
  `,
})
export class DsFormDateComponent {
  readonly name = input('');
  readonly id = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly message = input('');
  readonly state = input<DsFormDateState>('default');
  readonly value = input<string>('');
  readonly placeholder = input('Select date');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly clearable = input(false);
  readonly disabled = input(false);
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly valueChange = output<string>();

  /** Template-exposed calendar constants + helpers. */
  protected readonly CALENDAR_MONTHS = CALENDAR_MONTHS;
  protected readonly CALENDAR_WEEKDAYS = CALENDAR_WEEKDAYS;

  protected readonly open = signal(false);
  protected readonly pos = signal<DsFormDatePanelPos | null>(null);
  protected readonly viewMonth = signal(0);
  protected readonly viewYear = signal(0);

  /** Grid cells for the currently viewed month (blank fillers + day cells). */
  protected readonly grid = computed(() => buildCalendarGrid(this.viewYear(), this.viewMonth()));

  protected readonly displayValue = computed(() => formatIso(this.value()));

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
    const triggerEl = this.hostEl.nativeElement.querySelector('.dsd__trigger');
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 4, width: Math.max(r.width, 16 * 7) });
    // Sync view to selected value (or today).
    const v = this.value();
    if (v) {
      const [y, m] = v.split('-').map(Number);
      this.viewYear.set(y);
      this.viewMonth.set(m - 1);
    } else {
      const now = new Date();
      this.viewYear.set(now.getFullYear());
      this.viewMonth.set(now.getMonth());
    }
    this.open.set(true);
    // R6: move focus into the calendar once rendered (selected → today → first).
    const focus = this.value() || todayIsoUtil();
    setTimeout(() => this.focusDate(focus), 0);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected todayIso(): string {
    return todayIsoUtil();
  }

  /** Full readable date for gridcell labels, e.g. "12 September 2026". */
  protected fullDate(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${CALENDAR_MONTHS[m - 1]} ${y}`;
  }

  /** Readable label for the month grid (announced by screen readers), e.g. "September 2026". */
  protected gridLabel(): string {
    return `${CALENDAR_MONTHS[this.viewMonth()]} ${this.viewYear()}`;
  }

  protected month(delta: number): void {
    let m = this.viewMonth() + delta;
    let y = this.viewYear();
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  /** Focus the day button whose ISO matches (selected → today → first enabled). */
  protected focusDate(iso: string): void {
    const root = this.hostEl.nativeElement;
    const grid = root.querySelector<HTMLElement>('.dsd__days');
    if (!grid) return;
    const days = Array.from(grid.querySelectorAll<HTMLButtonElement>('.dsd__day:not(.dsd__day--blank):not(:disabled)'));
    const target = days.find((el) => el.getAttribute('aria-label') === this.fullDate(iso)) ?? days[0];
    target?.focus();
  }

  /**
   * Grid keyboard navigation (R6 — ARIA grid pattern):
   * Left/Right = day, Up/Down = week, PageUp/PageDown = month, Home/End = first/last day.
   */
  protected onGridKeydown(event: KeyboardEvent): void {
    const current = event.target as HTMLButtonElement | null;
    const grid = event.currentTarget as HTMLElement;
    if (!current) return;
    const days = Array.from(grid.querySelectorAll<HTMLButtonElement>('.dsd__day:not(.dsd__day--blank):not(:disabled)'));
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
      case 'PageUp': event.preventDefault(); this.month(-1); break;
      case 'PageDown': event.preventDefault(); this.month(1); break;
    }
  }

  protected disabledDate(iso: string): boolean {
    const min = this.min();
    const max = this.max();
    return (min !== '' && iso < min) || (max !== '' && iso > max);
  }

  protected select(iso: string): void {
    if (this.disabledDate(iso)) return;
    this.valueChange.emit(iso);
    this.close();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.valueChange.emit('');
  }
}