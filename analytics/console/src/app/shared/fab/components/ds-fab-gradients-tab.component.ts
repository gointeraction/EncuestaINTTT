import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

interface GradientToken {
  label: string;
  token: string;
  value: string;
}

/** Tokens de gradientes (de primitives/gradients.css). */
const GRADIENT_TOKENS: { label: string; token: string }[] = [
  { label: 'Primary → Accent', token: '--ds-gradient-primary-to-accent' },
  { label: 'Primary → Dark', token: '--ds-gradient-primary-to-dark' },
  { label: 'Primary → Transparent', token: '--ds-gradient-primary-to-transparent' },
  { label: 'Dark → Accent', token: '--ds-gradient-dark-to-accent' },
  { label: 'Dark → Primary', token: '--ds-gradient-dark-to-primary' },
  { label: 'Dark → Transparent', token: '--ds-gradient-dark-to-transparent' },
  { label: 'Primary 600 → 400', token: '--ds-gradient-primary-600-to-400' },
  { label: 'Primary 700 → 400', token: '--ds-gradient-primary-700-to-400' },
  { label: 'Primary 950 → 500', token: '--ds-gradient-primary-950-to-500' },
  { label: 'Accent 300 → 500', token: '--ds-gradient-accent-300-to-500' },
  { label: 'Contrast 200 → 400', token: '--ds-gradient-contrast-200-to-400' },
  { label: 'Secondary 800 → 700', token: '--ds-gradient-secondary-800-to-700' },
  { label: 'Danger → Warning', token: '--ds-gradient-danger-to-warning' },
  { label: 'Danger 700 → 400', token: '--ds-gradient-danger-700-to-400' },
  { label: 'Success 600 → 400', token: '--ds-gradient-success-600-to-400' },
  { label: 'Success → Info', token: '--ds-gradient-success-to-info' },
  { label: 'Info 600 → 400', token: '--ds-gradient-info-600-to-400' },
  { label: 'Neutral 100 → 300', token: '--ds-gradient-neutral-100-to-300' },
  { label: 'Neutral → Transparent', token: '--ds-gradient-neutral-to-transparent' },
];

/**
 * ds-fab-gradients-tab — TAB "Gradientes": tokens de gradiente del design
 * system, leídos en vivo desde getComputedStyle.
 */
@Component({
  selector: 'ds-fab-gradients-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      <div class="ds-ft__group-title">{{ i18n.t('gradients.gradients') }}</div>
      <div class="ds-ft__swatches">
        @for (t of tokens(); track t.token) {
          <div class="ds-ft__swatch" [title]="t.token">
            <span class="ds-ft__swatch-color" [style.background]="t.value"></span>
            <span class="ds-ft__swatch-body">
              <span class="ds-ft__swatch-label">{{ t.label }}</span>
              <code class="ds-ft__swatch-value">{{ t.value }}</code>
            </span>
          </div>
        }
      </div>
      @if (tokens().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de gradiente.</div>
      }
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
    }
    .ds-ft__swatches { display: grid; grid-template-columns: 1fr; gap: 3px 6px; }
    .ds-ft__swatch {
      display: flex; align-items: center; gap: 8px; min-width: 0;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 3px 6px;
    }
    .ds-ft__swatch-color {
      width: 36px; height: 18px; border-radius: 4px; flex-shrink: 0;
      border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-ft__swatch-body { display: flex; flex-direction: column; min-width: 0; }
    .ds-ft__swatch-label { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); }
    .ds-ft__swatch-value {
      font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-ft__empty { font-size: 11px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
  `],
})
export class DsFabGradientsTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly tokens = signal<GradientToken[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.tokens.set(
      GRADIENT_TOKENS.map((t) => ({
        label: t.label,
        token: t.token,
        value: cs.getPropertyValue(t.token).trim(),
      })).filter((t) => t.value),
    );
  }
}
