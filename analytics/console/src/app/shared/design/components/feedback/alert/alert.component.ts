import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsAlertTone = 'info' | 'success' | 'warning' | 'danger';

/**
 * ds-alert — universal alert (standalone + OnPush).
 * Tones: info / success / warning / danger. Optional dismiss button that
 * emits (dismissed) so the parent controls removal (keeps component dumb).
 */
@Component({
  selector: 'ds-alert',
  standalone: true,
  imports: [DsIconComponent],
  host: {
    '[class.ds-alert--info]': "tone() === 'info'",
    '[class.ds-alert--success]': "tone() === 'success'",
    '[class.ds-alert--warning]': "tone() === 'warning'",
    '[class.ds-alert--danger]': "tone() === 'danger'",
    '[attr.role]': "tone() === 'danger' || tone() === 'warning' ? 'alert' : 'status'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-alert__body">
      <ng-content/>
    </div>
    @if (dismissible()) {
      <button class="ds-alert__close" (click)="onDismiss()" aria-label="Dismiss">
        <ds-icon name="x" size="xs"/>
      </button>
    }
  `,
  styles: `
    :host {
      display: flex; align-items: flex-start; gap: var(--ds-space-3);
      border-radius: var(--ds-component-alert-radius);
      padding: var(--ds-component-alert-padding);
    }
    :host(.ds-alert--info) { background: var(--ds-status-surface-info); color: var(--ds-status-surface-info-on); border: 1px solid var(--ds-status-surface-info); }
    :host(.ds-alert--success) { background: var(--ds-status-surface-success); color: var(--ds-status-surface-success-on); border: 1px solid var(--ds-status-surface-success); }
    :host(.ds-alert--warning) { background: var(--ds-status-surface-warning); color: var(--ds-status-surface-warning-on); border: 1px solid var(--ds-status-surface-warning); }
    :host(.ds-alert--danger) { background: var(--ds-status-surface-danger); color: var(--ds-status-surface-danger-on); border: 1px solid var(--ds-status-surface-danger); }
    .ds-alert__body { flex: 1; }
    .ds-alert__close { background: none; border: none; cursor: pointer; color: inherit; padding: var(--ds-space-1); border-radius: var(--ds-radius-sm); display: flex; }
    .ds-alert__close:hover { background: var(--ds-surface-hover); }
  `,
})
export class DsAlertComponent {
  readonly tone = input<DsAlertTone>('info');
  readonly dismissible = input(false);
  readonly dismissed = output();

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}