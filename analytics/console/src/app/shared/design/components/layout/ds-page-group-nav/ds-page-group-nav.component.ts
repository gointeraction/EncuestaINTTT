import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

export interface PageGroupConfig {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'ds-page-group-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { style: 'display: block; width: 100%;' },
  template: `
    <div class="ds-pgn">
      <select class="ds-pgn-select" [value]="activeGroup()" (change)="onSelect($event)">
        @for (g of groups(); track g.id) {
          <option [value]="g.id">{{ g.label }}</option>
        }
      </select>

      <div class="ds-pgn-arrows">
        <button class="ds-pgn-btn" (click)="prev()" [disabled]="!hasPrev()" aria-label="Previous group">
          <svg class="ds-pgn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <span class="ds-pgn-indicator">{{ currentIndex() + 1 }} / {{ groups().length }}</span>
        <button class="ds-pgn-btn" (click)="next()" [disabled]="!hasNext()" aria-label="Next group">
          <svg class="ds-pgn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .ds-pgn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--ds-border-subtle, var(--ds-color-design-neutral-200));
    }

    .ds-pgn-select {
      flex: 1;
      min-width: 0;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border: 1px solid var(--ds-border-input, var(--ds-color-design-neutral-300));
      border-radius: var(--ds-radius-standard, 6px);
      background: var(--ds-bg-field, #fff);
      color: var(--ds-text-body, var(--ds-color-design-neutral-800));
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--ds-font-sans, inherit);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      cursor: pointer;
    }

    .ds-pgn-select:focus {
      outline: none;
      border-color: var(--ds-color-brand-primary, var(--ds-color-brand-primary-800));
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--ds-color-black) 15%, transparent);
    }

    .ds-pgn-arrows {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .ds-pgn-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 1px solid var(--ds-border-subtle, var(--ds-color-design-neutral-200));
      border-radius: var(--ds-radius-standard, 6px);
      background: var(--ds-surface-card, #fff);
      color: var(--ds-text-body, var(--ds-color-design-neutral-800));
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      padding: 0;
    }

    .ds-pgn-btn:hover:not(:disabled) {
      background: var(--ds-bg-field, var(--ds-surface-muted));
      border-color: var(--ds-color-brand-primary, var(--ds-color-brand-primary-800));
    }

    .ds-pgn-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .ds-pgn-chevron {
      width: 14px;
      height: 14px;
    }

    .ds-pgn-indicator {
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--ds-text-muted, var(--ds-text-muted));
      min-width: 32px;
      text-align: center;
      user-select: none;
    }
  `,
})
export class DsPageGroupNavComponent {
  readonly groups = input.required<PageGroupConfig[]>();
  readonly activeGroup = input.required<string>();
  readonly activeGroupChange = output<string>();

  readonly currentIndex = computed(() => this.groups().findIndex(g => g.id === this.activeGroup()));

  readonly hasPrev = computed(() => this.currentIndex() > 0);

  readonly hasNext = computed(() => this.currentIndex() < this.groups().length - 1);

  onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.activeGroupChange.emit(value);
  }

  prev(): void {
    this.navigate(-1);
  }

  next(): void {
    this.navigate(1);
  }

  private navigate(dir: number): void {
    const idx = this.currentIndex() + dir;
    if (idx >= 0 && idx < this.groups().length) {
      this.activeGroupChange.emit(this.groups()[idx].id);
    }
  }
}