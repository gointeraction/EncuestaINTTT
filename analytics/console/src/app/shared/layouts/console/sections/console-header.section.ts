import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * Layout section (header, left): INTT logo + a title. Chrome only; reusable por
 * cualquier layout (analítica/administración/hub) pasando `title`.
 */
@Component({
  selector: 'app-console-header-section',
  standalone: true,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <div class="flex min-w-0 items-center gap-3">
      <img
        ngSrc="/intt-logo.png"
        width="110"
        height="30"
        [priority]="true"
        alt="INTT — Instituto Nacional de Transporte Terrestre"
        class="w-20 shrink-0 sm:w-24"
      />
      <span class="truncate font-semibold" style="font-size: var(--ds-text-body)">
        {{ title() }}
      </span>
    </div>
  `,
})
export class ConsoleHeaderSection {
  readonly title = input('Visión Cero - Analítica');
}
