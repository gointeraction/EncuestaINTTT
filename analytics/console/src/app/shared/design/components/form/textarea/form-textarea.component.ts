import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { DsFormFieldState } from '../field/form-field.component';

/**
 * ds-form-textarea — universal multi-line input (standalone + OnPush). Form family
 * (`components/form/`). Emits `valueChange` and `blur`. The BORDER reacts to `state`
 * (DS-FORMS-001 §4), same contract as ds-form-input.
 */
@Component({
  selector: 'ds-form-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <textarea
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled() || state() === 'neutral'"
      [rows]="rows()"
      [attr.aria-invalid]="(state() === 'error' || state() === 'warning') ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      (input)="onInput($event)"
      (blur)="blur.emit($event)"
      [class]="borderClass()"
    ></textarea>
  `,
})
export class DsFormTextareaComponent {
  readonly value = input('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly state = input<DsFormFieldState>('default');
  readonly describedBy = input<string | null>(null);
  readonly rows = input(3);
  readonly valueChange = output<string>();
  readonly blur = output<Event>();

  protected readonly borderClass = computed(() => {
    const base = 'w-full rounded-lg bg-white px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none dark:bg-gray-800 dark:text-gray-200';
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
    this.valueChange.emit(($event.target as HTMLTextAreaElement).value);
  }
}