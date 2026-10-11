import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DsChartType = 'grouped' | 'donut' | 'bar';

export interface DsChartSeries {
  name: string;
  data: number[];
}

export interface DonutSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface BarChartData {
  month: string;
  completed: number;
  target: number;
  isCurrent: boolean;
}

/**
 * ds-chart — unified chart (standalone + OnPush, zero-dependency).
 * `type` selects the rendering:
 *  - 'grouped': div-based grouped bar chart with legend + grid (ds-viz tokens).
 *  - 'donut': SVG donut with card shell (title/subtitle/period/total/segments).
 *  - 'bar': SVG completion bar chart with target vs completed (monthly data).
 */
@Component({
  selector: 'ds-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (type() === 'donut') {
      <div class="ds-chart__shell">
        <div class="ds-chart__shell-head">
          <div>
            <h3 class="ds-chart__title">{{ title() }}</h3>
            @if (subtitle()) {
              <p class="ds-chart__subtitle">{{ subtitle() }}</p>
            }
          </div>
          @if (period()) {
            <span class="ds-chart__period">{{ period() }}</span>
          }
        </div>
        <div class="ds-chart__donut-row">
          <svg [attr.viewBox]="'0 0 ' + size() + ' ' + size()" class="ds-chart__donut" [style.width.px]="size()" [style.height.px]="size()">
            @for (seg of segments(); track seg.label; let i = $index) {
              <circle
                [attr.cx]="center()"
                [attr.cy]="center()"
                [attr.r]="radius()"
                fill="none"
                [attr.stroke]="seg.color"
                [attr.stroke-width]="strokeWidth()"
                [attr.stroke-dasharray]="segDashArray(seg)"
                [attr.stroke-dashoffset]="dashOffset(i)"
                transform="rotate(-90)"
                [attr.transform-origin]="center() + ' ' + center()"
              />
            }
            <circle [attr.cx]="center()" [attr.cy]="center()" [attr.r]="centerRadius()" [attr.fill]="centerFill()"/>
            <text [attr.x]="center()" [attr.y]="textY()" text-anchor="middle" [attr.font-size]="fontSize()" font-weight="700" [attr.fill]="centerTextColor()" font-family="var(--ds-font-sans)">{{ total() }}</text>
            <text [attr.x]="center()" [attr.y]="labelY()" text-anchor="middle" font-size="10" font-weight="600" style="fill: var(--ds-text-muted)" font-family="var(--ds-font-sans)">{{ totalLabel() }}</text>
          </svg>
          <div class="ds-chart__legend-list">
            @for (seg of segments(); track seg.label) {
              <div class="ds-chart__legend-row">
                <div class="ds-chart__legend-cell">
                  <span class="ds-chart__swatch" [style.background]="seg.color"></span>
                  <span class="ds-chart__legend-name ds-chart__legend-name--truncate">{{ seg.label }}</span>
                </div>
                <span class="ds-chart__legend-value">{{ seg.percent }}% ({{ seg.value }})</span>
              </div>
            }
          </div>
        </div>
      </div>
    } @else if (type() === 'bar') {
      <div class="ds-chart__shell">
        <div class="ds-chart__shell-head">
          <div>
            <h3 class="ds-chart__title">{{ title() }}</h3>
            @if (subtitle()) {
              <p class="ds-chart__subtitle">{{ subtitle() }}</p>
            }
          </div>
          <div class="ds-chart__bar-legend">
            <span class="ds-chart__legend-row ds-chart__legend-row--inline">
              <span class="ds-chart__swatch" [style.background]="completedColor()"></span>
              {{ completedLabel() }}
            </span>
            <span class="ds-chart__legend-row ds-chart__legend-row--inline">
              <span class="ds-chart__swatch ds-chart__swatch--muted" [style.background]="targetColor()"></span>
              {{ targetLabel() }}
            </span>
          </div>
        </div>
        <div class="ds-chart__bar-body">
          <svg viewBox="0 0 400 180" class="w-full h-full" preserveAspectRatio="none">
            @for (y of yLabels; track y.value) {
              <line [attr.x1]="chartLeft" [attr.y1]="y.y" [attr.x2]="chartRight" [attr.y2]="y.y" stroke="var(--ds-border-subtle)" stroke-dasharray="4"/>
              <text [attr.x]="chartLeft - 8" [attr.y]="y.y + 4" font-size="9" fill="var(--ds-text-muted)" text-anchor="end">{{ y.value }}</text>
            }
            @for (d of data(); track d.month; let i = $index) {
              <rect [attr.x]="barX(i)" [attr.y]="barY(d.completed)" [attr.width]="barWidth()" [attr.height]="barPxHeight(d.completed)" rx="4" [attr.fill]="d.isCurrent ? currentMonthColor() : completedColor()"/>
              <rect [attr.x]="barX(i) + barWidth() + gap()" [attr.y]="barY(d.target)" [attr.width]="barWidth()" [attr.height]="barPxHeight(d.target)" rx="4" [attr.fill]="targetColor()" opacity="0.6"/>
              <text [attr.x]="barX(i) + barWidth() + gap() / 2" [attr.y]="chartBottom + 14" font-size="10" [attr.font-weight]="d.isCurrent ? 700 : 600" text-anchor="middle" [attr.fill]="d.isCurrent ? completedColor() : 'var(--ds-text-muted)'">{{ d.month }}</text>
            }
          </svg>
        </div>
      </div>
    } @else {
      <div class="ds-chart" role="img" [attr.aria-label]="ariaLabel()">
        @for (s of series(); track s.name) {
          <div class="ds-chart__legend">
            <span class="ds-chart__swatch" [style.background]="swatch($index)"></span>
            <span class="ds-chart__legend-name">{{ s.name }}</span>
          </div>
        }
        <div class="ds-chart__grid">
          @for (c of categories(); track $index; let ci = $index) {
            <div class="ds-chart__col">
              @for (s of series(); track s.name; let si = $index) {
                <div class="ds-chart__bar-group">
                  <div
                    class="ds-chart__bar"
                    [style.height]="barHeight(s.data[ci] ?? 0) + '%'"
                    [style.background]="swatch(si)"
                    title="{{ s.name }}: {{ s.data[ci] ?? 0 }}"
                  >
                    @if (s.data[ci] != null) {
                      <span class="ds-chart__bar-value">{{ s.data[ci] }}</span>
                    }
                  </div>
                </div>
              }
              <span class="ds-chart__cat">{{ c }}</span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .ds-chart { display: flex; flex-direction: column; gap: var(--ds-gap-md); font-family: var(--ds-font-sans); }
    .ds-chart__legend { display: flex; align-items: center; gap: var(--ds-gap-sm); }
    .ds-chart__swatch { width: var(--ds-size-3); height: var(--ds-size-3); border-radius: var(--ds-radius-sm); flex-shrink: 0; }
    .ds-chart__swatch--muted { opacity: 0.6; }
    .ds-chart__legend-name { font-size: var(--ds-text-caption); color: var(--ds-viz-label); }
    .ds-chart__legend-name--truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ds-chart__grid {
      display: flex; align-items: stretch; gap: var(--ds-gap-md);
      height: 180px;
      border-bottom: 1px solid var(--ds-viz-axis-line);
      padding-top: var(--ds-space-4);
    }
    .ds-chart__col { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: var(--ds-gap-xs); }
    .ds-chart__bar-group { flex: 1; width: 100%; display: flex; align-items: flex-end; gap: 2px; }
    .ds-chart__bar {
      flex: 1; border-radius: var(--ds-radius-sm) var(--ds-radius-sm) 0 0;
      transition: height var(--ds-duration-normal) var(--ds-ease-standard);
      min-height: 2px; position: relative;
    }
    /* Valor encima de cada barra (gráfico agrupado). */
    .ds-chart__bar-value {
      position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
      margin-bottom: 3px; font-size: var(--ds-text-caption); font-weight: 600;
      color: var(--ds-viz-tick); white-space: nowrap; line-height: 1;
    }
    .ds-chart__cat { font-size: var(--ds-text-caption); color: var(--ds-viz-tick); white-space: nowrap; }
    .ds-chart__shell {
      display: flex; flex-direction: column; gap: var(--ds-gap-md); height: 100%;
      font-family: var(--ds-font-sans);
    }
    .ds-chart__shell-head { display: flex; align-items: center; justify-content: space-between; }
    .ds-chart__title { font-family: var(--ds-font-brand); font-size: var(--ds-text-md); font-weight: 700; color: var(--ds-surface-card-on); margin: 0; }
    .ds-chart__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; }
    .ds-chart__period { font-size: var(--ds-text-caption); font-weight: 600; color: var(--ds-color-brand-primary); }
    .ds-chart__donut-row { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ds-gap-lg); padding: var(--ds-space-4) 0; }
    /* = var(--ds-breakpoint-mobile) */
    @media (min-width: 640px) {
      .ds-chart__donut-row { flex-direction: row; }
    }
    .ds-chart__donut { flex-shrink: 0; }
    .ds-chart__legend-list { display: flex; flex-direction: column; gap: var(--ds-gap-sm); font-size: var(--ds-text-caption); width: 100%; min-width: 0; }
    /* = var(--ds-breakpoint-mobile) */
    @media (min-width: 640px) { .ds-chart__legend-list { width: auto; } }
    .ds-chart__legend-row { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-gap-sm); }
    .ds-chart__legend-row--inline { justify-content: flex-start; }
    .ds-chart__legend-cell { display: flex; align-items: center; gap: var(--ds-gap-sm); min-width: 0; overflow: hidden; }
    .ds-chart__legend-value { font-weight: 700; flex-shrink: 0; }
    .ds-chart__bar-legend { display: flex; align-items: center; gap: var(--ds-gap-md); font-size: var(--ds-text-caption); }
    .ds-chart__bar-body { flex: 1; min-height: 0; padding-top: var(--ds-space-2); }
  `,
})
export class DsChartComponent {
  readonly type = input<DsChartType>('grouped');

  readonly categories = input<string[]>([]);
  readonly series = input<DsChartSeries[]>([]);
  readonly ariaLabel = input('chart');
  /** Explicit scale maximum. When omitted, derived from the data (max across series). */
  readonly max = input<number | null>(null);

  readonly title = input('');
  readonly subtitle = input('');
  readonly period = input('');
  readonly total = input(0);
  readonly totalLabel = input('TOTAL');
  readonly segments = input<DonutSegment[]>([]);
  readonly size = input(240);

  readonly completedColor = input('var(--ds-color-brand-primary)');
  readonly targetColor = input('var(--ds-color-state-warning)');
  readonly currentMonthColor = input('var(--ds-color-brand-accent)');
  readonly completedLabel = input('Completed');
  readonly targetLabel = input('Target');
  readonly data = input<BarChartData[]>([]);

  /** Effective max = explicit input, else the largest value across all series. */
  protected readonly chartMax = computed(() => {
    const explicit = this.max();
    if (explicit != null && explicit > 0) return explicit;
    let mx = 0;
    for (const s of this.series()) {
      for (const v of s.data) {
        if (Number.isFinite(v)) mx = Math.max(mx, v);
      }
    }
    return mx > 0 ? mx : 100;
  });

  protected swatch(index: number): string {
    const palette = [
      'var(--ds-viz-series-1)',
      'var(--ds-viz-series-2)',
      'var(--ds-viz-series-3)',
      'var(--ds-viz-series-4)',
      'var(--ds-viz-series-5)',
      'var(--ds-viz-series-6)',
    ];
    return palette[index % palette.length];
  }

  /** Bar height as a % of the scale max (0..100). CSS min-height keeps tiny bars visible. */
  protected barHeight(value: number): number {
    if (!value || value <= 0) return 0;
    const max = this.chartMax();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  }

  protected readonly center = computed(() => this.size() / 2);
  protected readonly radius = computed(() => this.size() * 0.375);
  protected readonly strokeWidth = computed(() => this.size() * 0.15);
  protected readonly centerRadius = computed(() => this.size() * 0.275);
  protected readonly centerFill = computed(() => 'var(--ds-bg-card, var(--ds-color-design-neutral-200))');
  protected readonly centerTextColor = computed(() => 'var(--ds-surface-card-on, var(--ds-color-brand-dark))');
  protected readonly textY = computed(() => this.center() - 4);
  protected readonly labelY = computed(() => this.center() + 12);
  protected readonly fontSize = computed(() => this.size() < 200 ? 18 : 22);
  protected readonly segCircumference = computed(() => 2 * Math.PI * this.radius());

  protected segDashArray(seg: DonutSegment): string {
    const c = this.segCircumference();
    const dash = (seg.percent / 100) * c;
    return `${dash} ${c}`;
  }

  protected dashOffset(i: number): number {
    const c = this.segCircumference();
    let offset = 0;
    for (let j = 0; j < i; j++) {
      offset += (this.segments()[j].percent / 100) * c;
    }
    return -offset;
  }

  protected readonly chartLeft = 35;
  protected readonly chartRight = 395;
  protected readonly chartBottom = 150;
  protected readonly chartHeight = 120;
  protected readonly maxDataValue = 50;

  protected readonly yLabels = [
    { value: 50, y: 30 },
    { value: 30, y: 75 },
    { value: 10, y: 120 },
    { value: 0, y: 150 },
  ];

  protected barWidth = () => 10;
  protected gap = () => 4;

  protected barX(i: number): number {
    const step = (this.chartRight - this.chartLeft) / this.data().length;
    return this.chartLeft + step * i + step * 0.15;
  }

  protected barY(value: number): number {
    return this.chartBottom - this.barPxHeight(value);
  }

  /** SVG bar height in px (0..chartHeight) for the 'bar' type. */
  protected barPxHeight(value: number): number {
    return (value / this.maxDataValue) * this.chartHeight;
  }
}