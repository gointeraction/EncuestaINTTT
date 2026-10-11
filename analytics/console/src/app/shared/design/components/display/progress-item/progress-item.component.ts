import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type DsProgressStageStatus = 'completed' | 'active' | 'inactive';

export interface DsProgressStage {
  label: string;
  status: DsProgressStageStatus;
}

export interface DsProgressItemData {
  id: string;
  title: string;
  subtitle?: string;
  percent: number;
  stages: DsProgressStage[];
}

/**
 * ds-progress-item — dashboard transaction/item progress card.
 * Header (title + subtitle + optional [header] actions) + progress bar (percent
 * from the `percent` input, falling back to `data().percent`) + stage steps
 * row. When `clickable`, the whole card is a button emitting `open` with the
 * data. Ported from invesmarket transaction-progress pattern, adapted to
 * tokens + ds-icon. Purely presentational.
 */
@Component({
  selector: 'ds-progress-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-pi' },
  template: `
    <div class="ds-pi__card" [class.ds-pi__card--btn]="clickable()" (click)="onOpen()">
      <div class="ds-pi__top">
        <div class="ds-pi__titles">
          <h3 class="ds-pi__title">{{ data().title }}</h3>
          @if (data().subtitle) { <p class="ds-pi__subtitle">{{ data().subtitle }}</p> }
        </div>
        <div class="ds-pi__actions">
          <ng-content select="[header]"/>
        </div>
      </div>
      <div class="ds-pi__bar">
        <div class="ds-pi__bar-track">
          <div class="ds-pi__bar-fill" [style.width.%]="value()"></div>
        </div>
        <span class="ds-pi__percent">{{ value() }}%</span>
      </div>
      <div class="ds-pi__stages">
        @for (stage of data().stages; track stage.label) {
          <div class="ds-pi__stage" [class.ds-pi__stage--active]="stage.status === 'active'"
               [class.ds-pi__stage--inactive]="stage.status === 'inactive'">
            <span class="ds-pi__stage-dot"></span>
            <span class="ds-pi__stage-label">{{ stage.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block; width: 100%;
      font-family: var(--ds-font-sans);
    }
    .ds-pi__card {
      display: flex; flex-direction: column; gap: var(--ds-space-3);
      background: var(--ds-component-card-bg); color: var(--ds-component-card-on);
      border: 1px solid var(--ds-component-card-border);
      border-radius: var(--ds-component-card-radius);
      box-shadow: var(--ds-component-card-shadow);
      padding: var(--ds-space-4) var(--ds-space-5);
    }
    .ds-pi__card--btn {
      cursor: pointer; width: 100%; text-align: left; font-family: inherit;
      transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
    }
    .ds-pi__card--btn:hover { border-color: var(--ds-color-brand-primary); }
    .ds-pi__top { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ds-space-3); }
    .ds-pi__titles { min-width: 0; }
    .ds-pi__title { font-size: var(--ds-text-heading-4); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); margin: 0; }
    .ds-pi__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
    .ds-pi__actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-pi__bar { display: flex; align-items: center; gap: var(--ds-space-3); }
    .ds-pi__bar-track { flex: 1; height: var(--ds-size-1-5); border-radius: var(--ds-radius-full); background: var(--ds-surface-muted); overflow: hidden; }
    .ds-pi__bar-fill { height: 100%; border-radius: var(--ds-radius-full); background: var(--ds-color-brand-primary); transition: width var(--ds-duration-normal) var(--ds-ease-standard); }
    .ds-pi__percent { font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-semibold); color: var(--ds-color-brand-primary); flex-shrink: 0; }
    .ds-pi__stages { display: flex; flex-wrap: wrap; gap: var(--ds-space-2); }
    .ds-pi__stage { display: inline-flex; align-items: center; gap: var(--ds-space-1); }
    .ds-pi__stage-dot { width: var(--ds-size-1-5); height: var(--ds-size-1-5); border-radius: var(--ds-radius-full); background: var(--ds-color-state-success); }
    .ds-pi__stage--active .ds-pi__stage-dot { background: var(--ds-color-brand-primary); box-shadow: 0 0 0 3px var(--ds-color-brand-primary-100); }
    .ds-pi__stage--inactive .ds-pi__stage-dot { background: var(--ds-surface-muted); }
    .ds-pi__stage-label { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-pi__stage--active .ds-pi__stage-label { color: var(--ds-component-card-on); font-weight: var(--ds-font-weight-medium); }
  `,
})
export class DsProgressItemComponent {
  readonly data = input.required<DsProgressItemData>();
  /** 0–100. Falls back to data().percent when omitted. */
  readonly percent = input<number | null>(null);
  /** When true, the whole card emits open on press. */
  readonly clickable = input(false);

  readonly open = output<DsProgressItemData>();

  protected readonly value = computed(() => {
    const explicit = this.percent();
    const fallback = this.data().percent;
    const v = explicit != null && Number.isFinite(explicit) ? explicit : fallback;
    return Math.min(100, Math.max(0, Math.round(Number.isFinite(v) ? v : 0)));
  });

  protected onOpen(): void {
    if (this.clickable()) this.open.emit(this.data());
  }
}