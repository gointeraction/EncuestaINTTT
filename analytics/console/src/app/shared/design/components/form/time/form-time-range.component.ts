import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsFormTimeRangeState = 'default' | 'error' | 'success';

export interface DsFormTimeRangeValue {
  from: string; // HH:MM
  to: string;   // HH:MM
}

interface DsFormTimeRangePanelPos {
  left: number;
  top: number;
  width: number;
}

/**
 * ds-form-time-range — time range picker (standalone + OnPush).
 * Two scrollable hour lists (from / to) side by side with order validation:
 * the "to" list only offers times >= "from". Value is { from, to } 'HH:MM';
 * emits valueChange with the new range (fields '' when unset). Token-driven.
 */
@Component({
  selector: 'ds-form-time-range',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dstr-surface]': 'surface() || null',
    '[style.--dstr-color]': 'textColor() || null',
    '[style.--dstr-active-color]': 'activeColor() || null',
    '[class.ds-form-time-range--error]': "state() === 'error'",
    '[class.ds-form-time-range--success]': "state() === 'success'",
  },
  template: `
    <div class="dstr" [attr.data-time-range]="name()">
      @if (label(); as l) {
        <label class="dstr__label" [attr.for]="id()">{{ l }}</label>
      }
      <div class="dstr__control">
      <button type="button"
              class="dstr__trigger"
              [disabled]="disabled()"
              [id]="id()"
              aria-haspopup="listbox"
              [attr.aria-expanded]="open()"
              (click)="toggle()">
        <ds-icon class="dstr__clock-icon" name="clock" size="sm"/>
        <span class="dstr__value" [class.dstr__placeholder]="!value()?.from">
          {{ displayValue() || placeholder() }}
        </span>
        <ds-icon class="dstr__chevron" name="chevron-down" size="sm"/>
      </button>
      @if (clearable() && value()?.from) {
        <button type="button" class="dstr__clear" (click)="clear($event)" aria-label="Clear">
          <ds-icon name="x" size="xs"/>
        </button>
      }
    </div>
      @if (state() === 'error' && message(); as m) {
        <p class="dstr__message dstr__message--error">{{ m }}</p>
      } @else if (hint(); as h) {
        <p class="dstr__message dstr__message--hint">{{ h }}</p>
      }
    </div>

    @if (open()) {
      <div class="dstr__backdrop" (mousedown)="close()"></div>
      <div class="dstr__panel" role="listbox"
           [style.left.px]="pos()?.left"
           [style.top.px]="pos()?.top"
           [style.width.px]="pos()?.width">
        <div class="dstr__columns">
          <div class="dstr__column">
            <div class="dstr__column-title" [id]="fromListboxId + '-title'">From</div>
            <div class="dstr__list" role="listbox"
                 [id]="fromListboxId"
                 [attr.aria-labelledby]="fromListboxId + '-title'"
                 (keydown)="onListKeydown($event)">
              @for (t of fromTimes(); track t; let i = $index) {
                <button type="button"
                        class="dstr__option"
                        [class.dstr__option--selected]="t === value()?.from"
                        [id]="fromOptionId(i)"
                        role="option"
                        [attr.aria-selected]="t === value()?.from"
                        (click)="pickFrom(t)">{{ t }}</button>
              }
            </div>
          </div>
          <div class="dstr__column">
            <div class="dstr__column-title" [id]="toListboxId + '-title'">To</div>
            <div class="dstr__list" role="listbox"
                 [id]="toListboxId"
                 [attr.aria-labelledby]="toListboxId + '-title'"
                 (keydown)="onListKeydown($event)">
              @for (t of toTimes(); track t; let i = $index) {
                <button type="button"
                        class="dstr__option"
                        [class.dstr__option--selected]="t === value()?.to"
                        [class.dstr__option--disabled]="toDisabled(t)"
                        [id]="toOptionId(i)"
                        role="option"
                        [attr.aria-selected]="t === value()?.to"
                        [attr.aria-disabled]="toDisabled(t) || null"
                        [disabled]="toDisabled(t)"
                        (click)="pickTo(t)">{{ t }}</button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --dstr-surface: var(--ds-form-input-bg);
      --dstr-color: var(--ds-form-input-bg-on);
      --dstr-active-color: var(--ds-color-brand-primary);
      --dstr-border: var(--ds-form-input-border);
      --dstr-border-focus: var(--ds-form-input-border-focus);
    }
    .dstr { display: flex; flex-direction: column; gap: var(--ds-gap-sm); }
    .dstr__control { position: relative; }
    .dstr__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .dstr__trigger {
      display: flex; align-items: center; gap: var(--ds-space-2); justify-content: space-between;
      width: 100%; height: var(--ds-size-11);
      padding: 0 var(--ds-space-5) 0 var(--ds-space-3);
      background: var(--dstr-surface); color: var(--dstr-color);
      border: 1px solid var(--dstr-border); border-radius: var(--ds-form-radius-standard);
      font-size: var(--ds-text-input); text-align: left; cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .dstr__trigger:hover:not([disabled]) { border-color: var(--ds-form-input-border-hover); }
    .dstr__trigger:focus-visible {
      border-color: var(--dstr-border-focus);
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--dstr-border-focus) 25%, transparent);
      outline: none;
    }
    .dstr__trigger[disabled] { background: var(--ds-form-input-bg-disabled); color: var(--ds-form-input-bg-disabled-on); cursor: not-allowed; }
    .dstr__clock-icon { color: var(--ds-text-muted); }
    .dstr__value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dstr__placeholder { color: var(--ds-form-placeholder); }
    .dstr__clear {
      display: inline-flex; align-items: center; justify-content: center;
      position: absolute; right: var(--ds-size-5);
      top: 50%; transform: translateY(-50%);
      width: var(--ds-size-5); height: var(--ds-size-5); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-full);
    }
    .dstr__clear:hover { color: var(--dstr-active-color); background: var(--ds-surface-hover); }
    .dstr__chevron { color: var(--ds-text-muted); }
    .dstr__message { font-size: var(--ds-text-caption); }
    .dstr__message--hint { color: var(--ds-text-muted); }
    .dstr__message--error { color: var(--ds-status-danger); }
    :host(.ds-form-time-range--error) .dstr__label { color: var(--ds-status-danger); }
    :host(.ds-form-time-range--success) .dstr__label { color: var(--ds-status-success); }

    .dstr__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-overlay); background: transparent; }
    .dstr__panel {
      position: fixed; z-index: calc(var(--ds-z-overlay) + 1);
      background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-md);
      box-shadow: var(--ds-shadow-lg);
    }
    .dstr__columns { display: flex; gap: var(--ds-space-3); padding: var(--ds-space-2); }
    .dstr__column { display: flex; flex-direction: column; gap: var(--ds-space-1); width: var(--ds-size-24); }
    .dstr__column-title { font-size: var(--ds-text-caption); color: var(--ds-text-muted); font-weight: var(--ds-font-weight-medium); text-align: center; }
    .dstr__list { height: 14rem; overflow-y: auto; }
    .dstr__option {
      display: block; width: 100%; padding: var(--ds-space-1) var(--ds-space-2);
      border: none; background: transparent; color: var(--ds-surface-elevated-on);
      font-size: var(--ds-text-small); text-align: center; cursor: pointer;
    }
    .dstr__option:hover:not(.dstr__option--disabled) { background: var(--ds-surface-hover); }
    .dstr__option--selected { color: var(--dstr-active-color); font-weight: var(--ds-font-weight-medium); background: var(--ds-surface-active); }
    .dstr__option--disabled { opacity: 0.4; cursor: not-allowed; }
  `,
})
export class DsFormTimeRangeComponent {
  readonly name = input('');
  readonly id = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly message = input('');
  readonly state = input<DsFormTimeRangeState>('default');
  readonly value = input<DsFormTimeRangeValue | null>(null);
  readonly placeholder = input('Select time range');
  readonly step = input<number>(30);
  readonly clearable = input(false);
  readonly disabled = input(false);
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly valueChange = output<DsFormTimeRangeValue>();

  /** Stable per-instance ARIA ids (two listboxes: from / to). */
  private static uidCounter = 0;
  private readonly uid = `dstr-${++DsFormTimeRangeComponent.uidCounter}`;
  protected readonly fromListboxId = `dstr-listbox-from-${this.uid}`;
  protected readonly toListboxId = `dstr-listbox-to-${this.uid}`;

  protected readonly open = signal(false);
  protected readonly pos = signal<DsFormTimeRangePanelPos | null>(null);

  protected fromOptionId(index: number): string {
    return `dstr-opt-from-${this.uid}-${index}`;
  }

  protected toOptionId(index: number): string {
    return `dstr-opt-to-${this.uid}-${index}`;
  }

  /** Arrow/Home/End keyboard navigation within one time column (R6). */
  protected onListKeydown(event: KeyboardEvent): void {
    const list = event.currentTarget as HTMLElement;
    const options = Array.from(list.querySelectorAll<HTMLButtonElement>('.dstr__option:not(:disabled)'));
    if (!options.length) return;
    const current = document.activeElement;
    const idx = options.indexOf(current as HTMLButtonElement);
    const moveTo = (el: HTMLButtonElement | undefined): void => {
      if (!el) return;
      event.preventDefault();
      el.focus();
    };
    switch (event.key) {
      case 'ArrowDown': moveTo(options[idx + 1]); break;
      case 'ArrowUp': moveTo(options[idx - 1]); break;
      case 'Home': moveTo(options[0]); break;
      case 'End': moveTo(options[options.length - 1]); break;
    }
  }

  /** All selectable times at the configured minute step. */
  protected readonly allTimes = computed(() => {
    const step = Math.max(1, Math.min(60, this.step()));
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += step) {
        out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return out;
  });

  /** From list: everything except the last slot (need room for an end). */
  protected readonly fromTimes = computed(() => this.allTimes().slice(0, -1));

  /** To list: times >= selected "from" (keeps from <= to). */
  protected readonly toTimes = computed(() => {
    const from = this.value()?.from || '';
    return this.allTimes().filter((t) => t >= from);
  });

  protected readonly displayValue = computed(() => {
    const v = this.value();
    if (!v?.from && !v?.to) return '';
    return v.from ? `${v.from} – ${v.to || '…'}` : '';
  });

  protected toDisabled(t: string): boolean {
    const from = this.value()?.from || '';
    return from !== '' && t < from;
  }

  constructor(private readonly hostEl: ElementRef<HTMLElement>) {}

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    const triggerEl = this.hostEl.nativeElement.querySelector('.dstr__trigger');
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 4, width: r.width });
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected pickFrom(t: string): void {
    const v = this.value();
    const to = v?.to && v.to >= t ? v.to : '';
    this.valueChange.emit({ from: t, to });
  }

  protected pickTo(t: string): void {
    if (this.toDisabled(t)) return;
    this.valueChange.emit({ from: this.value()?.from || '', to: t });
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.valueChange.emit({ from: '', to: '' });
  }
}