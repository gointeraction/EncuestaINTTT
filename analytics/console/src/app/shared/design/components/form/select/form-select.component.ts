import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsFormSelectState = 'default' | 'neutral' | 'error' | 'success';

export interface DsFormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DsFormSelectPanelPos {
  left: number;
  top: number;
  width: number;
}

/**
 * ds-form-select — searchable dropdown select (standalone + OnPush).
 * Token-driven (--dss-*). Opens a fixed-position panel below the trigger
 * (same pattern as ds-modal: no overflow clipping inside modals/cards);
 * a fixed transparent backdrop closes it on outside click.
 * Value is an option value string; emits valueChange with the new value.
 *
 * A11y (R6 — keyboard + ARIA combobox): the trigger acts as a `combobox` with
 * `aria-controls`/`aria-activedescendant`; options expose `role=option` +
 * `aria-selected`. Keyboard: ArrowDown/ArrowUp/Home/End navigate the active
 * option, Enter/Space selects, Escape closes. When `searchable`, the search
 * input receives focus on open and carries the same combobox semantics.
 */
@Component({
  selector: 'ds-form-select',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dss-surface]': 'surface() || null',
    '[style.--dss-color]': 'textColor() || null',
    '[style.--dss-active-color]': 'activeColor() || null',
    '[class.ds-form-select--error]': "state() === 'error'",
    '[class.ds-form-select--success]': "state() === 'success'",
    '[class.ds-form-select--neutral]': "state() === 'neutral'",
  },
  template: `
    <div class="dss" [attr.data-select]="name()">
      @if (label(); as l) {
        <label class="dss__label" [attr.for]="id()">{{ l }}</label>
      }
      <div class="dss__control">
        <button type="button"
                class="dss__trigger"
                [disabled]="disabled() || state() === 'neutral'"
                [id]="id()"
                #trigger
                role="combobox"
                aria-haspopup="listbox"
                [attr.aria-expanded]="open()"
                [attr.aria-controls]="listboxId"
                [attr.aria-activedescendant]="open() ? activeOptionId() : null"
                (click)="toggle()"
                (keydown)="onTriggerKeydown($event)">
          <span class="dss__value" [class.dss__placeholder]="!selectedLabel()">{{ selectedLabel() || placeholder() }}</span>
          <ds-icon class="dss__chevron" name="chevron-down" size="sm"/>
        </button>
        @if (clearable() && value()) {
          <button type="button" class="dss__clear" (click)="clear($event)" aria-label="Clear">
            <ds-icon name="x" size="xs"/>
          </button>
        }
      </div>
      @if (state() === 'error' && message(); as m) {
        <p class="dss__message dss__message--error">{{ m }}</p>
      } @else if (hint(); as h) {
        <p class="dss__message dss__message--hint">{{ h }}</p>
      }
    </div>

    @if (open()) {
      <div class="dss__backdrop" (mousedown)="close()"></div>
      <div class="dss__panel"
           [id]="listboxId"
           role="listbox"
           [attr.aria-labelledby]="label() ? id() : null"
           [style.left.px]="pos()?.left"
           [style.top.px]="pos()?.top"
           [style.width.px]="pos()?.width">
        @if (searchable()) {
          <div class="dss__search">
            <ds-icon name="search" size="sm"/>
            <input type="text"
                   #searchInput
                   role="combobox"
                   aria-haspopup="listbox"
                   [attr.aria-expanded]="true"
                   [attr.aria-controls]="listboxId"
                   [attr.aria-activedescendant]="activeOptionId() ?? undefined"
                   [value]="query()"
                   aria-label="Search options"
                   placeholder="Search…"
                   (input)="onQuery($event)"
                   (keydown)="onSearchKeydown($event)"/>
          </div>
        }
        <div class="dss__list">
          @for (opt of filteredOptions(); track opt.value; let i = $index) {
            <button type="button"
                    class="dss__option"
                    [class.dss__option--active]="i === activeIndex()"
                    [class.dss__option--selected]="opt.value === value()"
                    [class.dss__option--disabled]="opt.disabled"
                    [id]="optionId(i)"
                    role="option"
                    [attr.aria-selected]="opt.value === value()"
                    [attr.aria-disabled]="opt.disabled || null"
                    [disabled]="opt.disabled ?? false"
                    (mouseenter)="activeIndex.set(i)"
                    (click)="select(opt)">
              {{ opt.label }}
              @if (opt.value === value()) {
                <ds-icon class="dss__check" name="check" size="sm"/>
              }
            </button>
          }
          @if (filteredOptions().length === 0) {
            <p class="dss__empty">No results</p>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --dss-surface: var(--ds-form-input-bg);
      --dss-color: var(--ds-form-input-bg-on);
      --dss-active-color: var(--ds-color-brand-primary);
      --dss-border: var(--ds-form-input-border);
      --dss-border-focus: var(--ds-form-input-border-focus);
    }
    .dss { display: flex; flex-direction: column; gap: var(--ds-gap-sm); }
    .dss__control { position: relative; }
    .dss__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .dss__trigger {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; height: var(--ds-size-11);
      padding: 0 var(--ds-space-3);
      background: var(--dss-surface); color: var(--dss-color);
      border: 1px solid var(--dss-border); border-radius: var(--ds-form-radius-standard);
      font-size: var(--ds-text-input); text-align: left; cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .dss__trigger:hover:not([disabled]) { border-color: var(--ds-form-input-border-hover); }
    .dss__trigger:focus-visible {
      border-color: var(--dss-border-focus);
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--dss-border-focus) 25%, transparent);
      outline: none;
    }
    .dss__trigger[disabled] { background: var(--ds-form-input-bg-disabled); color: var(--ds-form-input-bg-disabled-on); cursor: not-allowed; }
    .dss__value {
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .dss__placeholder { color: var(--ds-form-placeholder); }
    .dss__clear {
      display: inline-flex; align-items: center; justify-content: center;
      position: absolute; right: calc(var(--ds-size-5) + var(--ds-space-1));
      top: 50%; transform: translateY(-50%);
      width: var(--ds-size-5); height: var(--ds-size-5); border: none; background: transparent;
      color: var(--ds-text-muted); cursor: pointer; border-radius: var(--ds-radius-full);
    }
    .dss__clear:hover { color: var(--dss-active-color); background: var(--ds-surface-hover); }
    .dss__chevron { color: var(--ds-text-muted); transition: transform 0.15s ease; }
    .dss__message { font-size: var(--ds-text-caption); }
    .dss__message--hint { color: var(--ds-text-muted); }
    .dss__message--error { color: var(--ds-status-danger); }
    :host(.ds-form-select--error) .dss__label { color: var(--ds-status-danger); }
    :host(.ds-form-select--error) { --dss-border: var(--ds-form-input-border-invalid); }
    :host(.ds-form-select--success) .dss__label { color: var(--ds-status-success); }
    :host(.ds-form-select--success) { --dss-border: var(--ds-form-input-border-success); }
    :host(.ds-form-select--neutral) .dss__label { color: var(--ds-status-neutral); }
    :host(.ds-form-select--neutral) { --dss-border: var(--ds-form-input-border-neutral); }
    :host(.ds-form-select--neutral) .dss__trigger { background: var(--ds-form-input-bg-disabled); color: var(--ds-form-input-bg-disabled-on); cursor: not-allowed; }

    .dss__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-overlay); background: transparent; }
    .dss__panel {
      position: fixed; z-index: calc(var(--ds-z-overlay) + 1);
      max-height: 18rem;
      background: var(--ds-surface-elevated); color: var(--ds-surface-elevated-on);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-md);
      box-shadow: var(--ds-shadow-lg);
    }
    .dss__search {
      display: flex; align-items: center; gap: var(--ds-space-2);
      padding: 0 var(--ds-space-2); margin: var(--ds-space-2);
      border: 1px solid var(--ds-form-input-border); border-radius: var(--ds-form-radius-sm);
    }
    .dss__search input {
      flex: 1; min-width: 0; border: none; background: transparent;
      font-size: var(--ds-text-small); color: var(--ds-surface-elevated-on);
    }
    /* R5: visible focus on the search input — ring via :focus-within,
       never a bare outline:none. */
    .dss__search:focus-within { box-shadow: var(--ds-shadow-focus); }
    .dss__list { overflow-y: auto; }
    .dss__option {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: var(--ds-space-2) var(--ds-space-3);
      border: none; background: transparent; color: var(--ds-surface-elevated-on);
      font-size: var(--ds-text-small); text-align: left; cursor: pointer;
    }
    .dss__option:hover:not(.dss__option--disabled) { background: var(--ds-surface-hover); }
    .dss__option--active:not(.dss__option--disabled) { background: var(--ds-surface-hover); }
    .dss__option--selected { color: var(--dss-active-color); font-weight: var(--ds-font-weight-medium); }
    .dss__option--disabled { opacity: 0.45; cursor: not-allowed; }
    .dss__check { color: var(--dss-active-color); }
    .dss__empty { padding: var(--ds-space-4); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
  `,
})
export class DsFormSelectComponent {
  readonly name = input('');
  readonly id = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly message = input('');
  readonly state = input<DsFormSelectState>('default');
  readonly items = input<Array<string | DsFormSelectOption>>([]);
  readonly value = input<string>('');
  readonly placeholder = input('Select an option');
  readonly searchable = input(false);
  readonly clearable = input(false);
  readonly disabled = input(false);
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly valueChange = output<string>();

  /** Stable per-instance ids for ARIA (combobox → listbox → options). */
  private static uidCounter = 0;
  private readonly uid = `dss-${++DsFormSelectComponent.uidCounter}`;
  protected readonly listboxId = `dss-listbox-${this.uid}`;

  constructor(private readonly hostEl: ElementRef<HTMLElement>) {}

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly pos = signal<DsFormSelectPanelPos | null>(null);
  protected readonly activeIndex = signal(-1);

  protected readonly normalizedOptions = computed(() =>
    this.items().map((it) =>
      typeof it === 'string' ? { value: it, label: it } : it,
    ),
  );

  protected readonly selectedLabel = computed(() =>
    this.normalizedOptions().find((o) => o.value === this.value())?.label ?? '',
  );

  protected readonly filteredOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.normalizedOptions();
    return this.normalizedOptions().filter((o) => o.label.toLowerCase().includes(q));
  });

  protected optionId(index: number): string {
    return `dss-opt-${this.uid}-${index}`;
  }

  protected activeOptionId(): string | null {
    const i = this.activeIndex();
    if (i < 0) return null;
    return this.optionId(i);
  }

  private selectedIndex(options: DsFormSelectOption[]): number {
    const i = options.findIndex((o) => o.value === this.value());
    return i >= 0 ? i : 0;
  }

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
      return;
    }
    this.openPanel();
  }

  private openPanel(): void {
    const triggerEl = this.hostEl.nativeElement.querySelector('.dss__trigger');
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 4, width: r.width });
    this.activeIndex.set(this.selectedIndex(this.filteredOptions()));
    this.open.set(true);
    if (this.searchable()) {
      // Focus the search field once the panel renders (R6: combobox focus).
      setTimeout(() => this.hostEl.nativeElement.querySelector<HTMLInputElement>('.dss__search input')?.focus(), 0);
    }
  }

  protected close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.query.set('');
    this.valueChange.emit('');
  }

  protected select(opt: DsFormSelectOption): void {
    if (opt.disabled) return;
    this.query.set('');
    this.valueChange.emit(opt.value);
    this.close();
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
  }

  /** Move the active option by delta (skipping disabled), returns new index. */
  private moveActive(delta: number): void {
    const opts = this.filteredOptions();
    const len = opts.length;
    if (!len) return;
    let next = this.activeIndex();
    for (let step = 0; step < len; step++) {
      next = (next + delta + len) % len;
      if (!opts[next].disabled) break;
    }
    if (opts[next] && !opts[next].disabled) this.activeIndex.set(next);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) {
          this.openPanel();
          return;
        }
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        break;
      }
      case 'Home': {
        if (!this.open()) return;
        event.preventDefault();
        const first = this.filteredOptions().findIndex((o) => !o.disabled);
        if (first >= 0) this.activeIndex.set(first);
        break;
      }
      case 'End': {
        if (!this.open()) return;
        event.preventDefault();
        const opts = this.filteredOptions();
        for (let i = opts.length - 1; i >= 0; i--) {
          if (!opts[i].disabled) {
            this.activeIndex.set(i);
            break;
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (this.open()) {
          const opts = this.filteredOptions();
          const a = this.activeIndex();
          if (a >= 0 && a < opts.length && !opts[a].disabled) this.select(opts[a]);
        } else {
          this.openPanel();
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const opts = this.filteredOptions();
        const a = this.activeIndex();
        if (a >= 0 && a < opts.length && !opts[a].disabled) this.select(opts[a]);
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }
}
