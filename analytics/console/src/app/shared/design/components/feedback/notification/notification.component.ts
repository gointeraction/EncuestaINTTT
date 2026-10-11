import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsNotificationTone = 'info' | 'success' | 'warning' | 'danger';

/**
 * ds-notification — PERSISTENT notification (standalone + OnPush).
 * Unlike a toast/alert (transient, auto-dismiss), a notification STAYS VISIBLE
 * until the source REPLACES it (a new notification object) or the user DISMISSES
 * it via the close button. The host controls the lifetime.
 */
@Component({
  selector: 'ds-notification',
  standalone: true,
  imports: [DsIconComponent],
  host: {
    '[class.ds-notification--info]': "tone() === 'info'",
    '[class.ds-notification--success]': "tone() === 'success'",
    '[class.ds-notification--warning]': "tone() === 'warning'",
    '[class.ds-notification--danger]': "tone() === 'danger'",
    '[attr.role]': "tone() === 'danger' || tone() === 'warning' ? 'alert' : 'status'",
    '[attr.aria-live]': "tone() === 'danger' || tone() === 'warning' ? 'assertive' : 'polite'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="ds-notification__close" (click)="onDismiss()" aria-label="Dismiss">
      <ds-icon name="x" size="xs"/>
    </button>
    <span class="ds-notification__msg"><ng-content/></span>
  `,
  styles: `
    :host {
      display: flex; align-items: center; gap: var(--ds-space-3);
      border-radius: var(--ds-component-notification-radius);
      padding: var(--ds-component-notification-padding-y) var(--ds-component-notification-padding-x);
      background: var(--ds-component-notification-bg);
      color: var(--ds-component-notification-on);
      border: 1px solid var(--ds-component-notification-border);
    }
    :host(.ds-notification--info) {
      background: var(--ds-component-notification-info-bg);
      color: var(--ds-component-notification-info-on);
      border-color: transparent;
    }
    :host(.ds-notification--success) {
      background: var(--ds-component-notification-success-bg);
      color: var(--ds-component-notification-success-on);
      border-color: transparent;
    }
    :host(.ds-notification--warning) {
      background: var(--ds-component-notification-warning-bg);
      color: var(--ds-component-notification-warning-on);
      border-color: transparent;
    }
    :host(.ds-notification--danger) {
      background: var(--ds-component-notification-danger-bg);
      color: var(--ds-component-notification-danger-on);
      border-color: transparent;
    }
    .ds-notification__close {
      display: flex; background: none; border: none; cursor: pointer; color: inherit;
      padding: var(--ds-space-1); border-radius: var(--ds-radius-sm); opacity: 0.8;
      flex-shrink: 0;
    }
    .ds-notification__close:hover { opacity: 1; }
    .ds-notification__msg { flex: 1; font-size: var(--ds-text-body); }
  `,
})
export class DsNotificationComponent {
  readonly tone = input<DsNotificationTone>('info');
  readonly dismissed = output();

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
