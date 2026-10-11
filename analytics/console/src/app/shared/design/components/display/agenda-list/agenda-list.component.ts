import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../icon/icon.component';

export interface DsAgendaItem {
  time: string;
  duration?: string;
  title: string;
  subtitle?: string;
  color?: string;
}

/**
 * ds-agenda-list — dashboard "Today's Agenda" widget.
 * Items: time + duration, colored dot, title + subtitle, chevron action.
 * Ported from invesmarket today-agenda section, adapted to tokens + ds-icon.
 */
@Component({
  selector: 'ds-agenda-list',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-ag' },
  template: `
    <header class="ds-ag__header">
      <h3 class="ds-ag__title">{{ title() }}</h3>
      <div class="ds-ag__header-actions">
        <ng-content select="[header]"/>
        @if (viewCalendarLabel()) {
          <button type="button" class="ds-ag__cal" (click)="viewCalendar.emit()">{{ viewCalendarLabel() }}</button>
        }
      </div>
    </header>
    <div class="ds-ag__list">
      @for (item of items(); track $index; let last = $last) {
        <div class="ds-ag__row" [class.ds-ag__row--last]="last">
          <div class="ds-ag__time">
            <div class="ds-ag__time-main">{{ item.time }}</div>
            @if (item.duration) { <div class="ds-ag__time-sub">{{ item.duration }}</div> }
          </div>
          <span class="ds-ag__dot" [style.background]="item.color || 'var(--ds-color-brand-primary)'"></span>
          <div class="ds-ag__main">
            <div class="ds-ag__row-title">{{ item.title }}</div>
            @if (item.subtitle) { <div class="ds-ag__row-sub">{{ item.subtitle }}</div> }
          </div>
          @if (itemClickable()) {
            <button type="button" class="ds-ag__go" (click)="itemClick.emit(item)" aria-label="Open {{ item.title }}">
              <ds-icon name="chevron-right" size="sm"/>
            </button>
          }
        </div>
      } @empty {
        <p class="ds-ag__empty">—</p>
      }
    </div>
    @if (footerLabel()) {
      <button type="button" class="ds-ag__footer" (click)="viewCalendar.emit()">
        {{ footerLabel() }}
        <ds-icon name="chevron-right" size="xs"/>
      </button>
    }
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
    .ds-ag__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5); flex-shrink: 0;
    }
    .ds-ag__title { font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); margin: 0; }
    .ds-ag__header-actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-ag__cal {
      font-size: var(--ds-text-caption); color: var(--ds-color-brand-primary);
      background: none; border: none; cursor: pointer; padding: 0;
    }
    .ds-ag__cal:hover { text-decoration: underline; }
    .ds-ag__list { flex: 1; padding: 0 var(--ds-space-5) var(--ds-space-4); }
    .ds-ag__row { display: flex; align-items: flex-start; gap: var(--ds-space-3); padding: var(--ds-space-3) 0; }
    .ds-ag__row--last { border-bottom: none; }
    .ds-ag__row:not(.ds-ag__row--last) { border-bottom: 1px solid var(--ds-border-divider); }
    .ds-ag__time { flex-shrink: 0; min-width: var(--ds-size-16); }
    .ds-ag__time-main { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); }
    .ds-ag__time-sub { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-ag__dot { width: var(--ds-size-1-5); height: var(--ds-size-1-5); border-radius: var(--ds-radius-full); margin-top: var(--ds-space-2); flex-shrink: 0; }
    .ds-ag__main { flex: 1; min-width: 0; }
    .ds-ag__row-title { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-medium); color: var(--ds-component-card-on); }
    .ds-ag__row-sub { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-ag__go {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7);
      border: none; border-radius: var(--ds-radius-md);
      background: transparent; color: var(--ds-text-muted); cursor: pointer;
      transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
      flex-shrink: 0;
    }
    .ds-ag__go:hover { background: var(--ds-surface-hover); }
    .ds-ag__empty { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; padding: var(--ds-space-4) 0; }
    .ds-ag__footer {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      font-size: var(--ds-text-caption); color: var(--ds-color-brand-primary);
      background: none; border: none; cursor: pointer;
      padding: var(--ds-space-3) var(--ds-space-5); align-self: flex-start;
    }
    .ds-ag__footer:hover { text-decoration: underline; }
  `,
})
export class DsAgendaListComponent {
  readonly title = input.required<string>();
  readonly items = input.required<DsAgendaItem[]>();
  readonly itemClickable = input(false);
  readonly viewCalendarLabel = input('');
  readonly footerLabel = input('');

  readonly itemClick = output<DsAgendaItem>();
  readonly viewCalendar = output();
}