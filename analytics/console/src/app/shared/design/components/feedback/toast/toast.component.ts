import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DsToastTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/**
 * ds-toast — transient feedback notification (standalone + OnPush).
 * Atomic toast: tone-styled by token slots; the page owns the queue/lifetime.
 */
@Component({
  selector: 'ds-toast',
  standalone: true,
  host: {
    '[class.ds-toast--success]': "tone() === 'success'",
    '[class.ds-toast--warning]': "tone() === 'warning'",
    '[class.ds-toast--danger]': "tone() === 'danger'",
    '[class.ds-toast--info]': "tone() === 'info'",
    'role': 'status',
    'aria-live': 'polite',
    '[attr.aria-atomic]': "'true'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ds-toast__icon" aria-hidden="true"></span><span class="ds-toast__msg"><ng-content/></span>`,
  styles: `
    :host {
      display: flex; align-items: center; gap: var(--ds-gap-sm);
      border-radius: var(--ds-component-toast-radius);
      background: var(--ds-component-toast-bg);
      color: var(--ds-component-toast-on);
      border: 1px solid var(--ds-component-toast-border);
      box-shadow: var(--ds-component-toast-shadow);
      padding: var(--ds-component-toast-padding-y) var(--ds-component-toast-padding-x);
      font-family: var(--ds-font-sans);
      font-size: var(--ds-text-body);
      animation: ds-toast-in var(--ds-duration-normal) var(--ds-ease-decelerate);
    }
    :host(.ds-toast--success) {
      background: var(--ds-component-toast-success-bg);
      color: var(--ds-component-toast-success-on);
      border-color: transparent;
    }
    :host(.ds-toast--warning) {
      background: var(--ds-component-toast-warning-bg);
      color: var(--ds-component-toast-warning-on);
      border-color: transparent;
    }
    :host(.ds-toast--danger) {
      background: var(--ds-component-toast-danger-bg);
      color: var(--ds-component-toast-danger-on);
      border-color: transparent;
    }
    :host(.ds-toast--info) {
      background: var(--ds-component-toast-info-bg);
      color: var(--ds-component-toast-info-on);
      border-color: transparent;
    }
    .ds-toast__icon {
      width: var(--ds-size-2); height: var(--ds-size-2); border-radius: var(--ds-radius-full);
      background: currentColor; opacity: 0.8;
    }
    @keyframes ds-toast-in {
      from { opacity: 0; transform: translateY(calc(var(--ds-space-2) * -1)); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class DsToastComponent {
  readonly tone = input<DsToastTone>('neutral');
}