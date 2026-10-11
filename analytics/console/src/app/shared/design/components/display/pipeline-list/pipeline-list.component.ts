import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type DsPipelineTone = 'brand' | 'info' | 'success' | 'warning' | 'danger';

export interface DsPipelineStage {
  id: string;
  label: string;
  count: number;
  /** 0–100. When omitted, derived from count / total. */
  percent?: number;
  tone?: DsPipelineTone;
  status?: 'completed' | 'active' | 'inactive';
}

const STAGE_COLOR: Record<DsPipelineTone, string> = {
  brand: 'var(--ds-color-brand-primary)',
  info: 'var(--ds-color-state-info)',
  success: 'var(--ds-color-state-success)',
  warning: 'var(--ds-color-state-warning)',
  danger: 'var(--ds-color-state-danger)',
};

/**
 * ds-pipeline-list — dashboard pipeline/funnel with per-stage progress.
 * Card header + one row per stage: label, count, progress bar (stage.percent
 * or derived from count/total) and % value. Replaces the hand-rolled funnels
 * (invesbiz sources, invesagent pipeline, orderer inspection pipeline,
 * invesmarket transaction progress).
 */
@Component({
  selector: 'ds-pipeline-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-pl' },
  template: `
    <header class="ds-pl__header">
      <div class="ds-pl__titles">
        <h3 class="ds-pl__title">{{ title() }}</h3>
        @if (subtitle()) { <p class="ds-pl__subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="ds-pl__actions">
        <ng-content select="[header]"/>
        @if (showTotal()) {
          <span class="ds-pl__total">{{ total() }} {{ unit() }}</span>
        }
      </div>
    </header>
    <div class="ds-pl__list">
      @for (stage of stages(); track stage.id) {
        <button type="button" class="ds-pl__row" [class.ds-pl__row--clickable]="clickable()"
                [disabled]="!clickable() || null" (click)="stageClick.emit(stage)">
          <span class="ds-pl__top">
            <span class="ds-pl__label">{{ stage.label }}</span>
            <span class="ds-pl__count">
              <b>{{ stage.count }}</b>
              <span class="ds-pl__pct">{{ percentOf(stage) }}%</span>
            </span>
          </span>
          <span class="ds-pl__track">
            <span class="ds-pl__fill" [style.width.%]="percentOf(stage)"
                  [style.background]="stageColor(stage)"></span>
          </span>
        </button>
      } @empty {
        <p class="ds-pl__empty">{{ emptyLabel() }}</p>
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
    .ds-pl__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5); flex-shrink: 0;
    }
    .ds-pl__titles { min-width: 0; }
    .ds-pl__title { font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); margin: 0; }
    .ds-pl__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
    .ds-pl__actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-pl__total { font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-semibold); color: var(--ds-text-muted); }
    .ds-pl__list { flex: 1; display: flex; flex-direction: column; gap: var(--ds-space-2); padding: 0 var(--ds-space-5) var(--ds-space-4); }
    .ds-pl__row {
      display: flex; flex-direction: column; gap: var(--ds-space-1);
      width: 100%; padding: 0; border: none; background: transparent; cursor: default;
      font-family: inherit;
    }
    .ds-pl__row--clickable { cursor: pointer; }
    .ds-pl__row[disabled] { opacity: 1; }
    .ds-pl__top { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-2); }
    .ds-pl__label { font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-medium); color: var(--ds-component-card-on); }
    .ds-pl__count { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-text-small); color: var(--ds-component-card-on); }
    .ds-pl__pct { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-pl__track { height: var(--ds-size-1-5); border-radius: var(--ds-radius-full); background: var(--ds-surface-muted); overflow: hidden; }
    .ds-pl__fill { display: block; height: 100%; border-radius: var(--ds-radius-full); transition: width var(--ds-duration-normal) var(--ds-ease-standard); }
    .ds-pl__empty { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; padding: var(--ds-space-3) 0; }
  `,
})
export class DsPipelineListComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly stages = input.required<DsPipelineStage[]>();
  readonly unit = input('total');
  readonly showTotal = input(true);
  readonly clickable = input(false);
  readonly emptyLabel = input('—');

  readonly stageClick = output<DsPipelineStage>();

  protected readonly total = computed(() =>
    this.stages().reduce((sum, s) => sum + (Number.isFinite(s.count) ? s.count : 0), 0),
  );

  protected percentOf(stage: DsPipelineStage): number {
    if (stage.percent != null && Number.isFinite(stage.percent)) {
      return Math.min(100, Math.max(0, Math.round(stage.percent)));
    }
    const total = this.total();
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((stage.count / total) * 100)));
  }

  protected stageColor(stage: DsPipelineStage): string {
    return STAGE_COLOR[(stage.tone ?? 'brand')];
  }
}