import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsFormTimeState = 'default' | 'error' | 'success';

interface DsFormTimePanelPos {
  left: number;
  top: number;
  width: number;
}

/**
 * ds-form-time — time picker (standalone + OnPush).
 * Token-driven (--dst-*). Fixed-position panel below the trigger (ds-modal
 * pattern, no overflow clipping). Value is an ISO 'HH:MM' (24h) string;
 * emits valueChange with the new time (or '' on clear). Step controls the
 * minute granularity (default 30 → 00, 30, on the hour marks).
 */
@Component({
  selector: 'ds-form-time',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dst-surface]': 'surface() || null',
    '[style.--dst-color]': 'textColor() || null',
    '[style.--dst-active-color]': 'activeColor() || null',
    '[class.ds-form-time--error]': "state() === 'error'",
    '[class.ds-form-time--success]': "state() === 'success'",
  },
  template: `
    <div class="dst" [attr.data-time]="name()">
      @if (label(); as l) {
        <label class="dst__label" [attr.for]="id()">{{ l }}</label>
      }
      <div class="dst__control">
      <button type="button"
              class="dst__trigger"
              [disabled]="disabled()"
              [id]="id()"
              #trigger
              role="combobox"
              aria-haspopup="listbox"
              [attr.aria-expanded]="open()"
              [attr.aria-controls]="listboxId"
              [attr.aria-activedescendant]="open() ? activeOptionId() : null"
              (click)="toggle()"
              (keydown)="onTriggerKeydown($event)">
        <ds-icon class="dst__clock-icon" name="clock" size="sm"/>
        <span class="dst__value" [class.dst__placeholder]="!value()">{{ value() || placeholder() }}</span>
        <ds-icon class="dst__chevron" name="chevron-down" size="sm"/>
      </button>
      @if (clearable() && value()) {
        <button type="button" class="dst__clear" (click)="clear($event)" aria-label="Clear">
          <ds-icon name="x" size="xs"/>
        </button>
      }
    </div>
      @if (state() === 'error' && message(); as m) {
        <p class="dst__message dst__message--error">{{ m }}</p>
      } @else if (hint(); as h) {
        <p class="dst__message dst__message--hint">{{ h }}</p>
      }
    </div>

    @if (open()) {
      <div class="dst__backdrop" (mousedown)="close()"></div>
      <div class="dst__panel" role="listbox"
           [id]="listboxId"
           [attr.aria-labelledby]="label() ? id() : null"
           [style.left.px]="pos()?.left"
           [style.top.px]="pos()?.top"
           [style.width.px]="pos()?.width">
        <div class="dst__list">
          @for (t of times(); track t; let i = $index) {
            <button type="button"
                    class="dst__option"
                    [class.dst__option--active]="i === activeIndex()"
                    [class.dst__option--selected]="t === value()"
                    [id]="optionId(i)"
                    role="option"
                    [attr.aria-selected]="t === value()"
                    (mouseenter)="activeIndex.set(i)"
                    (click)="select(t)">{{ t }}</button>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --dst-surface: var(--ds-form-input-bg);
      --dst-color: var(--ds-form-input-bg-on);
      --dst-active-color: var(--ds-color-brand-primary);
      --dst-border: var(--ds-form-input-border);
      --dst-border-focus: var(--ds-form-input-border-focus);
    }
    .dst { display: flex; flex-direction: column; gap: var(--ds-gap-sm); }
    .dst__control { position: relative; }
    .dst__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .dst__trigger {
      display: flex; align-items: center; gap: var(--ds-space-2); justify-content: space-between;
      width: 100%; height: var(--ds-size-11);
      padding: 0 var(--ds-space-5) 0 var(--ds-space-3);
      background: var(--dst-surface); color: var(--dst-color);
      border: 1px solid var(--dst-border); border-radius: var(--ds-form-radius-standard);
      font-size: var(--ds-text-input); text-align: left; cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .dst__trigger:hover:not([disabled]) { border-color: var(--ds-form-input-border-hover); }
    .dst__trigger:focus-visible {
      border-color: var(--dst-border-focus);
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--dst-border-focus) 25%, transparent);
      outline: none;
    }
    .dst__trigger[disabled] { background: var(--ds-form-input-bg-disabled); color: var(--ds-form-input-bg-disabled-on); cursor: not-allowed; }
    .dst__clock-icon { color: var(--ds-text-muted); }
    .dst__value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dst__placeholder { color: var(--ds-form-placeholder); }
    .dst__clear {
      display: inline-flex; align-items: center; justify-content: center;
      position: absolute; right: var(--ds-size-5);
      top: 50%; transform: translateY(-50%);
      width: var(--ds-size-5); height: var(--ds-size-5); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-full);
    }
    .dst__clear:hover { color: var(--dst-active-color); background: var(--ds-surface-hover); }
    .dst__chevron { color: var(--ds-text-muted); }
    .dst__message { font-size: var(--ds-text-caption); }
    .dst__message--hint { color: var(--ds-text-muted); }
    .dst__message--error { color: var(--ds-status-danger); }
    :host(.ds-form-time--error) .dst__label { color: var(--ds-status-danger); }
    :host(.ds-form-time--success) .dst__label { color: var(--ds-status-success); }

    .dst__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-overlay); background: transparent; }
    .dst__panel {
      position: fixed; z-index: calc(var(--ds-z-overlay) + 1);
      max-height: 18rem; width: 9rem;
      background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-md);
      box-shadow: var(--ds-shadow-lg);
    }
    .dst__list { overflow-y: auto; }
    .dst__option {
      display: block; width: 100%; padding: var(--ds-space-2) var(--ds-space-3);
      border: none; background: transparent; color: var(--ds-surface-elevated-on);
      font-size: var(--ds-text-small); text-align: left; cursor: pointer;
    }
    .dst__option:hover { background: var(--ds-surface-hover); }
    .dst__option--active { background: var(--ds-surface-hover); }
    .dst__option--selected { color: var(--dst-active-color); font-weight: var(--ds-font-weight-medium); }
  `,
})
export class DsFormTimeComponent {
  readonly name = input('');
  readonly id = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly message = input('');
  readonly state = input<DsFormTimeState>('default');
  readonly value = input<string>('');
  readonly placeholder = input('Select time');
  readonly step = input<number>(30);
  readonly clearable = input(false);
  readonly disabled = input(false);
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly valueChange = output<string>();

  /** Stable per-instance ARIA ids (combobox → listbox → options). */
  private static uidCounter = 0;
  private readonly uid = `dst-${++DsFormTimeComponent.uidCounter}`;
  protected readonly listboxId = `dst-listbox-${this.uid}`;

  protected readonly open = signal(false);
  protected readonly pos = signal<DsFormTimePanelPos | null>(null);
  protected readonly activeIndex = signal(-1);

  /** All selectable times (00:00 → 23:59) at the configured minute step. */
  protected readonly times = computed(() => {
    const step = Math.max(1, Math.min(60, this.step()));
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += step) {
        out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return out;
  });

  constructor(private readonly hostEl: ElementRef<HTMLElement>) {}

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    const triggerEl = this.hostEl.nativeElement.querySelector('.dst__trigger');
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 4, width: r.width });
    this.activeIndex.set(this.selectedIndex());
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  protected optionId(index: number): string {
    return `dst-opt-${this.uid}-${index}`;
  }

  protected activeOptionId(): string | null {
    const i = this.activeIndex();
    return i >= 0 ? this.optionId(i) : null;
  }

  private selectedIndex(): number {
    const i = this.times().indexOf(this.value());
    return i >= 0 ? i : 0;
  }

  protected select(t: string): void {
    this.valueChange.emit(t);
    this.close();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.valueChange.emit('');
  }

  private moveActive(delta: number): void {
    const list = this.times();
    if (!list.length) return;
    const next = (this.activeIndex() + delta + list.length) % list.length;
    this.activeIndex.set(next);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) {
          this.toggle();
          return;
        }
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        break;
      }
      case 'Home':
        if (!this.open()) return;
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        if (!this.open()) return;
        event.preventDefault();
        this.activeIndex.set(this.times().length - 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (this.open()) {
          const list = this.times();
          const a = this.activeIndex();
          if (a >= 0 && a < list.length) this.select(list[a]);
        } else {
          this.toggle();
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }
}