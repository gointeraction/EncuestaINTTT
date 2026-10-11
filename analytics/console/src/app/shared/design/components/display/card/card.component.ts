import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ds-card — dashboard card container (base of all dashboard widgets).
 * Pure structure (patrón D-UX-3): slots [header], body (ng-content), [footer].
 * Any ds-* component can go in any region. No layout logic here.
 *
 *   <ds-card title="Recent Activity" [showFooter]="true">
 *     <ng-container header>
 *       <ds-dashboard-actions (refresh)="onRefresh()"/>
 *     </ng-container>
 *     … card body …
 *     <ng-container footer>
 *       <ds-pagination [page]="1" [total]="10" (pageChange)="onPage($event)"/>
 *     </ng-container>
 *   </ds-card>
 */
@Component({
  selector: 'ds-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-card' },
  template: `
    @if (hasHeader()) {
      <header class="ds-card__header">
        <div class="ds-card__heading">
          @if (icon()) {
            <span class="ds-card__icon" aria-hidden="true">{{ icon() }}</span>
          }
          <div class="ds-card__titles">
            <h3 class="ds-card__title">{{ title() }}</h3>
            @if (subtitle()) { <p class="ds-card__subtitle">{{ subtitle() }}</p> }
          </div>
        </div>
        <div class="ds-card__actions">
          <ng-content select="[header]"/>
        </div>
      </header>
    }
    <div class="ds-card__body">
      <ng-content/>
    </div>
    @if (showFooter()) {
      <footer class="ds-card__footer">
        <ng-content select="[footer]"/>
      </footer>
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
    .ds-card__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5);
      flex-shrink: 0;
    }
    .ds-card__heading { display: flex; align-items: center; gap: var(--ds-space-2); min-width: 0; }
    .ds-card__icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-7); height: var(--ds-size-7);
      border-radius: var(--ds-radius-md);
      background: var(--ds-surface-muted); color: var(--ds-text-muted);
      flex-shrink: 0;
    }
    .ds-card__titles { min-width: 0; }
    .ds-card__title {
      font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-component-card-on); margin: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .ds-card__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
    .ds-card__actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-card__body { flex: 1; padding: var(--ds-space-4) var(--ds-space-5); min-width: 0; }
    .ds-card__footer {
      display: flex; align-items: center; justify-content: flex-end;
      gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-5);
      border-top: 1px solid var(--ds-border-divider); flex-shrink: 0;
    }
  `,
})
export class DsCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input('');
  readonly showFooter = input(false);

  protected hasHeader(): boolean {
    return this.title() !== '' || this.subtitle() !== '' || this.icon() !== '';
  }
}