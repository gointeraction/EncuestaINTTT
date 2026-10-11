import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

interface ShadowToken {
  label: string;
  token: string;
  value: string;
}

/** Tokens de sombras y z-index (de primitives/shadows.css). */
const SHADOW_TOKENS: { label: string; token: string }[] = [
  { label: 'XS', token: '--ds-shadow-xs' },
  { label: 'SM', token: '--ds-shadow-sm' },
  { label: 'MD', token: '--ds-shadow-md' },
  { label: 'LG', token: '--ds-shadow-lg' },
  { label: 'XL', token: '--ds-shadow-xl' },
  { label: 'Brand SM', token: '--ds-shadow-brand-sm' },
  { label: 'Brand MD', token: '--ds-shadow-brand-md' },
  { label: 'Brand LG', token: '--ds-shadow-brand-lg' },
  { label: 'Brand Glow', token: '--ds-shadow-brand-glow' },
  { label: 'Inset', token: '--ds-shadow-inset' },
  { label: 'Focus', token: '--ds-shadow-focus' },
];

/** Tokens de z-index (nivel de apilamiento). */
const Z_TOKENS: { label: string; token: string }[] = [
  { label: 'Base', token: '--ds-z-base' },
  { label: 'Sticky', token: '--ds-z-sticky' },
  { label: 'Overlay', token: '--ds-z-overlay' },
  { label: 'Modal', token: '--ds-z-modal' },
  { label: 'Toast', token: '--ds-z-toast' },
  { label: 'Tooltip', token: '--ds-z-tooltip' },
];

/**
 * ds-fab-shadows-tab — TAB "Sombras": sombras y z-index del design system,
 * leídos en vivo desde getComputedStyle.
 */
@Component({
  selector: 'ds-fab-shadows-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      <div class="ds-ft__group-title">{{ i18n.t('shadows.shadows') }}</div>
      <div class="ds-ft__swatches">
        @for (t of shadows(); track t.token) {
          <div class="ds-ft__swatch" [title]="t.token">
            <span class="ds-ft__swatch-color" [style.box-shadow]="t.value"></span>
            <span class="ds-ft__swatch-body">
              <span class="ds-ft__swatch-label">{{ t.label }}</span>
              <code class="ds-ft__swatch-value">{{ t.value }}</code>
            </span>
          </div>
        }
      </div>
      @if (shadows().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de sombra.</div>
      }

      <div class="ds-ft__group-title ds-ft__group-title--mt">{{ i18n.t('shadows.zIndex') }}</div>
      <div class="ds-ft__rows">
        @for (t of zLevels(); track t.token) {
          <div class="ds-ft__row" [title]="t.token">
            <span class="ds-ft__row-label">{{ t.label }}</span>
            <code class="ds-ft__row-value">{{ t.value }}</code>
          </div>
        }
      </div>
      @if (zLevels().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de z-index.</div>
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
    .ds-ft__swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 6px; }
    .ds-ft__swatch {
      display: flex; align-items: center; gap: 8px; min-width: 0;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 3px 6px;
    }
    .ds-ft__swatch-color {
      width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
      background: var(--ds-designmode-inspector-bg);
    }
    .ds-ft__swatch-body { display: flex; flex-direction: column; min-width: 0; }
    .ds-ft__swatch-label { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); }
    .ds-ft__swatch-value {
      font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-ft__rows { display: flex; flex-direction: column; gap: 3px; }
    .ds-ft__row {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 3px 8px;
    }
    .ds-ft__row-label { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); }
    .ds-ft__row-value {
      font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7;
    }
    .ds-ft__empty { font-size: 11px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
  `],
})
export class DsFabShadowsTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly shadows = signal<ShadowToken[]>([]);
  protected readonly zLevels = signal<ShadowToken[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.shadows.set(
      SHADOW_TOKENS.map((t) => ({
        label: t.label,
        token: t.token,
        value: cs.getPropertyValue(t.token).trim(),
      })).filter((t) => t.value),
    );
    this.zLevels.set(
      Z_TOKENS.map((t) => ({
        label: t.label,
        token: t.token,
        value: cs.getPropertyValue(t.token).trim(),
      })).filter((t) => t.value),
    );
  }
}
