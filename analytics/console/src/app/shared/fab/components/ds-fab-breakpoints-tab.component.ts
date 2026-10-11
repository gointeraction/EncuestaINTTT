import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ViewportService } from '../../design/system';
import { FabI18nService } from '../services/fab-i18n.service';

interface BreakpointToken {
  labelKey: string;
  token: string;
  value: string;
}

/** Tokens de breakpoints (de primitives/breakpoints.css). */
const BREAKPOINT_TOKENS: { labelKey: string; token: string }[] = [
  { labelKey: 'breakpoints.mobile', token: '--ds-breakpoint-mobile' },
  { labelKey: 'breakpoints.tablet', token: '--ds-breakpoint-tablet' },
  { labelKey: 'breakpoints.desktop', token: '--ds-breakpoint-desktop' },
];

/**
 * ds-fab-breakpoints-tab — TAB "Breakpoints": tiers responsive canónicos del
 * design system (mobile/tablet/desktop), leídos en vivo desde getComputedStyle,
 * con el tier activo según el viewport actual (ViewportService).
 */
@Component({
  selector: 'ds-fab-breakpoints-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      <div class="ds-ft__group-title">{{ i18n.t('breakpoints.current') }}</div>
      <div class="ds-ft__box ds-ft__box--active">
        <span class="ds-ft__active-tier">{{ i18n.t('breakpoints.tier.' + viewport.size()) }}</span>
        <span class="ds-ft__active-width">{{ viewport.width() }}px</span>
      </div>

      <div class="ds-ft__group-title">{{ i18n.t('breakpoints.tiers') }}</div>
      <div class="ds-ft__swatches">
        @for (t of tokens(); track t.token) {
          <div class="ds-ft__swatch" [class.ds-ft__swatch--active]="isActive(t.token)" [title]="t.token">
            <span class="ds-ft__tier-bar" [style.width.px]="tierWidth(t.token)"></span>
            <span class="ds-ft__swatch-body">
              <span class="ds-ft__swatch-label">{{ i18n.t(t.labelKey) }}</span>
              <code class="ds-ft__swatch-value">{{ t.value }}</code>
            </span>
          </div>
        }
      </div>
      @if (tokens().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de breakpoint.</div>
      }
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
    }
    .ds-ft__box {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 5px 8px;
    }
    .ds-ft__box--active { border-color: var(--ds-color-tooling-fab-notif-success); }
    .ds-ft__active-tier { font-size: 11px; font-weight: 700; color: var(--ds-color-tooling-fab-notif-success); text-transform: capitalize; }
    .ds-ft__active-width { font-family: monospace; font-size: 10px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
    .ds-ft__swatches { display: flex; flex-direction: column; gap: 3px; }
    .ds-ft__swatch {
      display: flex; align-items: center; gap: 8px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 4px 8px;
    }
    .ds-ft__swatch--active { border-color: var(--ds-color-tooling-fab-notif-success); }
    .ds-ft__tier-bar {
      width: 18px; height: 14px; border-radius: 3px; flex-shrink: 0;
      background: var(--ds-designmode-fab-active);
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
export class DsFabBreakpointsTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);
  protected readonly viewport = inject(ViewportService);

  protected readonly tokens = signal<BreakpointToken[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.tokens.set(
      BREAKPOINT_TOKENS.map((t) => ({
        labelKey: t.labelKey,
        token: t.token,
        value: cs.getPropertyValue(t.token).trim(),
      })).filter((t) => t.value),
    );
  }

  /** El tier activo según el viewport actual. */
  protected isActive(token: string): boolean {
    const size = this.viewport.size();
    if (token === '--ds-breakpoint-mobile') return size === 'mobile';
    if (token === '--ds-breakpoint-tablet') return size === 'tablet';
    if (token === '--ds-breakpoint-desktop') return size === 'desktop';
    return false;
  }

  /** Ancho visual del tier (escala proporcional para la barra). */
  protected tierWidth(token: string): number {
    const v = this.tokens().find((t) => t.token === token)?.value;
    const px = parseFloat(v ?? '0');
    return Math.min(64, Math.max(12, Math.round(px / 16)));
  }
}