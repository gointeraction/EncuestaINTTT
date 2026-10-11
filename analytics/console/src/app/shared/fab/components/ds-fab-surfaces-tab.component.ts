import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

/** Cómo se pinta el swatch de un token: fondo, borde o radio. */
type SwatchKind = 'surface' | 'border' | 'radius';

interface SurfaceToken {
  label: string;
  token: string;
  value: string;
  kind: SwatchKind;
}

/** Tokens de superficies, bordes y radios (de primitives/surfaces.css). */
const SURFACE_GROUPS: { title: string; kind: SwatchKind; tokens: { label: string; token: string }[] }[] = [
  {
    title: 'surfaces.surfaces',
    kind: 'surface',
    tokens: [
      { label: 'Body', token: '--ds-surface-body' },
      { label: 'Page', token: '--ds-surface-page' },
      { label: 'Elevated', token: '--ds-surface-elevated' },
      { label: 'Card', token: '--ds-surface-card' },
      { label: 'Muted', token: '--ds-surface-muted' },
      { label: 'Modal', token: '--ds-surface-modal' },
      { label: 'Field', token: '--ds-surface-field' },
      { label: 'Header', token: '--ds-surface-header-bg' },
      { label: 'Footer', token: '--ds-surface-footer-bg' },
      { label: 'Aside', token: '--ds-surface-aside-bg' },
    ],
  },
  {
    title: 'surfaces.states',
    kind: 'surface',
    tokens: [
      { label: 'Active', token: '--ds-surface-active' },
      { label: 'Hover', token: '--ds-surface-hover' },
      { label: 'Disabled', token: '--ds-surface-disabled' },
      { label: 'Overlay', token: '--ds-surface-overlay' },
      { label: 'Overlay soft', token: '--ds-surface-overlay-soft' },
      { label: 'Overlay medium', token: '--ds-surface-overlay-medium' },
      { label: 'Overlay strong', token: '--ds-surface-overlay-strong' },
    ],
  },
  {
    title: 'surfaces.borders',
    kind: 'border',
    tokens: [
      { label: 'Default', token: '--ds-border-default' },
      { label: 'Subtle', token: '--ds-border-subtle' },
      { label: 'Strong', token: '--ds-border-strong' },
      { label: 'Divider', token: '--ds-border-divider' },
      { label: 'Input', token: '--ds-border-input' },
    ],
  },
  {
    title: 'surfaces.radius',
    kind: 'radius',
    tokens: [
      { label: 'XS', token: '--ds-radius-xs' },
      { label: 'SM', token: '--ds-radius-sm' },
      { label: 'Standard', token: '--ds-radius-standard' },
      { label: 'MD', token: '--ds-radius-md' },
      { label: 'LG', token: '--ds-radius-lg' },
      { label: 'XL', token: '--ds-radius-xl' },
      { label: 'Full', token: '--ds-radius-full' },
    ],
  },
];

/**
 * ds-fab-surfaces-tab — TAB "Superficies": tokens de superficies, bordes y
 * radios del design system, leídos en vivo desde getComputedStyle.
 */
@Component({
  selector: 'ds-fab-surfaces-tab',
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
                @switch (t.kind) {
                  @case ('radius') {
                    <span class="ds-ft__swatch-color ds-ft__swatch-color--radius"
                          [style.border-radius]="t.value"></span>
                  }
                  @case ('border') {
                    <span class="ds-ft__swatch-color ds-ft__swatch-color--border"
                          [style.background]="'transparent'" [style.border-color]="t.value"></span>
                  }
                  @default {
                    <span class="ds-ft__swatch-color" [style.background]="t.value"></span>
                  }
                }
                <span class="ds-ft__swatch-body">
                  <span class="ds-ft__swatch-label">{{ t.label }}</span>
                  <code class="ds-ft__swatch-value">{{ t.value }}</code>
                </span>
              </div>
            }
          </div>
        </div>
      }
      @if (groups().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de superficie.</div>
      }
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
    }
    .ds-ft__swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 6px; }
    .ds-ft__swatch {
      display: flex; align-items: center; gap: 8px; min-width: 0;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 3px 6px;
    }
    .ds-ft__swatch-color {
      width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
      border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-ft__swatch-color--border {
      border: 2px solid transparent;
      background: color-mix(in oklab, var(--ds-designmode-inspector-on) 6%, transparent);
    }
    .ds-ft__swatch-color--radius {
      background: var(--ds-designmode-control-border);
      border: none;
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
export class DsFabSurfacesTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly groups = signal<{ title: string; tokens: SurfaceToken[] }[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.groups.set(
      SURFACE_GROUPS.map((g) => ({
        title: g.title,
        tokens: g.tokens.map((t) => ({
          label: t.label,
          token: t.token,
          value: cs.getPropertyValue(t.token).trim(),
          kind: g.kind,
        })).filter((t) => t.value),
      })).filter((g) => g.tokens.length > 0),
    );
  }
}