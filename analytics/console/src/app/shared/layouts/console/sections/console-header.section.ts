import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DsContainerComponent } from '@cifraflow/design';

/**
 * Layout section (header): the console identity — INTT logo + title/subtitle.
 * This is CHROME: it reads the app identity, never page data.
 */
@Component({
  selector: 'app-console-header-section',
  standalone: true,
  imports: [NgOptimizedImage, DsContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <ds-container kind="section" name="console-header" class="flex items-center gap-3">
      <img
        ngSrc="/intt-logo.png"
        width="110"
        height="30"
        [priority]="true"
        alt="INTT — Instituto Nacional de Transporte Terrestre"
        class="w-24 shrink-0 sm:w-28"
      />
      <div class="flex min-w-0 flex-col">
        <span class="truncate font-semibold" style="color: var(--ds-color-white)">
          Visión Cero · Analítica
        </span>
        <span
          class="hidden truncate sm:block"
          style="color: var(--ds-color-white); opacity: 0.8; font-size: var(--ds-text-caption)"
        >
          Encuesta Nacional de Conductores
        </span>
      </div>
    </ds-container>
  `,
})
export class ConsoleHeaderSection {}
