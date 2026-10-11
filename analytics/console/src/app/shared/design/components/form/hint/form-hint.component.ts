import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ds-form-hint — informative element of a form (standalone + OnPush). Form family
 * (`components/form/`): the INFORMATIVE sub-section elements (help, comments, notes).
 * `tone` distinguishes a neutral help, a note, or a warning comment.
 */
@Component({
  selector: 'ds-form-hint',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-sm" [class]="toneClass">
      <ng-content/>
    </p>
  `,
})
export class DsFormHintComponent {
  readonly tone = input<'help' | 'note' | 'warning'>('help');
  protected get toneClass(): string {
    switch (this.tone()) {
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'note': return 'text-brand-700 dark:text-brand-300';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  }
}