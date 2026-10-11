import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';
import { DsButtonComponent } from '../button/button.component';

/**
 * ds-dashboard-actions — dashboard action bar (refresh + export + custom slot).
 * Composible: place in any header section (ds-header > .ds-h__section).
 * Composes ds-button + ds-icon; extra actions go in the ng-content slot.
 */
@Component({
  selector: 'ds-dashboard-actions',
  standalone: true,
  imports: [DsIconComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0;' },
  template: `
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
    @if (showFullscreen()) {
      <ds-button variant="ghost" (click)="fullscreen.emit()" [attr.aria-label]="'Toggle fullscreen'">
        <ds-icon name="external-link" size="sm"/>
      </ds-button>
    }
    <ng-content/>
  `,
})
export class DsDashboardActionsComponent {
  readonly showRefresh = input(true);
  readonly showExport = input(true);
  readonly showFullscreen = input(false);

  readonly refreshLabel = input('Refresh');
  readonly exportLabel = input('Export');

  readonly refresh = output();
  readonly exportData = output();
  readonly fullscreen = output();
}