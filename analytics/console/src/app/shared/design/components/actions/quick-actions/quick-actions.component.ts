import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsQuickActionTone = 'brand' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface DsQuickAction {
  id: string;
  label: string;
  icon: string;
  subtitle?: string;
  tone?: DsQuickActionTone;
  badge?: string;
  disabled?: boolean;
}

const TONE_COLOR: Record<DsQuickActionTone, string> = {
  brand: 'var(--ds-color-brand-primary)',
  neutral: 'var(--ds-color-state-locked)',
  info: 'var(--ds-color-state-info)',
  success: 'var(--ds-color-state-success)',
  warning: 'var(--ds-color-state-warning)',
  danger: 'var(--ds-color-state-danger)',
};

const TONE_BG: Record<DsQuickActionTone, string> = {
  brand: 'var(--ds-color-brand-primary-100)',
  neutral: 'var(--ds-color-state-locked-100)',
  info: 'var(--ds-color-state-info-100)',
  success: 'var(--ds-color-state-success-100)',
  warning: 'var(--ds-color-state-warning-100)',
  danger: 'var(--ds-color-state-danger-100)',
};

/**
 * ds-quick-actions — dashboard quick-action tiles (icon + label).
 * Auto-fit grid (min 10rem) of actionable tiles: tonal ds-icon chip + label +
 * optional subtitle + optional count badge. Replaces the hand-rolled
 * quick-action stacks/tile grids seen across module dashboards (orderer
 * wireframe, invesagent workflows, property-snapshot, buyer-console).
 */
@Component({
  selector: 'ds-quick-actions',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-qa' },
  template: `
    <div class="ds-qa__grid">
      @for (item of actions(); track item.id) {
        <button type="button" class="ds-qa__tile" [disabled]="item.disabled || null"
                [attr.aria-label]="item.label" (click)="action.emit(item)">
          <span class="ds-qa__icon" [style.background]="toneBg(item)" [style.color]="toneColor(item)">
            <ds-icon [name]="item.icon" size="md"/>
          </span>
          <span class="ds-qa__text">
            <span class="ds-qa__label">{{ item.label }}</span>
            @if (item.subtitle) { <span class="ds-qa__subtitle">{{ item.subtitle }}</span> }
          </span>
          @if (item.badge) {
            <span class="ds-qa__badge" [style.background]="toneBg(item)" [style.color]="toneColor(item)">
              {{ item.badge }}
            </span>
          }
        </button>
      } @empty {
        <p class="ds-qa__empty">—</p>
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
    .ds-qa__grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: var(--ds-space-2); padding: var(--ds-space-4) var(--ds-space-5);
    }
    .ds-qa__tile {
      display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-2);
      padding: var(--ds-space-3);
      background: var(--ds-surface-field); color: var(--ds-component-card-on);
      border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-lg);
      cursor: pointer; text-align: left; position: relative;
      transition: border-color var(--ds-duration-fast) var(--ds-ease-standard),
                  background-color var(--ds-duration-fast) var(--ds-ease-standard);
    }
    .ds-qa__tile:hover:not([disabled]) { border-color: var(--ds-color-brand-primary); background: var(--ds-surface-hover); }
    .ds-qa__tile[disabled] { opacity: 0.5; cursor: not-allowed; }
    .ds-qa__icon {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-9); height: var(--ds-size-9);
      border-radius: var(--ds-radius-md); flex-shrink: 0;
    }
    .ds-qa__text { display: flex; flex-direction: column; min-width: 0; }
    .ds-qa__label { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); }
    .ds-qa__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-qa__badge {
      position: absolute; top: var(--ds-space-2); right: var(--ds-space-2);
      min-width: var(--ds-size-5); height: var(--ds-size-5); padding: 0 var(--ds-space-1);
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--ds-radius-full); font-size: var(--ds-text-caption);
      font-weight: var(--ds-font-weight-bold);
    }
    .ds-qa__empty { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; padding: var(--ds-space-2) 0; }
  `,
})
export class DsQuickActionsComponent {
  readonly actions = input.required<DsQuickAction[]>();
  readonly action = output<DsQuickAction>();

  protected toneColor(item: DsQuickAction): string {
    return TONE_COLOR[(item.tone ?? 'neutral')];
  }
  protected toneBg(item: DsQuickAction): string {
    return TONE_BG[(item.tone ?? 'neutral')];
  }
}