import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsContainerComponent } from '@cifraflow/design';

/** Layout section (footer): the shell footer. Chrome only, never page data. */
@Component({
  selector: 'app-console-footer-section',
  standalone: true,
  imports: [DsContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ds-container
      kind="section"
      name="console-footer"
      class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      style="color: var(--ds-color-white); font-size: var(--ds-text-caption)"
    >
      <span>INTT · Visión Cero · Analítica</span>
      <span>© {{ year }} Instituto Nacional de Transporte Terrestre</span>
    </ds-container>
  `,
})
export class ConsoleFooterSection {
  protected readonly year = new Date().getFullYear();
}
