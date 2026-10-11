import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../icon/icon.component';

export type DsKpiTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface DsKpiItem {
  /** Optional stable id — used as the @for track key (falls back to label). */
  id?: string;
  label: string;
  value: string | number;
  icon: string;
  tone?: DsKpiTone;
  trend?: string;
  trendUp?: boolean;
}

/** Value font-size by length (auto-shrink long data). */
const VALUE_FONT: Array<{ max: number; cls: string }> = [
  { max: 4, cls: 'ds-kg__value--xl' },
  { max: 6, cls: 'ds-kg__value--lg' },
  { max: 9, cls: 'ds-kg__value--md' },
  { max: 99, cls: 'ds-kg__value--sm' },
];

const TONE_COLOR: Record<DsKpiTone, string> = {
  neutral: 'var(--ds-color-state-locked)',
  info: 'var(--ds-color-state-info)',
  success: 'var(--ds-color-state-success)',
  warning: 'var(--ds-color-state-warning)',
  danger: 'var(--ds-color-state-danger)',
};

const TONE_BG: Record<DsKpiTone, string> = {
  neutral: 'var(--ds-color-state-locked-100)',
  info: 'var(--ds-color-state-info-100)',
  success: 'var(--ds-color-state-success-100)',
  warning: 'var(--ds-color-state-warning-100)',
  danger: 'var(--ds-color-state-danger-100)',
};

/**
 * ds-kpi-grid — dashboard KPI cards (4–8) that auto-fit.
 * Column count adapts to the number of items (4→4col, 5–6→3col, 7–8→4col);
 * the value font-size shrinks as the data gets longer (auto-fit by length);
 * each card shows an evocative ds-icon + optional trend arrow. When `clickable`
 * the cards become buttons emitting kpiClick with the item.
 * Composes ds-icon + tokens. Ported from invesmarket stats-row pattern.
 */
@Component({
  selector: 'ds-kpi-grid',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%;' },
  template: `
    <div class="ds-kg">
      @for (kpi of items(); track kpi.id ?? kpi.label) {
        @if (clickable()) {
          <button type="button" class="ds-kg__card ds-kg__card--btn" [class.ds-kg__card--accent]="kpi.tone && kpi.tone !== 'neutral'"
                  (click)="kpiClick.emit(kpi)">
            <div class="ds-kg__icon" [style.background]="toneBg(kpi)" [style.color]="toneColor(kpi)">
              <ds-icon [name]="kpi.icon" size="md"/>
            </div>
            <div class="ds-kg__info">
              <div class="ds-kg__label">{{ kpi.label }}</div>
              <div class="ds-kg__value {{ valueClass(kpi.value) }}">{{ kpi.value }}</div>
              @if (kpi.trend) {
                <div class="ds-kg__trend" [style.color]="toneColor(kpi)">
                  @if (kpi.trendUp !== undefined) {
                    <ds-icon [name]="kpi.trendUp ? 'arrow-up' : 'arrow-down'" size="xs"/>
                  }
                  {{ kpi.trend }}
                </div>
              }
            </div>
          </button>
        } @else {
          <div class="ds-kg__card" [class.ds-kg__card--accent]="kpi.tone && kpi.tone !== 'neutral'">
            <div class="ds-kg__icon" [style.background]="toneBg(kpi)" [style.color]="toneColor(kpi)">
              <ds-icon [name]="kpi.icon" size="md"/>
            </div>
            <div class="ds-kg__info">
              <div class="ds-kg__label">{{ kpi.label }}</div>
              <div class="ds-kg__value {{ valueClass(kpi.value) }}">{{ kpi.value }}</div>
              @if (kpi.trend) {
                <div class="ds-kg__trend" [style.color]="toneColor(kpi)">
                  @if (kpi.trendUp !== undefined) {
                    <ds-icon [name]="kpi.trendUp ? 'arrow-up' : 'arrow-down'" size="xs"/>
                  }
                  {{ kpi.trend }}
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .ds-kg {
      display: grid; gap: var(--ds-space-4);
      /* Auto-fit: en escritorio caben todos en UNA fila; envuelve en pantallas menores. */
      grid-template-columns: repeat(auto-fit, minmax(min(170px, 100%), 1fr));
    }

    .ds-kg__card {
      display: flex; align-items: center; gap: var(--ds-space-3);
      background: var(--ds-component-kpi-bg); color: var(--ds-component-kpi-on);
      border: 1px solid var(--ds-component-kpi-border);
      border-radius: var(--ds-component-kpi-radius);
      padding: var(--ds-space-4) var(--ds-space-5);
      min-width: 0;
    }
    .ds-kg__card--btn {
      width: 100%; text-align: left; cursor: pointer; font-family: inherit;
      transition: border-color var(--ds-duration-fast) var(--ds-ease-standard),
                  box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
    }
    .ds-kg__card--btn:hover { border-color: var(--ds-color-brand-primary); box-shadow: var(--ds-component-card-shadow); }
    .ds-kg__card--accent { border-color: var(--ds-border-default); }

    .ds-kg__icon {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-10); height: var(--ds-size-10);
      border-radius: var(--ds-radius-lg); flex-shrink: 0;
    }
    .ds-kg__info { flex: 1; min-width: 0; }
    .ds-kg__label {
      font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-semibold);
      text-transform: uppercase; letter-spacing: var(--ds-letter-spacing-wide);
      color: var(--ds-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .ds-kg__value {
      font-weight: var(--ds-font-weight-bold); line-height: 1.2;
      color: var(--ds-component-kpi-on);
      font-variant-numeric: tabular-nums; margin-top: var(--ds-space-1);
    }
    .ds-kg__value--xl { font-size: var(--ds-text-heading-1); }
    .ds-kg__value--lg { font-size: var(--ds-text-heading-2); }
    .ds-kg__value--md { font-size: var(--ds-text-heading-3); }
    .ds-kg__value--sm { font-size: var(--ds-text-heading-4); }
    .ds-kg__trend {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      font-size: var(--ds-text-caption); margin-top: var(--ds-space-1);
    }
  `,
})
export class DsKpiGridComponent {
  readonly items = input.required<DsKpiItem[]>();
  /** When true, cards render as buttons and emit kpiClick on press. */
  readonly clickable = input(false);

  readonly kpiClick = output<DsKpiItem>();

  protected toneColor(kpi: DsKpiItem): string {
    return TONE_COLOR[(kpi.tone ?? 'neutral')];
  }

  protected toneBg(kpi: DsKpiItem): string {
    return TONE_BG[(kpi.tone ?? 'neutral')];
  }

  protected valueClass(value: string | number): string {
    const len = String(value).length;
    const row = VALUE_FONT.find((v) => len <= v.max) ?? VALUE_FONT[VALUE_FONT.length - 1];
    return row.cls;
  }
}