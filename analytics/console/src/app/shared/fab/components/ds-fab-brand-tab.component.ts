import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

interface BrandColorToken {
  token: string;
  value: string;
}

interface BrandFontToken {
  token: string;
  value: string;
}

/** Anclas de color de marca (de themes/default/brand.css → --ds-color-brand-*). */
const BRAND_COLOR_TOKENS: { token: string }[] = [
  { token: '--ds-color-brand-primary' },
  { token: '--ds-color-brand-accent' },
  { token: '--ds-color-brand-contrast' },
  { token: '--ds-color-brand-secondary' },
  { token: '--ds-color-brand-dark' },
];

/** Tipografías de marca (de themes/default/brand.css → --ds-font-*). */
const BRAND_FONT_TOKENS: { token: string }[] = [
  { token: '--ds-font-sans' },
  { token: '--ds-font-brand' },
];

/**
 * ds-fab-brand-tab — TAB "Marca/Brand": la identidad del branding del tema.
 * Muestra los anclas de color de marca (--ds-color-brand-*) y las familias
 * tipográficas de marca (--ds-font-sans / --ds-font-brand), leídos en vivo
 * desde getComputedStyle. Las escalas 50–950 derivadas se re-usan del tab
 * de colores utilitarios (que aquí NO se repiten).
 */
@Component({
  selector: 'ds-fab-brand-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      <div class="ds-ft__group-title">{{ i18n.t('brand.colors') }}</div>
      <div class="ds-ft__swatches">
        @for (c of colors(); track c.token) {
          <div class="ds-ft__swatch" [title]="c.token">
            <span class="ds-ft__swatch-color" [style.background]="c.value"></span>
            <span class="ds-ft__swatch-body">
              <span class="ds-ft__swatch-label">{{ brandLabel(c.token) }}</span>
              <code class="ds-ft__swatch-value">{{ c.token }} · {{ c.value }}</code>
            </span>
          </div>
        }
      </div>
      @if (colors().length === 0) {
        <div class="ds-ft__empty">No se encontraron colores de marca.</div>
      }

      <div class="ds-ft__group-title ds-ft__group-title--mt">{{ i18n.t('brand.typography') }}</div>
      <div class="ds-ft__swatches">
        @for (f of fonts(); track f.token) {
          <div class="ds-ft__swatch" [title]="f.token">
            <span class="ds-ft__swatch-color ds-ft__swatch-color--type" [style.font-family]="f.value">Ag</span>
            <span class="ds-ft__swatch-body">
              <span class="ds-ft__swatch-label">{{ fontLabel(f.token) }}</span>
              <code class="ds-ft__swatch-value">{{ f.token }}</code>
            </span>
          </div>
        }
      </div>
      @if (fonts().length === 0) {
        <div class="ds-ft__empty">No se encontraron tipografías de marca.</div>
      }
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
    }
    .ds-ft__group-title--mt { margin-top: 6px; }
    .ds-ft__swatches { display: flex; flex-direction: column; gap: 3px; }
    .ds-ft__swatch {
      display: flex; align-items: center; gap: 8px; min-width: 0;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 3px 6px;
    }
    .ds-ft__swatch-color {
      width: 36px; height: 22px; border-radius: 4px; flex-shrink: 0;
      border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-ft__swatch-color--type {
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: var(--ds-designmode-inspector-on);
      width: 36px; height: 22px;
    }
    .ds-ft__swatch-body { display: flex; flex-direction: column; min-width: 0; }
    .ds-ft__swatch-label { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); text-transform: capitalize; }
    .ds-ft__swatch-value {
      font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-ft__empty { font-size: 11px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
  `],
})
export class DsFabBrandTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly colors = signal<BrandColorToken[]>([]);
  protected readonly fonts = signal<BrandFontToken[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.colors.set(
      BRAND_COLOR_TOKENS.map((t) => ({ token: t.token, value: cs.getPropertyValue(t.token).trim() }))
        .filter((t) => t.value),
    );
    this.fonts.set(
      BRAND_FONT_TOKENS.map((t) => ({ token: t.token, value: cs.getPropertyValue(t.token).trim() }))
        .filter((t) => t.value),
    );
  }

  /** Label amigable del color de marca (primary → "Primary", etc.). */
  protected brandLabel(token: string): string {
    const name = token.replace('--ds-color-brand-', '');
    return name;
  }

  /** Label amigable de la tipografía de marca. */
  protected fontLabel(token: string): string {
    return token === '--ds-font-sans' ? 'Sans' : 'Brand';
  }
}