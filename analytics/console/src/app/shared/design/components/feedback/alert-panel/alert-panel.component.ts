import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsAlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface DsAlertItem {
  id: string;
  tone: DsAlertTone;
  title: string;
  message?: string;
  timestamp?: string;
  icon?: string;
  actionLabel?: string;
  dismissible?: boolean;
}

const TONE_COLOR: Record<DsAlertTone, string> = {
  info: 'var(--ds-color-state-info)',
  success: 'var(--ds-color-state-success)',
  warning: 'var(--ds-color-state-warning)',
  danger: 'var(--ds-color-state-danger)',
  neutral: 'var(--ds-color-state-locked)',
};

const TONE_BG: Record<DsAlertTone, string> = {
  info: 'var(--ds-color-state-info-100)',
  success: 'var(--ds-color-state-success-100)',
  warning: 'var(--ds-color-state-warning-100)',
  danger: 'var(--ds-color-state-danger-100)',
  neutral: 'var(--ds-color-state-locked-100)',
};

const TONE_FG: Record<DsAlertTone, string> = {
  info: 'var(--ds-color-state-info-700)',
  success: 'var(--ds-color-state-success-700)',
  warning: 'var(--ds-color-state-warning-700)',
  danger: 'var(--ds-color-state-danger-700)',
  neutral: 'var(--ds-color-state-locked-700)',
};

/**
 * ds-alert-panel — dashboard attention/severity feed (critical findings,
 * alerts, AI insights). Card header + list of tonal items, each with a left
 * accent bar, ds-icon chip, title + message, timestamp and optional action /
 * dismiss. Replaces the hand-rolled severity panels (invesinspect findings,
 * orderer attention feed, buyer-console ai-insights).
 */
@Component({
  selector: 'ds-alert-panel',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-ap' },
  template: `
    <header class="ds-ap__header">
      <div class="ds-ap__titles">
        <h3 class="ds-ap__title">{{ title() }}</h3>
        @if (subtitle()) { <p class="ds-ap__subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="ds-ap__actions">
        <ng-content select="[header]"/>
      </div>
    </header>
    <div class="ds-ap__list">
      @for (item of items(); track item.id; let last = $last) {
        <div class="ds-ap__row" [class.ds-ap__row--last]="last" [class.ds-ap__row--clickable]="clickable()"
             (click)="onRowClick(item)">
          <span class="ds-ap__accent" [style.background]="toneColor(item)"></span>
          <span class="ds-ap__icon" [style.background]="toneBg(item)" [style.color]="toneFg(item)">
            <ds-icon [name]="item.icon || 'alert-triangle'" size="sm"/>
          </span>
          <div class="ds-ap__main">
            <div class="ds-ap__row-title">{{ item.title }}</div>
            @if (item.message) { <div class="ds-ap__message">{{ item.message }}</div> }
          </div>
          <div class="ds-ap__meta">
            @if (item.timestamp) { <span class="ds-ap__time">{{ item.timestamp }}</span> }
            @if (item.actionLabel) {
              <button type="button" class="ds-ap__action" (click)="onAction(item); $event.stopPropagation()">
                {{ item.actionLabel }}
              </button>
            }
            @if (item.dismissible !== false) {
              <button type="button" class="ds-ap__dismiss" (click)="dismiss.emit(item); $event.stopPropagation()"
                      aria-label="Dismiss {{ item.title }}">
                <ds-icon name="x" size="xs"/>
              </button>
            }
          </div>
        </div>
      } @empty {
        <p class="ds-ap__empty">{{ emptyLabel() }}</p>
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
    .ds-ap__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5); flex-shrink: 0;
    }
    .ds-ap__titles { min-width: 0; }
    .ds-ap__title { font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); margin: 0; }
    .ds-ap__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
    .ds-ap__actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-ap__list { flex: 1; padding: 0 var(--ds-space-5) var(--ds-space-3); }
    .ds-ap__row { display: flex; align-items: flex-start; gap: var(--ds-space-3); padding: var(--ds-space-3) 0; position: relative; }
    .ds-ap__row--clickable { cursor: pointer; }
    .ds-ap__row:not(.ds-ap__row--last) { border-bottom: 1px solid var(--ds-border-divider); }
    .ds-ap__accent { width: 3px; align-self: stretch; border-radius: var(--ds-radius-full); flex-shrink: 0; }
    .ds-ap__icon {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7);
      border-radius: var(--ds-radius-md); flex-shrink: 0; margin-top: var(--ds-space-1);
    }
    .ds-ap__main { flex: 1; min-width: 0; }
    .ds-ap__row-title { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); }
    .ds-ap__message { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin-top: var(--ds-space-1); }
    .ds-ap__meta { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; margin-top: var(--ds-space-1); }
    .ds-ap__time { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-ap__action {
      font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-color-brand-primary); background: none; border: none; cursor: pointer; padding: 0;
    }
    .ds-ap__action:hover { text-decoration: underline; }
    .ds-ap__dismiss {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-6); height: var(--ds-size-6);
      border: none; border-radius: var(--ds-radius-md);
      background: transparent; color: var(--ds-text-muted); cursor: pointer;
    }
    .ds-ap__dismiss:hover { background: var(--ds-surface-hover); }
    .ds-ap__empty { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; padding: var(--ds-space-3) 0; }
  `,
})
export class DsAlertPanelComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly items = input.required<DsAlertItem[]>();
  readonly clickable = input(false);
  readonly emptyLabel = input('—');

  readonly itemClick = output<DsAlertItem>();
  readonly action = output<DsAlertItem>();
  readonly dismiss = output<DsAlertItem>();

  protected toneColor(item: DsAlertItem): string {
    return TONE_COLOR[item.tone];
  }
  protected toneBg(item: DsAlertItem): string {
    return TONE_BG[item.tone];
  }
  protected toneFg(item: DsAlertItem): string {
    return TONE_FG[item.tone];
  }

  protected onRowClick(item: DsAlertItem): void {
    if (this.clickable()) this.itemClick.emit(item);
  }
  protected onAction(item: DsAlertItem): void {
    this.action.emit(item);
  }
}