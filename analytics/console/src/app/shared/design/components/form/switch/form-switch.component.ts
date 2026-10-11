import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * ds-form-switch — universal toggle switch (standalone + OnPush). Form family
 * (`components/form/`). Emits `checkedChange`; label projected via ng-content.
 */
@Component({
  selector: 'ds-form-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="inline-flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [disabled]="disabled()"
        (click)="!disabled() && checkedChange.emit(!checked())"
        class="relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        [class]="checked() ? 'bg-brand-accent' : 'bg-gray-300 dark:bg-brand-800'"
      >
        <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              [class]="checked() ? 'translate-x-5' : 'translate-x-0.5'"></span>
      </button>
      <span class="text-sm"><ng-content/></span>
    </label>
  `,
})
export class DsFormSwitchComponent {
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();
}