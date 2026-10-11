import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';
import { DsButtonComponent } from '../button/button.component';

/**
 * ds-list-actions — list/datatable action bar (primary New + export + custom slot).
 * Composible: place in any header section (ds-header > .ds-h__section).
 * Composes ds-button + ds-icon; extra actions (e.g. view toggles) in ng-content.
 */
@Component({
  selector: 'ds-list-actions',
  standalone: true,
  imports: [DsIconComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0;' },
  template: `
    @if (showNew()) {
      <ds-button variant="primary" (click)="newItem.emit()">
        <ds-icon name="plus" size="sm"/>
        <span>{{ newLabel() }}</span>
      </ds-button>
    }
    @if (showRefresh()) {
      <ds-button variant="ghost" (click)="refresh.emit()">
        <ds-icon name="refresh-cw" size="sm"/>
        <span>{{ refreshLabel() }}</span>
      </ds-button>
    }
    @if (showExport()) {
      <ds-button variant="ghost" (click)="exportData.emit()">
        <ds-icon name="download" size="sm"/>
        <span>{{ exportLabel() }}</span>
      </ds-button>
    }
    <ng-content/>
  `,
})
export class DsListActionsComponent {
  readonly showNew = input(true);
  readonly showRefresh = input(true);
  readonly showExport = input(true);

  readonly newLabel = input('New');
  readonly refreshLabel = input('Refresh');
  readonly exportLabel = input('Export');

  readonly newItem = output();
  readonly refresh = output();
  readonly exportData = output();
}