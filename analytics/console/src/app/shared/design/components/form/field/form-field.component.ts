import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DsFormFieldState = 'default' | 'neutral' | 'success' | 'warning' | 'error';

let nextFieldId = 0;

/**
 * ds-form-field — universal form field wrapper (standalone + OnPush).
 * Anatomy (DS-FORMS-001 §3): label + control slot + hint (shown on focus) + errors[]
 * (one <p> per detected error). The control is projected via <ng-content/> so any
 * control type works. `state` propagates to the control (border is the control's job).
 * A11y (R5 / DS-FORMS-001 §7): the active hint/error id is exposed via `describedBy`
 * for the consumer's `[attr.aria-describedby]`.
 */
@Component({
  selector: 'ds-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ds-form-field--error]': "state() === 'error'",
    '[class.ds-form-field--success]': "state() === 'success'",
    '[class.ds-form-field--warning]': "state() === 'warning'",
    '[class.ds-form-field--neutral]': "state() === 'neutral'",
    '[attr.aria-live]': "state() === 'error' || state() === 'warning' ? 'polite' : null",
  },
  template: `
    @if (label(); as l) {
      <label class="ds-field__label" [attr.for]="for()">
        {{ l }}@if (required()) { <span class="ds-field__required" aria-hidden="true">*</span> }
      </label>
    }
    <div class="ds-field__control"><ng-content/></div>
    @if ((state() === 'error' || state() === 'warning') && shownErrors().length > 0) {
      @for (err of shownErrors(); track err; let i = $index) {
        <p class="ds-field__message ds-field__message--{{ state() }}" [id]="i === 0 ? messageId : undefined">{{ err }}</p>
      }
    } @else if (hint(); as h) {
      <p class="ds-field__message ds-field__message--hint" [id]="hintId">{{ h }}</p>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--ds-gap-sm); }
    .ds-field__label {
      font-size: var(--ds-text-label); font-weight: var(--ds-font-weight-medium);
      color: var(--ds-surface-elevated-on);
    }
    .ds-field__required { color: var(--ds-status-danger); margin-left: 2px; }
    .ds-field__control { display: block; }

    /* hint: invisible until the control is focused (DS-FORMS-001 §3) */
    .ds-field__message--hint { display: none; }
    :host(:focus-within) .ds-field__message--hint { display: block; }

    .ds-field__message { font-size: var(--ds-text-caption); }
    .ds-field__message--hint { color: var(--ds-text-muted); }
    .ds-field__message--error { color: var(--ds-status-surface-error-on); }
    .ds-field__message--warning { color: var(--ds-status-surface-warning-on); }
    :host(.ds-form-field--error) .ds-field__label,
    :host(.ds-form-field--error) .ds-field__message { color: var(--ds-status-surface-error-on); }
    :host(.ds-form-field--warning) .ds-field__label,
    :host(.ds-form-field--warning) .ds-field__message { color: var(--ds-status-surface-warning-on); }
    :host(.ds-form-field--success) .ds-field__label,
    :host(.ds-form-field--success) .ds-field__message { color: var(--ds-status-surface-success-on); }
    :host(.ds-form-field--neutral) .ds-field__label { color: var(--ds-status-surface-neutral-on); }
  `,
})
export class DsFormFieldComponent {
  readonly label = input('');
  readonly for = input('');
  readonly hint = input('');
  readonly message = input('');
  /** One message per detected error (DS-FORMS-001 §3). */
  readonly errors = input<string[]>([]);
  readonly state = input<DsFormFieldState>('default');
  readonly required = input(false);

  protected readonly messageId = `ds-form-field-msg-${++nextFieldId}`;
  protected readonly hintId = `ds-form-field-hint-${++nextFieldId}`;

  protected readonly shownErrors = computed(() => {
    if (this.errors().length > 0) return this.errors();
    if (this.message()) return [this.message()];
    return [];
  });

  /** Id del mensaje/hint activo — para el `aria-describedby` del control proyectado. */
  readonly describedBy = computed<string | null>(() => {
    if ((this.state() === 'error' || this.state() === 'warning') && this.shownErrors().length > 0) return this.messageId;
    if (this.hint()) return this.hintId;
    return null;
  });
}
