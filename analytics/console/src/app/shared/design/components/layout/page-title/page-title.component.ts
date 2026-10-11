import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

/**
 * ds-page-title — composable page heading.
 * Back arrow (link-style) + title, subtitle rendered BELOW the title.
 * Purely presentational; the consumer places it in the page header region.
 */
@Component({
  selector: 'ds-page-title',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%;' },
  template: `
    <div class="ds-pt__row">
      @if (showBack()) {
        <button type="button" class="ds-pt__back" (click)="back.emit()"
                [attr.aria-label]="backLabel() || 'Go back'">
          <ds-icon name="arrow-left" size="sm"/>
          @if (backLabel()) {
            <span class="ds-pt__back-label">{{ backLabel() }}</span>
          }
        </button>
      }
      <h1 class="ds-pt__title" [attr.data-field]="titleField()">{{ title() }}</h1>
    </div>
    @if (subtitle()) {
      <p class="ds-pt__subtitle" [attr.data-field]="subtitleField()">{{ subtitle() }}</p>
    }
  `,
  styles: `
    .ds-pt__row { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; }
    .ds-pt__back {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      color: var(--ds-text-muted);
      border: none; background: transparent; cursor: pointer;
      padding: var(--ds-space-1) var(--ds-space-2);
      border-radius: var(--ds-radius-md);
      font-size: var(--ds-text-small); font-weight: var(--ds-font-weight-medium);
      transition: background-color var(--ds-duration-fast) var(--ds-ease-standard),
                  color var(--ds-duration-fast) var(--ds-ease-standard);
      text-decoration: none;
    }
    .ds-pt__back:hover { background: var(--ds-surface-hover); color: var(--ds-surface-body-on); }
    .ds-pt__title {
      font-size: var(--ds-text-heading-1); font-weight: var(--ds-font-weight-bold);
      color: var(--ds-surface-body-on); line-height: 1.3; margin: 0;
    }
    .ds-pt__subtitle { font-size: var(--ds-text-small); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
  `,
})
export class DsPageTitleComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly showBack = input(true);
  readonly backLabel = input('');
  readonly titleField = input('page_title');
  readonly subtitleField = input('page_subtitle');
  readonly back = output();
}