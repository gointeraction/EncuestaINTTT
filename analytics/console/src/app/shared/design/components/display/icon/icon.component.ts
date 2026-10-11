import { ChangeDetectionStrategy, Component, computed, inject, input, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { type DsIconName, type DsIconSize } from './ds-icon-registry';
import { type DsExternalIconName } from './ds-external-icon-registry';
import { resolveDsIcon } from './ds-icon-source';

/**
 * Icon size presets -> pixel values. Single source of truth for icon sizes.
 */
const DS_ICON_SIZE_PX: Record<DsIconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * ds-icon — the UNIFIED icon component (standalone + OnPush).
 *
 * ONE component, THREE sources (resolved by `ds-icon-source`):
 *   - lucide  → lucide-static SVG asset, injected INLINE (currentColor, theme-aware)
 *   - fa      → Font Awesome class (rendered as <i class="fa fa-*">)
 *   - custom  → locally-stored SVG asset (vendor/custom, public/assets)
 *
 * Bare names fall back through the registries (curated lucide → custom → fa),
 * so older `<ds-icon name="x">` call-sites keep working unchanged.
 * Color defaults to currentColor. Styled ONLY with tokens.
 */
@Component({
  selector: 'ds-icon',
  standalone: true,
  host: {
    style: 'display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;',
    '[style.color]': 'color() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (faClass(); as cls) {
      <i [class]="cls" [style.font-size.px]="sizePx()" aria-hidden="true"></i>
    } @else if (svg(); as s) {
      <span class="ds-icon__svg" [innerHTML]="s"></span>
    }
  `,
  styles: `
    :host .ds-icon__svg { display: inline-flex; align-items: center; justify-content: center; }
    :host .ds-icon__svg svg { display: block; }
    :host i { line-height: 1; }
  `,
})
export class DsIconComponent {
  readonly name = input.required<DsIconName | DsExternalIconName | string>();
  readonly size = input<DsIconSize | number>('md');
  readonly strokeWidth = input<number | string>(2);
  readonly color = input('');
  readonly title = input('');

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly sizePx = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? s : DS_ICON_SIZE_PX[s];
  });

  /** FA class string (e.g. 'fa fa-home'), or null when the source is not font-awesome. */
  protected readonly faClass = signal<string | null>(null);

  /** Loaded + sized inline SVG, or null until fetched / if not an SVG source. */
  protected readonly svg = signal<SafeHtml | null>(null);

  constructor() {
    effect(() => {
      const name = this.name();
      const resolved = resolveDsIcon(name);
      if (!resolved) {
        this.faClass.set(null);
        this.svg.set(null);
        return;
      }
      if (resolved.source === 'fa') {
        this.faClass.set(resolved.value);
        this.svg.set(null);
        return;
      }
      this.faClass.set(null);
      this.http.get(resolved.value, { responseType: 'text' }).subscribe({
        next: (raw) => this.svg.set(this.sanitizer.bypassSecurityTrustHtml(sizeSvg(raw, this.sizePx()))),
        error: () => this.svg.set(null),
      });
    });
  }
}

/**
 * Size an SVG string without touching its color design (convention:
 * stored SVGs already use currentColor). Replaces/inserts width+height on the
 * root <svg> and strips any XML declaration.
 */
function sizeSvg(raw: string, px: number): string {
  const svg = raw.replace(/^\s*<\?xml[\s\S]*?\?>\s*/i, '').trim();
  return svg.replace(/<svg([^>]*)>/i, (match: string, attrs: string) => {
    const cleaned = attrs.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, '').trim();
    return `<svg${cleaned ? ' ' + cleaned : ''} width="${px}" height="${px}">`;
  });
}