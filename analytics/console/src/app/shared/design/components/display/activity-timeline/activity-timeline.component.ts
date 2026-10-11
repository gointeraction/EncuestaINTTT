import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../icon/icon.component';

export interface DsTimelineEvent {
  timestamp: string;
  type: string;
  description: string;
  actor?: string;
  metadata?: string;
  color?: string;
  icon?: string;
}

export type DsTimelineDensity = 'compact' | 'full';

/**
 * ds-activity-timeline — vertical event feed.
 * compact: timestamp + colored dot + single line. full: icon circle + type + meta.
 * Token-driven activity timeline.
 */
@Component({
  selector: 'ds-activity-timeline',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; width: 100%;' },
  template: `
    @if (density() === 'compact') {
      <div class="ds-at ds-at--compact" [attr.data-container]="'section'" [attr.data-name]="section()">
        @for (event of events(); track event.timestamp + event.type + $index) {
          @if (clickable()) {
            <button type="button" class="ds-at__row ds-at__row--btn" (click)="eventClick.emit(event)">
              <span class="ds-at__time">{{ event.timestamp }}</span>
              <span class="ds-at__dot" [style.background]="event.color || 'var(--ds-color-state-info)'"></span>
              <span class="ds-at__desc">{{ event.description }}</span>
            </button>
          } @else {
            <div class="ds-at__row">
              <span class="ds-at__time">{{ event.timestamp }}</span>
              <span class="ds-at__dot" [style.background]="event.color || 'var(--ds-color-state-info)'"></span>
              <span class="ds-at__desc">{{ event.description }}</span>
            </div>
          }
        }
      </div>
    } @else {
      <div class="ds-at ds-at--full" [attr.data-container]="'section'" [attr.data-name]="section()">
        <div class="ds-at__line"></div>
        @for (event of events(); track event.timestamp + event.type + $index) {
          @if (clickable()) {
            <button type="button" class="ds-at__row ds-at__row--full ds-at__row--btn" (click)="eventClick.emit(event)">
              <div class="ds-at__circle" [style.background]="event.color ? lighten(event.color) : 'var(--ds-status-surface-info)'">
                <ds-icon class="ds-at__cicon" [name]="event.icon || 'activity'" size="sm"
                         [style.color]="event.color || 'var(--ds-color-state-info-700)'"/>
              </div>
              <div class="ds-at__body">
                <div class="ds-at__head">
                  <span class="ds-at__type">{{ event.type }}</span>
                  <span class="ds-at__date">{{ event.timestamp }}</span>
                </div>
                <p class="ds-at__desc">{{ event.description }}</p>
                @if (event.actor || event.metadata) {
                  <div class="ds-at__meta">
                    @if (event.actor) { <span>{{ event.actor }}</span> }
                    @if (event.actor && event.metadata) { <span>·</span> }
                    @if (event.metadata) { <span>{{ event.metadata }}</span> }
                  </div>
                }
              </div>
            </button>
          } @else {
            <div class="ds-at__row ds-at__row--full">
              <div class="ds-at__circle" [style.background]="event.color ? lighten(event.color) : 'var(--ds-status-surface-info)'">
                <ds-icon class="ds-at__cicon" [name]="event.icon || 'activity'" size="sm"
                         [style.color]="event.color || 'var(--ds-color-state-info-700)'"/>
              </div>
              <div class="ds-at__body">
                <div class="ds-at__head">
                  <span class="ds-at__type">{{ event.type }}</span>
                  <span class="ds-at__date">{{ event.timestamp }}</span>
                </div>
                <p class="ds-at__desc">{{ event.description }}</p>
                @if (event.actor || event.metadata) {
                  <div class="ds-at__meta">
                    @if (event.actor) { <span>{{ event.actor }}</span> }
                    @if (event.actor && event.metadata) { <span>·</span> }
                    @if (event.metadata) { <span>{{ event.metadata }}</span> }
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    }
  `,
  styles: `
    .ds-at { display: flex; flex-direction: column; width: 100%; }
    .ds-at--compact { gap: var(--ds-space-3); }
    .ds-at--compact .ds-at__row { display: flex; align-items: center; gap: var(--ds-space-3); }
    .ds-at__row--btn {
      width: 100%; text-align: left; font-family: inherit; cursor: pointer;
      background: transparent; border: none; padding: var(--ds-space-1);
      border-radius: var(--ds-radius-md);
      transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
    }
    .ds-at__row--btn:hover { background: var(--ds-surface-hover); }
    .ds-at__time { font-size: var(--ds-text-caption); color: var(--ds-text-muted); width: var(--ds-size-14); flex-shrink: 0; }
    .ds-at__dot { width: var(--ds-size-2); height: var(--ds-size-2); border-radius: var(--ds-radius-full); flex-shrink: 0; }
    .ds-at__desc { font-size: var(--ds-text-small); color: var(--ds-surface-body-on); }

    .ds-at--full { position: relative; gap: 0; }
    .ds-at__line {
      position: absolute; left: 1.1875rem; top: 0; bottom: 0;
      width: 2px; background: var(--ds-border-default); z-index: 0;
    }
    .ds-at__row--full { display: flex; align-items: flex-start; gap: var(--ds-space-4); padding-bottom: var(--ds-space-8); position: relative; }
    .ds-at__row--full:last-child { padding-bottom: 0; }
    .ds-at__circle {
      width: var(--ds-size-10); height: var(--ds-size-10);
      border-radius: var(--ds-radius-full); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 1;
    }
    .ds-at__cicon { width: var(--ds-space-5); height: var(--ds-space-5); }
    .ds-at__body { flex: 1; min-width: 0; }
    .ds-at__head { display: flex; align-items: center; gap: var(--ds-space-2); flex-wrap: wrap; }
    .ds-at__type { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-semibold); color: var(--ds-surface-body-on); }
    .ds-at__date { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-at--full .ds-at__desc { font-size: var(--ds-text-small); color: var(--ds-surface-body-on); margin-top: var(--ds-space-1); }
    .ds-at__meta {
      display: flex; align-items: center; gap: var(--ds-space-2); flex-wrap: wrap;
      font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin-top: var(--ds-space-1);
    }
  `,
})
export class DsActivityTimelineComponent {
  readonly events = input.required<DsTimelineEvent[]>();
  readonly density = input<DsTimelineDensity>('compact');
  readonly section = input('content-activity-timeline');
  /** When true, rows render as buttons and emit eventClick on press. */
  readonly clickable = input(false);

  readonly eventClick = output<DsTimelineEvent>();

  protected lighten(hex: string): string {
    return hex + '1a';
  }
}