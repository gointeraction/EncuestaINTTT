import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * ds-form-radio — universal radio group item (standalone + OnPush). Form family
 * (`components/form/`). A radio group is N ds-form-radio sharing the same `name`;
 * each emits `checkedChange` when selected.
 */
@Component({
  selector: 'ds-form-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="inline-flex cursor-pointer items-center gap-3">
      <input
        type="radio"
        [name]="name()"
        [value]="value()"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onChange($event)"
        class="h-5 w-5 border-brand-300 bg-white text-brand-accent focus:shadow-focus-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-800 dark:bg-gray-800"
      />
      <span class="text-sm"><ng-content/></span>
    </label>
  `,
})
export class DsFormRadioComponent {
  readonly name = input('');
  readonly value = input<any>(null);
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();

  protected onChange($event: Event): void {
    this.checkedChange.emit(($event.target as HTMLInputElement).checked);
  }
}