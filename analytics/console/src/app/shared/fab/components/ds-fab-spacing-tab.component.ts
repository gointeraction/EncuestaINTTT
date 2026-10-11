import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

interface SpacingToken {
  label: string;
  token: string;
  value: string;
}

interface SpacingGroup {
  title: string;
  tokens: SpacingToken[];
}

/** Token de espaciado en su forma fuente (sin valor resuelto aún). */
type SpacingTokenSource = { label: string; token: string };
type SpacingGroupSource = { title: string; tokens: SpacingTokenSource[] };

/** Tokens de espaciado, tamaños, gaps y contenedores (de primitives/spacing.css). */
const SPACING_GROUPS: SpacingGroupSource[] = [
  {
    title: 'spacing.spacing',
    tokens: [
      { label: '0', token: '--ds-space-0' },
      { label: '1', token: '--ds-space-1' },
      { label: '2', token: '--ds-space-2' },
      { label: '3', token: '--ds-space-3' },
      { label: '4', token: '--ds-space-4' },
      { label: '5', token: '--ds-space-5' },
      { label: '6', token: '--ds-space-6' },
      { label: '8', token: '--ds-space-8' },
      { label: '10', token: '--ds-space-10' },
      { label: '12', token: '--ds-space-12' },
      { label: '16', token: '--ds-space-16' },
      { label: '20', token: '--ds-space-20' },
      { label: '24', token: '--ds-space-24' },
      { label: '32', token: '--ds-space-32' },
    ],
  },
  {
    title: 'spacing.sizes',
    tokens: [
      { label: '1', token: '--ds-size-1' },
      { label: '1.5', token: '--ds-size-1-5' },
      { label: '2', token: '--ds-size-2' },
      { label: '3', token: '--ds-size-3' },
      { label: '4', token: '--ds-size-4' },
      { label: '5', token: '--ds-size-5' },
      { label: '6', token: '--ds-size-6' },
      { label: '7', token: '--ds-size-7' },
      { label: '8', token: '--ds-size-8' },
      { label: '9', token: '--ds-size-9' },
      { label: '10', token: '--ds-size-10' },
      { label: '11', token: '--ds-size-11' },
      { label: '12', token: '--ds-size-12' },
      { label: '14', token: '--ds-size-14' },
      { label: '16', token: '--ds-size-16' },
      { label: '20', token: '--ds-size-20' },
      { label: '24', token: '--ds-size-24' },
      { label: '32', token: '--ds-size-32' },
      { label: '40', token: '--ds-size-40' },
      { label: '48', token: '--ds-size-48' },
      { label: '64', token: '--ds-size-64' },
    ],
  },
  {
    title: 'spacing.gaps',
    tokens: [
      { label: 'XS', token: '--ds-gap-xs' },
      { label: 'SM', token: '--ds-gap-sm' },
      { label: 'MD', token: '--ds-gap-md' },
      { label: 'LG', token: '--ds-gap-lg' },
      { label: 'XL', token: '--ds-gap-xl' },
      { label: '2XL', token: '--ds-gap-2xl' },
      { label: '3XL', token: '--ds-gap-3xl' },
    ],
  },
  {
    title: 'spacing.containers',
    tokens: [
      { label: 'SM', token: '--ds-container-sm' },
      { label: 'MD', token: '--ds-container-md' },
      { label: 'LG', token: '--ds-container-lg' },
      { label: 'XL', token: '--ds-container-xl' },
      { label: '2XL', token: '--ds-container-2xl' },
      { label: 'Full', token: '--ds-container-full' },
    ],
  },
];

/**
 * ds-fab-spacing-tab — TAB "Espaciado": tokens de espaciado, tamaños, gaps y
 * contenedores del design system, leídos en vivo desde getComputedStyle.
 */
@Component({
  selector: 'ds-fab-spacing-tab',
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
        <div class="ds-ft__empty">No se encontraron tokens de espaciado.</div>
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
export class DsFabSpacingTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly groups = signal<SpacingGroup[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.groups.set(
      SPACING_GROUPS.map((g) => ({
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
