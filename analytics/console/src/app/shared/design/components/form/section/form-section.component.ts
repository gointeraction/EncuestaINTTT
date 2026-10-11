import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ds-form-section — a titled BLOCK (sub-section) of a form (standalone + OnPush). Form family
 * (`components/form/`). A form is a ds-section whose interior is ordered ds-form-section
 * blocks (informative / fields / actions / specific). The title is the block's header; the
 * content is projected.
 */
@Component({
  selector: 'ds-form-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex flex-col gap-4">
      @if (title(); as t) {
        <h3 class="text-base font-semibold" style="color: var(--ds-text-primary)">{{ t }}</h3>
      }
      @if (description(); as d) {
        <p class="text-sm" style="color: var(--ds-text-muted)">{{ d }}</p>
      }
      <div class="flex flex-col gap-4"><ng-content/></div>
    </section>
  `,
})
export class DsFormSectionComponent {
  readonly title = input('');
  readonly description = input('');
}