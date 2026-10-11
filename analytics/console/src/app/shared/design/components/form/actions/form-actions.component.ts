import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsButtonComponent } from '../../actions/button/button.component';

/**
 * ds-form-actions — the ACTIONS sub-section of a form (standalone + OnPush). Form family
 * (`components/form/`). A button bar (submit primary, cancel secondary, reset ghost) whose
 * submit is ENABLED ONLY when the form is valid and not submitting — the classic dimmed-until-
 * valid behavior. By default INSIDE the form (last sub-section); the external button-bar
 * variant lives on the page and references the SAME state (valid/submitting).
 */
@Component({
  selector: 'ds-form-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsButtonComponent],
  template: `
    <div class="flex flex-col gap-3">
      <ds-button
        variant="primary"
        size="md"
        class="w-full"
        [disabled]="!valid() || submitting()"
        [loading]="submitting()"
        type="submit"
        (click)="submit.emit()"
      >{{ submitLabel() }}</ds-button>
      @if (showCancel()) {
        <ds-button variant="secondary" size="md" type="button" [disabled]="submitting()"
          (click)="cancel.emit()">{{ cancelLabel() }}</ds-button>
      }
      @if (showReset()) {
        <ds-button variant="ghost" size="md" type="button" [disabled]="submitting()"
          (click)="reset.emit()">{{ resetLabel() }}</ds-button>
      }
    </div>
  `,
})
export class DsFormActionsComponent {
  readonly valid = input(false);
  readonly submitting = input(false);
  readonly submitLabel = input('Submit');
  readonly cancelLabel = input('Cancel');
  readonly resetLabel = input('Reset');
  readonly showCancel = input(false);
  readonly showReset = input(false);
  readonly submit = output<void>();
  readonly cancel = output<void>();
  readonly reset = output<void>();
}