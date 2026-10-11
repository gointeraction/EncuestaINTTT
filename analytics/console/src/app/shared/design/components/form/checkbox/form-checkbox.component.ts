import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * ds-form-checkbox — universal checkbox (standalone + OnPush). Form family
 * (`components/form/`): data-entry control used ONLY inside a form (terms/privacy, toggles).
 * Emits `checkedChange` and `blur` (the form state tracks touched via blur).
 */
@Component({
  selector: 'ds-form-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="inline-flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        (change)="onChange($event)"
        (blur)="blur.emit($event)"
        class="h-5 w-5 rounded border-brand-300 bg-white text-brand-accent focus:shadow-focus-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-800 dark:bg-gray-800"
      />
      <span class="text-sm" [style.color]="'inherit'"><ng-content/></span>
    </label>
  `,
})
export class DsFormCheckboxComponent {
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly checkedChange = output<boolean>();
  readonly blur = output<Event>();

  protected onChange($event: Event): void {
    this.checkedChange.emit(($event.target as HTMLInputElement).checked);
  }
}