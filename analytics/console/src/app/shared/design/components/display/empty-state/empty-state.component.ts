import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ds-empty-state — universal empty/loading state (standalone + OnPush).
 * Icon slot + title + body + optional action. Used for empty tables, no data,
 * skeleton placeholders. Styled ONLY with tokens + Tailwind.
 */
@Component({
  selector: 'ds-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-empty-state__body">
      <div class="ds-empty-state__icon">
        <ng-content select="[icon]"/>
      </div>
      <h3 class="ds-empty-state__title">{{ title() }}</h3>
      @if (body(); as b) {
        <p class="ds-empty-state__text">{{ b }}</p>
      }
      <div class="ds-empty-state__action">
        <ng-content/>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: var(--ds-gap-md); text-align: center;
      padding: var(--ds-component-empty-padding-y) var(--ds-component-empty-padding-x);
      border-radius: var(--ds-component-empty-radius);
    }
    .ds-empty-state__icon {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-14); height: var(--ds-size-14); border-radius: var(--ds-radius-full);
      background: var(--ds-component-empty-icon-bg); color: var(--ds-component-empty-icon-on);
    }
    .ds-empty-state__title { font-size: var(--ds-text-body); font-weight: var(--ds-font-weight-semibold); color: var(--ds-surface-elevated-on); margin: 0; }
    .ds-empty-state__text { font-size: var(--ds-text-small); color: var(--ds-text-muted); margin: 0; max-width: 20rem; }
    .ds-empty-state__action { display: block; }
  `,
})
export class DsEmptyStateComponent {
  readonly title = input('');
  readonly body = input('');
}