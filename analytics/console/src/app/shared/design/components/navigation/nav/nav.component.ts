import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsNavVariant = 'underline' | 'pills' | 'segmented';
export type DsNavSize = 'sm' | 'md' | 'lg';

export interface DsNavItem {
  label: string;
  route?: string;
  icon?: string;
  title?: string;
  active?: boolean;
}

/** Size → text token mapping (ds-tokens role, not literal pixels). */
const NAV_SIZE_FONT: Record<DsNavSize, string> = {
  sm: 'var(--ds-text-label)',
  md: 'var(--ds-text-small)',
  lg: 'var(--ds-text-body)',
};

/**
 * ds-nav — horizontal navigation menu (standalone + OnPush).
 * Variants: underline (tabs) / pills / segmented. Token-driven, never hardcoded.
 * Items may carry a Lucide icon name (resolved by ds-icon) and/or a router link.
 * Presentation is parameterizable:
 *   surface   → background of the nav strip (default transparent)
 *   textSize  → 'sm' | 'md' | 'lg' preset or any CSS font-size value
 *   textColor → idle link color (default --ds-text-muted)
 *   activeColor → hover/active color (default --ds-text-primary)
 */
@Component({
  selector: 'ds-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ds-nav--variant]': 'variant()',
    '[style.--ds-nav-surface]': 'surface() || null',
    '[style.--ds-nav-color]': 'textColor() || null',
    '[style.--ds-nav-active-color]': 'activeColor() || null',
  },
  template: `
    <nav class="ds-nav" [attr.data-nav]="name()" [class.ds-nav--pills]="variant() === 'pills'"
         [class.ds-nav--segmented]="variant() === 'segmented'">
      @for (item of items(); track item.label) {
        <a class="ds-nav__link"
           #rla="routerLinkActive"
           [class.ds-nav__link--active]="rla.isActive || !!item.active"
           routerLinkActive="ds-nav__link--active"
           [routerLink]="item.route"
           [attr.aria-current]="rla.isActive || item.active ? 'page' : null"
           [style.font-size]="fontSize()"
           [title]="item.title">
          @if (item.icon) { <ds-icon [name]="item.icon" size="sm"/> }
          {{ item.label }}
        </a>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --ds-nav-surface: transparent;
      --ds-nav-color: var(--ds-text-muted);
      --ds-nav-active-color: var(--ds-text-primary);
    }
    .ds-nav {
      display: flex; flex-wrap: wrap; align-items: center;
      gap: var(--ds-space-4); background: var(--ds-nav-surface);
      border-radius: var(--ds-radius-md);
    }

    /* Underline variant (default) — a bottom border like app subnavs. */
    .ds-nav__link {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      padding: var(--ds-space-1) 0;
      font-weight: var(--ds-font-weight-medium);
      color: var(--ds-nav-color);
      text-decoration: none; white-space: nowrap;
      border-bottom: 2px solid transparent;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    .ds-nav__link:hover { color: var(--ds-nav-active-color); }
    .ds-nav__link--active { color: var(--ds-nav-active-color); border-bottom: 2px solid var(--ds-color-brand-accent); }
    /* R6: visible keyboard focus ring on nav links. */
    .ds-nav__link:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--ds-nav-active-color) 30%, transparent);
      border-radius: var(--ds-radius-sm);
    }

    /* The variant — rounded pill, filled when active. */
    .ds-nav--pills { gap: var(--ds-space-2); }
    .ds-nav--pills .ds-nav__link {
      padding: var(--ds-space-1) var(--ds-space-3);
      border: 1px solid transparent; border-radius: var(--ds-radius-full);
    }
    .ds-nav--pills .ds-nav__link:hover { background: var(--ds-surface-hover); }
    .ds-nav--pills .ds-nav__link--active {
      background: var(--ds-color-brand-primary);
      color: var(--ds-color-white);
    }

    /* Segmented control — a single bordered track. */
    .ds-nav--segmented {
      gap: 0; border: 1px solid var(--ds-border-default);
      border-radius: var(--ds-radius-md); overflow: hidden; width: fit-content;
    }
    .ds-nav--segmented .ds-nav__link {
      margin: 0; padding: var(--ds-space-1) var(--ds-space-3);
      border-bottom: none; border-right: 1px solid var(--ds-border-default);
    }
    .ds-nav--segmented .ds-nav__link:last-child { border-right: none; }
    .ds-nav--segmented .ds-nav__link:hover { background: var(--ds-surface-hover); }
    .ds-nav--segmented .ds-nav__link--active { background: var(--ds-color-brand-primary); color: var(--ds-color-white); }
  `,
})
export class DsNavComponent {
  readonly name = input('');
  readonly items = input<DsNavItem[]>([]);
  readonly variant = input<DsNavVariant>('underline');
  readonly size = input<DsNavSize>('md');
  readonly surface = input('');
  readonly textSize = input<DsNavSize | string>('');
  readonly textColor = input('');
  readonly activeColor = input('');

  protected readonly fontSize = computed(() => {
    const s = this.textSize() || this.size();
    return s in NAV_SIZE_FONT ? NAV_SIZE_FONT[s as DsNavSize] : s;
  });
}