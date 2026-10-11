import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

/** Un token de efecto: label + token CSS + valor resuelto. */
interface EffectToken {
  label: string;
  token: string;
  value: string;
}

interface EffectGroup {
  title: string;
  tokens: EffectToken[];
}

/** Token de efecto en su forma fuente (sin valor resuelto aún). */
type EffectTokenSource = { label: string; token: string };
type EffectGroupSource = { title: string; tokens: EffectTokenSource[] };

/** Tokens de duración y easing (de primitives/effects.css). */
const EFFECT_GROUPS: EffectGroupSource[] = [
  {
    title: 'effects.duration',
    tokens: [
      { label: 'Instant', token: '--ds-duration-instant' },
      { label: 'Fast', token: '--ds-duration-fast' },
      { label: 'Normal', token: '--ds-duration-normal' },
      { label: 'Slow', token: '--ds-duration-slow' },
      { label: 'Slower', token: '--ds-duration-slower' },
    ],
  },
  {
    title: 'effects.easing',
    tokens: [
      { label: 'Standard', token: '--ds-ease-standard' },
      { label: 'Decelerate', token: '--ds-ease-decelerate' },
      { label: 'Accelerate', token: '--ds-ease-accelerate' },
      { label: 'Linear', token: '--ds-ease-linear' },
      { label: 'Bounce', token: '--ds-ease-bounce' },
    ],
  },
];

/**
 * ds-fab-effects-tab — TAB "Efectos": duraciones y easing del design system,
 * leídos en vivo desde getComputedStyle.
 */
@Component({
  selector: 'ds-fab-effects-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      @for (group of groups(); track group.title) {
        <div class="ds-ft__group">
          <div class="ds-ft__group-title">{{ i18n.t(group.title) }}</div>
          <div class="ds-ft__rows">
            @for (t of group.tokens; track t.token) {
              <div class="ds-ft__row" [title]="t.token">
                <span class="ds-ft__row-label">{{ t.label }}</span>
                <code class="ds-ft__row-value">{{ t.value }}</code>
              </div>
            }
          </div>
        </div>
      }
      @if (groups().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de efecto.</div>
      }
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
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
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-ft__empty { font-size: 11px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
  `],
})
export class DsFabEffectsTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly groups = signal<EffectGroup[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.groups.set(
      EFFECT_GROUPS.map((g) => ({
        title: g.title,
        tokens: g.tokens.map((t) => ({
          label: t.label,
          token: t.token,
          value: cs.getPropertyValue(t.token).trim(),
        })).filter((t) => t.value),
      })).filter((g) => g.tokens.length > 0),
    );
  }
}
