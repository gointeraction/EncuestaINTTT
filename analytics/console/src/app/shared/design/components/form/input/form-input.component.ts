import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { DsFormFieldState } from '../field/form-field.component';

/**
 * ds-form-input — universal text input (standalone + OnPush). One of the form family
 * (`components/form/`): data-entry controls used ONLY inside a form (ds-form-field wraps it).
 * Token + Tailwind styling; the value is emitted via `valueChange`, touched via `blur`.
 * The BORDER reacts to `state` (DS-FORMS-001 §4): default(pristine) / success(valid) /
 * error(invalid) / warning / neutral(immutable). `neutral` is applied when the value
 * cannot be edited (readonly/disabled) — grey, non-interactive.
 */
@Component({
  selector: 'ds-form-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      [type]="type()"
      [id]="controlId() || null"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled() || state() === 'neutral'"
      [readonly]="readonly()"
      [autocomplete]="autocomplete()"
      [attr.aria-invalid]="(state() === 'error' || state() === 'warning') ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      (input)="onInput($event)"
      (blur)="blur.emit($event)"
      [class]="borderClass()"
    />
  `,
  styles: `
    :host { display: block; }
    :host input {
      transition:
        transform var(--ds-duration-fast) var(--ds-ease-standard),
        box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
    }
    /* Hover: the field lifts slightly and casts a shadow (mirrors ds-button). */
    :host input:hover:not(:disabled):not(:focus) {
      transform: translateY(-2px);
      box-shadow: var(--ds-shadow-md);
    }
    :host input:focus { transform: none; }
  `,
})
export class DsFormInputComponent {
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');
  /** Id applied to the inner <input> so a label's `for` can associate with it. */
  readonly controlId = input('');
  readonly value = input('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly autocomplete = input('');
  /** Active field state — drives the border color (DS-FORMS-001 §4). */
  readonly state = input<DsFormFieldState>('default');
  /** Id del hint/error activo (desde ds-form-field) para `aria-describedby`. */
  readonly describedBy = input<string | null>(null);
  readonly valueChange = output<string>();
  readonly blur = output<Event>();

  protected readonly borderClass = computed(() => {
    const base = 'h-11 w-full rounded-lg bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none dark:bg-gray-800 dark:text-gray-200';
    switch (this.state()) {
      case 'neutral':
        return `${base} border border-neutral-400 bg-neutral-100 text-neutral-500 cursor-not-allowed opacity-70 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400`;
      case 'success':
        return `${base} border border-success-500 dark:border-success-600`;
      case 'warning':
        return `${base} border border-warning-500 dark:border-warning-600`;
      case 'error':
        return `${base} border border-danger-500 focus:shadow-focus-ring dark:border-danger-600`;
      default:
        return `${base} border border-neutral-300 focus:border-brand-400 focus:shadow-focus-ring dark:border-neutral-700`;
    }
  });

  protected onInput($event: Event): void {
    this.valueChange.emit(($event.target as HTMLInputElement).value);
  }
}
