import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../icon/icon.component';

export type DsRecentTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface DsRecentItem {
  /** Optional stable id — used as the @for track key (falls back to index). */
  id?: string;
  icon: string;
  title: string;
  subtitle?: string;
  timeAgo?: string;
  author?: string;
  tone?: DsRecentTone;
}

const TONE_BG: Record<DsRecentTone, string> = {
  info: 'var(--ds-color-state-info-100)',
  success: 'var(--ds-color-state-success-100)',
  warning: 'var(--ds-color-state-warning-100)',
  danger: 'var(--ds-color-state-danger-100)',
  neutral: 'var(--ds-color-state-locked-100)',
};
const TONE_FG: Record<DsRecentTone, string> = {
  info: 'var(--ds-color-state-info-700)',
  success: 'var(--ds-color-state-success-700)',
  warning: 'var(--ds-color-state-warning-700)',
  danger: 'var(--ds-color-state-danger-700)',
  neutral: 'var(--ds-color-state-locked-700)',
};

/**
 * ds-recent-list — dashboard list of the N (5–10) most recent records.
 * Header ("Recent X" + [header] slot + optional "View all" link) + items with
 * circular icon, title, subtitle, timeAgo and author. When `clickable`, rows
 * become buttons emitting itemClick with the item. Ported from invesmarket
 * recent-activity pattern, adapted to tokens + ds-icon.
 */
@Component({
  selector: 'ds-recent-list',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-rl' },
  template: `
    <header class="ds-rl__header">
      <div class="ds-rl__heading">
        <h3 class="ds-rl__title">{{ title() }}</h3>
        <ng-content select="[header]"/>
      </div>
      @if (viewAllLabel()) {
        <button type="button" class="ds-rl__viewall" (click)="viewAll.emit()">{{ viewAllLabel() }}</button>
      }
    </header>
    <div class="ds-rl__list">
      @for (item of items(); track item.id ?? $index) {
        @if (clickable()) {
          <button type="button" class="ds-rl__row ds-rl__row--btn" (click)="itemClick.emit(item)">
            <span class="ds-rl__icon" [style.background]="toneBg(item)" [style.color]="toneFg(item)">
              <ds-icon [name]="item.icon" size="sm"/>
            </span>
            <div class="ds-rl__main">
              <div class="ds-rl__row-title">{{ item.title }}</div>
              @if (item.subtitle) { <div class="ds-rl__subtitle">{{ item.subtitle }}</div> }
            </div>
            <div class="ds-rl__meta">
              @if (item.timeAgo) { <div class="ds-rl__time">{{ item.timeAgo }}</div> }
              @if (item.author) { <div class="ds-rl__author">{{ item.author }}</div> }
            </div>
          </button>
        } @else {
          <div class="ds-rl__row">
            <span class="ds-rl__icon" [style.background]="toneBg(item)" [style.color]="toneFg(item)">
              <ds-icon [name]="item.icon" size="sm"/>
            </span>
            <div class="ds-rl__main">
              <div class="ds-rl__row-title">{{ item.title }}</div>
              @if (item.subtitle) { <div class="ds-rl__subtitle">{{ item.subtitle }}</div> }
            </div>
            <div class="ds-rl__meta">
              @if (item.timeAgo) { <div class="ds-rl__time">{{ item.timeAgo }}</div> }
              @if (item.author) { <div class="ds-rl__author">{{ item.author }}</div> }
            </div>
          </div>
        }
      } @empty {
        <p class="ds-rl__empty">—</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex; flex-direction: column;
      background: var(--ds-component-card-bg); color: var(--ds-component-card-on);
      border: 1px solid var(--ds-component-card-border);
      border-radius: var(--ds-component-card-radius);
      box-shadow: var(--ds-component-card-shadow);
      font-family: var(--ds-font-sans);
    }
    .ds-rl__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5); flex-shrink: 0;
    }
    .ds-rl__heading { display: flex; align-items: center; gap: var(--ds-space-2); min-width: 0; }
    .ds-rl__title { font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); margin: 0; }
    .ds-rl__viewall {
      font-size: var(--ds-text-caption); color: var(--ds-color-brand-primary);
      background: none; border: none; cursor: pointer; padding: 0; flex-shrink: 0;
    }
    .ds-rl__viewall:hover { text-decoration: underline; }
    .ds-rl__list { flex: 1; padding: 0 var(--ds-space-5) var(--ds-space-4); }
    .ds-rl__row { display: flex; align-items: flex-start; gap: var(--ds-space-3); padding: var(--ds-space-2) 0; }
    .ds-rl__row--btn {
      width: 100%; text-align: left; font-family: inherit; cursor: pointer;
      background: transparent; border: none; border-radius: var(--ds-radius-md);
      transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
    }
    .ds-rl__row--btn:hover { background: var(--ds-surface-hover); }
    .ds-rl__icon {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7);
      border-radius: var(--ds-radius-full); flex-shrink: 0;
    }
    .ds-rl__main { flex: 1; min-width: 0; }
    .ds-rl__row-title { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-medium); color: var(--ds-component-card-on); }
    .ds-rl__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-rl__meta { text-align: right; flex-shrink: 0; }
    .ds-rl__time, .ds-rl__author { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-rl__empty { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; padding: var(--ds-space-4) 0; }
  `,
})
export class DsRecentListComponent {
  readonly title = input.required<string>();
  readonly items = input.required<DsRecentItem[]>();
  readonly viewAllLabel = input('View all');
  /** When true, rows render as buttons and emit itemClick on press. */
  readonly clickable = input(false);

  readonly viewAll = output();
  readonly itemClick = output<DsRecentItem>();

  protected toneBg(item: DsRecentItem): string {
    return TONE_BG[(item.tone ?? 'neutral')];
  }
  protected toneFg(item: DsRecentItem): string {
    return TONE_FG[(item.tone ?? 'neutral')];
  }
}