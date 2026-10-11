import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';
import { DsButtonComponent } from '../button/button.component';

export type DsCrudMode = 'view' | 'create' | 'edit';

/**
 * ds-crud-actions — standardized CRUD action bar (mode-driven buttons).
 * Composes ds-button + ds-icon.
 */
@Component({
  selector: 'ds-crud-actions',
  standalone: true,
  imports: [DsIconComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0;' },
  template: `
    <span class="ds-crud__badge" [attr.data-mode]="mode()">{{ resolveModeLabel() }}</span>

    @switch (mode()) {
      @case ('create') {
        <ds-button variant="ghost" (click)="cancel.emit()">{{ cancelLabel() }}</ds-button>
        <ds-button variant="primary" (click)="save.emit()">
          <ds-icon name="plus" size="sm"/>
          <span>{{ createLabel() }}</span>
        </ds-button>
      }
      @case ('edit') {
        <ds-button variant="ghost" (click)="cancel.emit()">{{ cancelLabel() }}</ds-button>
        @if (showDelete()) {
          <ds-button variant="destructive" (click)="delete.emit()">
            <ds-icon name="trash" size="sm"/>
            <span>{{ deleteLabel() }}</span>
          </ds-button>
        }
        @if (showStatus()) {
          <ds-button variant="ghost" (click)="changeStatus.emit()">{{ statusLabel() }}</ds-button>
        }
        <ds-button variant="primary" (click)="save.emit()">
          <ds-icon name="check" size="sm"/>
          <span>{{ saveLabel() }}</span>
        </ds-button>
      }
      @case ('view') {
        @if (showExport()) {
          <ds-button variant="ghost" (click)="exportData.emit()">
            <ds-icon name="download" size="sm"/>
            <span>{{ exportLabel() }}</span>
          </ds-button>
        }
        <ds-button variant="secondary" (click)="editMode.emit()">
          <ds-icon name="edit" size="sm"/>
          <span>{{ editLabel() }}</span>
        </ds-button>
      }
    }
  `,
  styles: `
    .ds-crud__badge {
      font-size: var(--ds-text-caption); font-weight: var(--ds-font-weight-bold);
      text-transform: uppercase; letter-spacing: var(--ds-letter-spacing-caps);
      padding: var(--ds-space-1) var(--ds-space-2);
      border-radius: var(--ds-radius-full);
      margin-right: var(--ds-space-1);
    }
    .ds-crud__badge[data-mode="view"]   { background: var(--ds-status-surface-neutral); color: var(--ds-status-surface-neutral-on); }
    .ds-crud__badge[data-mode="create"] { background: var(--ds-status-surface-info); color: var(--ds-status-surface-info-on); }
    .ds-crud__badge[data-mode="edit"]   { background: var(--ds-status-surface-warning); color: var(--ds-status-surface-warning-on); }
  `,
})
export class DsCrudActionsComponent {
  readonly mode = input.required<DsCrudMode>();

  readonly modeLabel = input('');
  readonly createLabel = input('Create');
  readonly cancelLabel = input('Cancel');
  readonly saveLabel = input('Save Changes');
  readonly deleteLabel = input('Delete');
  readonly statusLabel = input('Status');
  readonly editLabel = input('Edit');
  readonly exportLabel = input('Export');

  readonly showDelete = input(true);
  readonly showStatus = input(false);
  readonly showExport = input(false);

  readonly save = output();
  readonly cancel = output();
  readonly delete = output();
  readonly changeStatus = output();
  readonly editMode = output();
  readonly exportData = output();

  protected resolveModeLabel(): string {
    if (this.modeLabel()) return this.modeLabel();
    const labels: Record<DsCrudMode, string> = { view: 'View', create: 'New', edit: 'Edit' };
    return labels[this.mode()];
  }
}