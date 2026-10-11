import { Component, input, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption { label: string; value: string; options: { label: string; value: string }[]; }

/**
 * DsFilterBar — Search + select filters + active chips.
 *
 * Usage:
 *   <ds-filter-bar [(search)]="query" [filters]="filters" />
 */
@Component({
  selector: 'ds-filter-bar',
  standalone: true,
  imports: [FormsModule],
  host: { style: 'display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; width: 100%;' },
  template: `
    <!-- Search -->
    <div class="ds-fb-search">
      <svg class="ds-fb-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
      <input class="ds-fb-input" type="search" [placeholder]="placeholder()" [(ngModel)]="search" />
      @if (search()) {
        <button class="ds-fb-clear" (click)="search.set('')">×</button>
      }
    </div>

    <!-- Select filters -->
    @for (f of filters(); track f.value) {
      <select class="ds-select" [ngModel]="activeFilters()[f.value] || ''"
        (ngModelChange)="setFilter(f.value, $event)" [attr.data-field]="f.value + '_filter'">
        <option value="">{{ f.label }}</option>
        @for (opt of f.options; track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
    }

    <!-- Result count -->
    @if (total() >= 0) {
      <span class="ds-fb-count" data-field="filter_count">{{ total() }} items</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; width: 100%; }

    .ds-fb-search { position: relative; flex: 1; min-width: 160px; max-width: 320px; }
    .ds-fb-search-icon { position: absolute; left: 0.625rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--ds-text-muted); pointer-events: none; }
    .ds-fb-input { width: 100%; padding: 0.5rem 2rem 0.5rem 2rem; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-bg-field); color: var(--ds-surface-body-on); font-size: 0.875rem; font-family: var(--ds-font-sans); }
    .ds-fb-input:focus { outline: none; border-color: var(--ds-color-brand-primary); }
    .ds-fb-clear { position: absolute; right: 0.375rem; top: 50%; transform: translateY(-50%); border: none; background: none; color: var(--ds-text-muted); cursor: pointer; font-size: 14px; padding: 2px 4px; }
    .ds-fb-count { font-size: 0.75rem; color: var(--ds-text-muted); white-space: nowrap; margin-left: auto; }
  `
})
export class DsFilterBarComponent {
  readonly search = model('');
  readonly placeholder = input('Search...');
  readonly total = input(-1);
  readonly filters = input<FilterOption[]>([]);
  readonly activeFilters = model<Record<string, string>>({});

  setFilter(key: string, value: string): void {
    this.activeFilters.update(f => value ? { ...f, [key]: value } : (() => { const { [key]: _, ...rest } = f; return rest; })());
  }
}
