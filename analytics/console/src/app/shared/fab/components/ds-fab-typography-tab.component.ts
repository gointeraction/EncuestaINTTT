import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

interface FontToken {
  label: string;
  token: string;
  value: string;
}

/** Tokens de familia y peso tipográficos (de primitives/typography.css). */
const FONT_GROUPS: { title: string; tokens: { label: string; token: string }[] }[] = [
  {
    title: 'typography.families',
    tokens: [
      { label: 'Sans', token: '--ds-font-sans' },
      { label: 'Brand', token: '--ds-font-brand' },
      { label: 'Serif', token: '--ds-font-serif' },
      { label: 'Mono', token: '--ds-font-mono' },
    ],
  },
  {
    title: 'typography.weights',
    tokens: [
      { label: 'Regular', token: '--ds-font-weight-regular' },
      { label: 'Medium', token: '--ds-font-weight-medium' },
      { label: 'Semibold', token: '--ds-font-weight-semibold' },
      { label: 'Bold', token: '--ds-font-weight-bold' },
    ],
  },
];

/** Escala tipográfica base: token + sufijo de line-height. */
const TEXT_SCALE: { label: string; token: string }[] = [
  { label: 'Display 1', token: '--ds-text-display-1' },
  { label: 'Display 2', token: '--ds-text-display-2' },
  { label: 'Display 3', token: '--ds-text-display-3' },
  { label: 'Display 4', token: '--ds-text-display-4' },
  { label: 'Heading 1', token: '--ds-text-heading-1' },
  { label: 'Heading 2', token: '--ds-text-heading-2' },
  { label: 'Heading 3', token: '--ds-text-heading-3' },
  { label: 'Heading 4', token: '--ds-text-heading-4' },
  { label: 'Heading 5', token: '--ds-text-heading-5' },
  { label: 'Heading 6', token: '--ds-text-heading-6' },
  { label: 'Body', token: '--ds-text-body' },
  { label: 'Small', token: '--ds-text-small' },
  { label: 'Caption', token: '--ds-text-caption' },
  { label: 'Label', token: '--ds-text-label' },
  { label: 'Button', token: '--ds-text-button' },
  { label: 'Input', token: '--ds-text-input' },
  { label: 'Large', token: '--ds-text-large' },
];

/**
 * ds-fab-typography-tab — TAB "Tipografía": tokens base de familias, pesos y la
 * escala tipográfica (tamaño + line-height), y las fuentes realmente cargadas.
 */
@Component({
  selector: 'ds-fab-typography-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      @for (group of groups(); track group.title) {
        <div class="ds-ft__group">
          <div class="ds-ft__group-title">{{ i18n.t(group.title) }}</div>
          <div class="ds-ft__swatches">
            @for (t of group.tokens; track t.token) {
              <div class="ds-ft__swatch" [title]="t.token">
                <span class="ds-ft__swatch-color ds-ft__swatch-color--type"
                      [style.font-family]="group.title === 'typography.families' ? t.value : undefined"
                      [style.font-weight]="group.title === 'typography.weights' ? t.value : undefined">Ag</span>
                <span class="ds-ft__swatch-body">
                  <span class="ds-ft__swatch-label">{{ t.label }}</span>
                  <code class="ds-ft__swatch-value">{{ t.value }}</code>
                </span>
              </div>
            }
          </div>
        </div>
      }

      <div class="ds-ft__group">
        <div class="ds-ft__group-title">{{ i18n.t('typography.scale') }}</div>
        <div class="ds-ft__box">
          @for (s of scale(); track s.label) {
            <div class="ds-ft__scale-row">
              <span class="ds-ft__scale-label">{{ s.label }}</span>
              <code class="ds-ft__scale-size">{{ s.size }}</code>
              @if (s.line) { <code class="ds-ft__scale-line">lh {{ s.line }}</code> }
            </div>
          }
        </div>
      </div>

      <div class="ds-ft__group">
        <div class="ds-ft__group-title">{{ i18n.t('typography.loadedFonts') }}</div>
        <div class="ds-ft__box">
          @if (fonts().length > 0) {
            @for (f of fonts(); track f) {
              <div class="ds-ft__scale-row">
                <span class="ds-ft__scale-label" [style.font-family]="f">{{ f }}</span>
                <code class="ds-ft__scale-size">{{ i18n.t('typography.active') }}</code>
              </div>
            }
          } @else {
            <div class="ds-ft__empty">{{ i18n.t('typography.noFonts') }}</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
    }
    .ds-ft__swatches { display: flex; flex-direction: column; gap: 3px; }
    .ds-ft__swatch {
      display: flex; align-items: center; gap: 8px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 3px 6px;
    }
    .ds-ft__swatch-color {
      width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
      border: 1px solid var(--ds-designmode-control-border);
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: var(--ds-designmode-inspector-on);
    }
    .ds-ft__swatch-body { display: flex; flex-direction: column; min-width: 0; }
    .ds-ft__swatch-label { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); }
    .ds-ft__swatch-value {
      font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-ft__box {
      display: flex; flex-direction: column; gap: 2px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 5px 8px;
    }
    .ds-ft__scale-row {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .ds-ft__scale-label { font-size: 10px; color: var(--ds-designmode-inspector-on); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .ds-ft__scale-size { font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); }
    .ds-ft__scale-line { font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.6; }
    .ds-ft__empty { font-size: 11px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
  `],
})
export class DsFabTypographyTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly groups = signal<{ title: string; tokens: FontToken[] }[]>([]);
  protected readonly scale = signal<{ label: string; size: string; line: string }[]>([]);
  protected readonly fonts = signal<string[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.groups.set(
      FONT_GROUPS.map((g) => ({
        title: g.title,
        tokens: g.tokens.map((t) => ({
          label: t.label,
          token: t.token,
          value: cs.getPropertyValue(t.token).trim(),
        })).filter((t) => t.value),
      })).filter((g) => g.tokens.length > 0),
    );
    this.scale.set(
      TEXT_SCALE.map((t) => {
        const size = cs.getPropertyValue(t.token).trim();
        const line = cs.getPropertyValue(`${t.token}-line`).trim();
        return { label: t.label, size, line };
      }).filter((s) => s.size),
    );
    try {
      const loaded = Array.from(this.document.fonts).map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i);
      this.fonts.set(loaded);
    } catch {
      this.fonts.set([]);
    }
  }
}