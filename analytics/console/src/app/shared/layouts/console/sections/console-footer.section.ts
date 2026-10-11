import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Layout section (footer): the shell footer. Chrome only, never page data. */
@Component({
  selector: 'app-console-footer-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div
      class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      style="font-size: var(--ds-text-caption)"
    >
      <span>INTT · Visión Cero · Analítica</span>
      <span>© {{ year }} Instituto Nacional de Transporte Terrestre</span>
    </div>
  `,
})
export class ConsoleFooterSection {
  protected readonly year = new Date().getFullYear();
}
