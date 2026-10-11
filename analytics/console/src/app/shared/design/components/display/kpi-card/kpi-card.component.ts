import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsBadgeTone } from '../badge/badge.component';

/**
 * ds-kpi-card — dashboard metric card (standalone + OnPush).
 * Label + value + optional trend tone. Fed by reporting/overview data.
 */
@Component({
  selector: 'ds-kpi-card',
  standalone: true,
  host: { '[class.ds-kpi--danger]': "tone() === 'danger'", '[class.ds-kpi--success]': "tone() === 'success'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-kpi__label">{{ label() }}</div>
    <div class="ds-kpi__value">{{ value() }}</div>
    @if (trend() !== undefined && trend() !== null) {
      <div class="ds-kpi__trend">{{ trend() }}</div>
    }
  `,
  styles: `
    :host {
      display: block;
      background: var(--ds-component-kpi-bg);
      color: var(--ds-component-kpi-on);
      border: 1px solid var(--ds-component-kpi-border);
      border-radius: var(--ds-component-kpi-radius);
      padding: var(--ds-component-kpi-padding);
      font-family: var(--ds-font-sans);
    }
    :host(.ds-kpi--danger) { border-color: var(--ds-status-danger); }
    :host(.ds-kpi--success) { border-color: var(--ds-status-success); }
    .ds-kpi__label {
      font-size: var(--ds-component-kpi-label-size);
      letter-spacing: var(--ds-letter-spacing-caps);
      text-transform: uppercase;
      color: var(--ds-text-muted);
    }
    .ds-kpi__value {
      margin-top: var(--ds-gap-xs);
      font-size: var(--ds-component-kpi-value-size);
      font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-component-kpi-on);
      font-variant-numeric: tabular-nums;
    }
    .ds-kpi__trend {
      margin-top: var(--ds-gap-xs);
      font-size: var(--ds-text-caption);
      color: var(--ds-text-muted);
    }
  `,
})
export class DsKpiCardComponent {
  readonly label = input('');
  readonly value = input<string | number>('');
  readonly trend = input<string | number | null>(null);
  readonly tone = input<Extract<DsBadgeTone, 'neutral' | 'success' | 'danger'>>('neutral');
}