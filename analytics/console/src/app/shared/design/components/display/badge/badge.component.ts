import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DsBadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'sand' | 'locked' | 'awaiting' | 'blocked' | 'offline';
export type DsBadgeVariant = 'solid' | 'dot';
export type DsBadgeShape = 'standard' | 'pill' | 'rounded';

/**
 * ds-badge — universal status badge (standalone + OnPush).
 * Tones map to the status domain (success/warning/danger/info/neutral) plus
 * brand and sand. Variant 'dot' adds a leading status dot (users/ports).
 * Shape 'pill' (full radius) / 'rounded' (medium radius) cover the former
 * ds-status-badge styles; `field` sets a data-field attribute for tests.
 */
@Component({
  selector: 'ds-badge',
  standalone: true,
  host: {
    '[class.ds-badge--neutral]': "tone() === 'neutral'",
    '[class.ds-badge--brand]': "tone() === 'brand'",
    '[class.ds-badge--success]': "tone() === 'success'",
    '[class.ds-badge--warning]': "tone() === 'warning'",
    '[class.ds-badge--danger]': "tone() === 'danger'",
    '[class.ds-badge--info]': "tone() === 'info'",
    '[class.ds-badge--sand]': "tone() === 'sand'",
    '[class.ds-badge--locked]': "tone() === 'locked'",
    '[class.ds-badge--awaiting]': "tone() === 'awaiting'",
    '[class.ds-badge--blocked]': "tone() === 'blocked'",
    '[class.ds-badge--offline]': "tone() === 'offline'",
    '[class.ds-badge--dot]': "variant() === 'dot'",
    '[class.ds-badge--pill]': "shape() === 'pill'",
    '[class.ds-badge--rounded]': "shape() === 'rounded'",
    '[attr.data-field]': 'field() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'dot') {
      <span class="ds-badge__dot"
            [class.ds-badge__dot--success]="(dotTone() || tone()) === 'success'"
            [class.ds-badge__dot--warning]="(dotTone() || tone()) === 'warning'"
            [class.ds-badge__dot--danger]="(dotTone() || tone()) === 'danger'"
            [class.ds-badge__dot--neutral]="(dotTone() || tone()) === 'neutral'"
            [class.ds-badge__dot--brand]="(dotTone() || tone()) === 'brand'"
            [class.ds-badge__dot--info]="(dotTone() || tone()) === 'info'"
            [class.ds-badge__dot--locked]="(dotTone() || tone()) === 'locked'"
            [class.ds-badge__dot--awaiting]="(dotTone() || tone()) === 'awaiting'"
            [class.ds-badge__dot--blocked]="(dotTone() || tone()) === 'blocked'"
            [class.ds-badge__dot--offline]="(dotTone() || tone()) === 'offline'"></span>
    }
    <ng-content/>
  `,
  styles: `
    :host {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      border-radius: var(--ds-component-badge-radius);
      font-size: var(--ds-component-badge-size);
      font-weight: var(--ds-font-weight-medium);
      padding: var(--ds-component-badge-padding-y) var(--ds-component-badge-padding-x);
      white-space: nowrap;
    }
    :host(.ds-badge--neutral) { background: var(--ds-status-surface-neutral); color: var(--ds-status-surface-neutral-on); border: 1px solid var(--ds-border-subtle); }
    :host(.ds-badge--brand) { background: var(--ds-color-brand-primary); color: var(--ds-color-white); border: none; }
    :host(.ds-badge--success) { background: var(--ds-status-surface-success); color: var(--ds-status-surface-success-on); border: none; }
    :host(.ds-badge--warning) { background: var(--ds-status-surface-warning); color: var(--ds-status-surface-warning-on); border: none; }
    :host(.ds-badge--danger) { background: var(--ds-status-surface-danger); color: var(--ds-status-surface-danger-on); border: none; }
    :host(.ds-badge--info) { background: var(--ds-status-surface-info); color: var(--ds-status-surface-info-on); border: none; }
    :host(.ds-badge--sand) { background: var(--ds-color-brand-accent); color: var(--ds-color-brand-dark); border: none; }
    :host(.ds-badge--locked) { background: var(--ds-status-surface-locked); color: var(--ds-status-surface-locked-on); border: none; }
    :host(.ds-badge--awaiting) { background: var(--ds-status-surface-awaiting); color: var(--ds-status-surface-awaiting-on); border: none; }
    :host(.ds-badge--blocked) { background: var(--ds-status-surface-blocked); color: var(--ds-status-surface-blocked-on); border: none; }
    :host(.ds-badge--offline) { background: var(--ds-status-surface-offline); color: var(--ds-status-surface-offline-on); border: none; }
    .ds-badge__dot { width: var(--ds-size-1-5); height: var(--ds-size-1-5); border-radius: var(--ds-radius-full); }
    .ds-badge__dot--success { background: var(--ds-status-success); }
    .ds-badge__dot--warning { background: var(--ds-status-warning); }
    .ds-badge__dot--danger { background: var(--ds-status-danger); }
    .ds-badge__dot--neutral { background: var(--ds-status-neutral); }
    .ds-badge__dot--brand { background: var(--ds-color-brand-primary); }
    .ds-badge__dot--info { background: var(--ds-status-info); }
    .ds-badge__dot--locked { background: var(--ds-status-locked); }
    .ds-badge__dot--awaiting { background: var(--ds-status-awaiting); }
    .ds-badge__dot--blocked { background: var(--ds-status-blocked); }
    .ds-badge__dot--offline { background: var(--ds-status-offline); }
    :host(.ds-badge--pill) { border-radius: var(--ds-radius-full); }
    :host(.ds-badge--rounded) {
      border-radius: var(--ds-radius-standard);
      padding: var(--ds-space-1) var(--ds-space-3);
    }
  `,
})
export class DsBadgeComponent {
  readonly tone = input<DsBadgeTone>('neutral');
  readonly variant = input<'solid' | 'dot'>('solid');
  /** For the dot variant: the color of the leading dot (defaults to tone). */
  readonly dotTone = input<DsBadgeTone | ''>('');
  /** Shape: standard (default) | pill (full radius) | rounded (medium radius). */
  readonly shape = input<DsBadgeShape>('standard');
  /** Optional data-field attribute (test hooks). */
  readonly field = input('');
}
