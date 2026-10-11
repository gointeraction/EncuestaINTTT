import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsChartComponent, DsChartType, DsChartSeries, DonutSegment, BarChartData } from './chart.component';
import { DsEmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * ds-chart-card — dashboard chart presenter.
 * All types delegate to `ds-chart` (`type` input):
 *  - grouped → ds-chart (bar groups) wrapped in the ds card shell
 *              (title + subtitle + [header] actions + `max` scale).
 *  - donut/bar → ds-chart rendered DIRECTLY (those variants carry their own
 *              card shell + legend), so the ds shell is skipped. When there
 *              is no data for the type and `emptyTitle` is set, the ds shell
 *              + ds-empty-state are shown.
 * When grouped has no series and no emptyTitle, arbitrary chart content via
 * ng-content is preserved (custom charts). Token-driven (ds-viz-* palette
 * comes from the chart primitives).
 *
 *   <ds-chart-card title="Revenue" subtitle="Last 6 months">
 *     <ng-container header><ds-dashboard-actions/></ng-container>
 *   </ds-chart-card>
 */
@Component({
  selector: 'ds-chart-card',
  standalone: true,
  imports: [DsChartComponent, DsEmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-cc' },
  template: `
    @switch (type()) {
      @case ('donut') {
        @if (hasDonutData()) {
          <ds-chart type="donut" [title]="title()" [subtitle]="subtitle()" [period]="period()"
                    [total]="total()" [totalLabel]="totalLabel()" [segments]="segments()"
                    [size]="size()"/>
        } @else {
          @if (showEmptyShell()) {
            <header class="ds-cc__header">
              <div class="ds-cc__titles">
                <h3 class="ds-cc__title">{{ title() }}</h3>
                @if (subtitle()) { <p class="ds-cc__subtitle">{{ subtitle() }}</p> }
              </div>
              <div class="ds-cc__actions">
                <ng-content select="[header]"/>
              </div>
            </header>
          }
          <div class="ds-cc__body"><ds-empty-state [title]="emptyTitle()" [body]="emptyBody()"/></div>
        }
      }
      @case ('bar') {
        @if (barData().length > 0) {
          <ds-chart type="bar" [title]="title()" [subtitle]="subtitle()" [data]="barData()"/>
        } @else {
          @if (showEmptyShell()) {
            <header class="ds-cc__header">
              <div class="ds-cc__titles">
                <h3 class="ds-cc__title">{{ title() }}</h3>
                @if (subtitle()) { <p class="ds-cc__subtitle">{{ subtitle() }}</p> }
              </div>
              <div class="ds-cc__actions">
                <ng-content select="[header]"/>
              </div>
            </header>
          }
          <div class="ds-cc__body"><ds-empty-state [title]="emptyTitle()" [body]="emptyBody()"/></div>
        }
      }
      @case ('hbars') {
        <header class="ds-cc__header">
          <div class="ds-cc__titles">
            <h3 class="ds-cc__title">{{ title() }}</h3>
            @if (subtitle()) { <p class="ds-cc__subtitle">{{ subtitle() }}</p> }
          </div>
          <div class="ds-cc__actions">
            <ng-content select="[header]"/>
          </div>
        </header>
        <div class="ds-cc__body">
          @if (series().length > 0) {
            <ds-chart type="hbars" [categories]="categories()" [series]="series()" [ariaLabel]="ariaLabel()"/>
          } @else if (emptyTitle()) {
            <ds-empty-state [title]="emptyTitle()" [body]="emptyBody()"/>
          } @else {
            <ng-content/>
          }
        </div>
      }
      @default {
        <header class="ds-cc__header">
          <div class="ds-cc__titles">
            <h3 class="ds-cc__title">{{ title() }}</h3>
            @if (subtitle()) { <p class="ds-cc__subtitle">{{ subtitle() }}</p> }
          </div>
          <div class="ds-cc__actions">
            <ng-content select="[header]"/>
          </div>
        </header>
        <div class="ds-cc__body">
          @if (series().length > 0) {
            <ds-chart [categories]="categories()" [series]="series()" [max]="max()" [ariaLabel]="ariaLabel()"/>
          } @else if (emptyTitle()) {
            <ds-empty-state [title]="emptyTitle()" [body]="emptyBody()"/>
          } @else {
            <ng-content/>
          }
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: flex; flex-direction: column;
      background: var(--ds-component-card-bg);
      color: var(--ds-component-card-on);
      border: 1px solid var(--ds-component-card-border);
      border-radius: var(--ds-component-card-radius);
      box-shadow: var(--ds-component-card-shadow);
      font-family: var(--ds-font-sans);
    }
    .ds-cc__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5); flex-shrink: 0;
    }
    .ds-cc__titles { min-width: 0; }
    .ds-cc__title {
      font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-component-card-on); margin: 0;
    }
    .ds-cc__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
    .ds-cc__actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-cc__body { flex: 1; padding: var(--ds-space-4) var(--ds-space-5); min-width: 0; }
  `,
})
export class DsChartCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  /** Chart primitive to render: grouped bars (ds-chart) | donut | bar. */
  readonly type = input<DsChartType>('grouped');
  readonly ariaLabel = input('chart');

  // grouped
  readonly categories = input<string[]>([]);
  readonly series = input<DsChartSeries[]>([]);
  /** Explicit scale maximum forwarded to ds-chart (grouped only). */
  readonly max = input<number | null>(null);

  // donut
  readonly total = input(0);
  readonly totalLabel = input('TOTAL');
  readonly segments = input<DonutSegment[]>([]);
  readonly period = input('');
  readonly size = input(240);

  // bar
  readonly barData = input<BarChartData[]>([]);

  // empty state
  readonly emptyTitle = input('');
  readonly emptyBody = input('');

  protected hasDonutData(): boolean {
    return this.segments().length > 0;
  }

  /** Only render the ux card shell around the empty state when there is a title/action to show. */
  protected showEmptyShell(): boolean {
    return this.title() !== '' || this.subtitle() !== '';
  }
}