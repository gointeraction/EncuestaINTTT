import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ds-skeleton — loading placeholder (shimmer).
 * Types: table / card / form / kpi / chart / agenda / timeline.
 * Token-driven (surfaces domain).
 */
@Component({
  selector: 'ds-skeleton',
  standalone: true,
  host: { style: 'display: block; width: 100%;' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (type()) {
      @case ('table') {
        <div class="ds-sk-table" role="status" aria-label="Loading">
          <div class="ds-sk-row ds-sk-head"></div>
          @for (i of rows(); track i) { <div class="ds-sk-row"></div> }
        </div>
      }
      @case ('card') {
        <div class="ds-sk-cards" role="status" aria-label="Loading">
          @for (i of rows(); track i) { <div class="ds-sk-card ds-sk-pulse"></div> }
        </div>
      }
      @case ('form') {
        <div class="ds-sk-form" role="status" aria-label="Loading">
          @for (i of rows(); track i) { <div class="ds-sk-field ds-sk-pulse"></div> }
        </div>
      }
      @case ('kpi') {
        <div class="ds-sk-kpis" role="status" aria-label="Loading">
          @for (i of rows(); track i) { <div class="ds-sk-kpi ds-sk-pulse"></div> }
        </div>
      }
      @case ('chart') {
        <div class="ds-sk-chart" role="status" aria-label="Loading">
          <div class="ds-sk-chart__head"></div>
          <div class="ds-sk-chart__area">
            @for (i of rows(); track i) {
              <div class="ds-sk-chart__bar ds-sk-pulse" [style.height]="chartBarHeight(i)"></div>
            }
          </div>
        </div>
      }
      @case ('agenda') {
        <div class="ds-sk-agenda" role="status" aria-label="Loading">
          @for (i of rows(); track i) {
            <div class="ds-sk-agenda__row">
              <span class="ds-sk-agenda__time ds-sk-pulse"></span>
              <span class="ds-sk-agenda__dot ds-sk-pulse"></span>
              <span class="ds-sk-agenda__line ds-sk-pulse"></span>
            </div>
          }
        </div>
      }
      @case ('timeline') {
        <div class="ds-sk-timeline" role="status" aria-label="Loading">
          @for (i of rows(); track i) {
            <div class="ds-sk-timeline__row">
              <span class="ds-sk-timeline__circle ds-sk-pulse"></span>
              <div class="ds-sk-timeline__lines">
                <span class="ds-sk-timeline__line ds-sk-pulse"></span>
                <span class="ds-sk-timeline__line ds-sk-pulse" style="width: 55%"></span>
              </div>
            </div>
          }
        </div>
      }
    }
  `,
  styles: `
    @keyframes ds-sk-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .ds-sk-pulse {
      background: linear-gradient(90deg, var(--ds-surface-muted) 25%, var(--ds-surface-hover) 50%, var(--ds-surface-muted) 75%);
      background-size: 200% 100%;
      animation: ds-sk-shimmer 1.5s infinite;
      border-radius: var(--ds-radius-standard);
    }
    .ds-sk-table { display: flex; flex-direction: column; gap: var(--ds-space-2); }
    .ds-sk-row { height: var(--ds-size-11); border-radius: var(--ds-radius-standard); }
    .ds-sk-row:not(.ds-sk-head) { background: var(--ds-surface-muted); }
    .ds-sk-head {
      background: linear-gradient(90deg, var(--ds-surface-muted) 25%, var(--ds-surface-hover) 50%, var(--ds-surface-muted) 75%);
      background-size: 200% 100%;
      animation: ds-sk-shimmer 1.5s infinite;
      width: 50%;
    }
    .ds-sk-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: var(--ds-space-4); }
    .ds-sk-card { height: 7.5rem; }
    .ds-sk-form { display: flex; flex-direction: column; gap: var(--ds-space-4); }
    .ds-sk-field { height: var(--ds-size-12); }
    .ds-sk-kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr)); gap: var(--ds-space-4); }
    .ds-sk-kpi { height: var(--ds-size-20); }

    .ds-sk-chart { display: flex; flex-direction: column; gap: var(--ds-space-4); }
    .ds-sk-chart__head { width: 40%; height: var(--ds-size-5); }
    .ds-sk-chart__area { display: flex; align-items: flex-end; gap: var(--ds-space-3); height: 10rem; padding-top: var(--ds-space-4); }
    .ds-sk-chart__bar { flex: 1; border-radius: var(--ds-radius-sm) var(--ds-radius-sm) 0 0; min-height: var(--ds-size-6); }

    .ds-sk-agenda { display: flex; flex-direction: column; gap: var(--ds-space-3); }
    .ds-sk-agenda__row { display: flex; align-items: center; gap: var(--ds-space-3); }
    .ds-sk-agenda__time { width: var(--ds-size-16); height: var(--ds-size-4); }
    .ds-sk-agenda__dot { width: var(--ds-size-3); height: var(--ds-size-3); border-radius: var(--ds-radius-full); flex-shrink: 0; }
    .ds-sk-agenda__line { flex: 1; height: var(--ds-size-4); }

    .ds-sk-timeline { display: flex; flex-direction: column; gap: var(--ds-space-5); position: relative; }
    .ds-sk-timeline__row { display: flex; align-items: flex-start; gap: var(--ds-space-4); }
    .ds-sk-timeline__circle { width: var(--ds-size-10); height: var(--ds-size-10); border-radius: var(--ds-radius-full); flex-shrink: 0; }
    .ds-sk-timeline__lines { flex: 1; display: flex; flex-direction: column; gap: var(--ds-space-2); padding-top: var(--ds-space-1); }
    .ds-sk-timeline__line { height: var(--ds-size-4); }
  `,
})
export class DsSkeletonComponent {
  readonly type = input<'table' | 'card' | 'form' | 'kpi' | 'chart' | 'agenda' | 'timeline'>('table');
  readonly rows = input<number[]>([1, 2, 3, 4, 5]);

  protected chartBarHeight(index: number): string {
    const heights = ['38%', '64%', '50%', '78%', '44%', '70%', '58%'];
    return heights[index % heights.length];
  }
}