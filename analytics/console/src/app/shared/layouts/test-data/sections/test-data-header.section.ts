import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/** Header del módulo test-data: logo INTT + nombre del módulo (herramienta dev). */
@Component({
  selector: 'app-test-data-header-section',
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
        Datos de prueba
      </span>
      <span class="td-tag">dev</span>
    </div>
  `,
  styles: `
    .td-tag {
      flex-shrink: 0;
      padding: 1px var(--ds-space-2);
      border-radius: 999px;
      font-size: var(--ds-text-caption);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--ds-color-brand-accent);
      color: var(--ds-color-brand-dark);
    }
  `,
})
export class TestDataHeaderSection {}
