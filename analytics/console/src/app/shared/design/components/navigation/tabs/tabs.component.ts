import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsTabsVariant = 'underline' | 'boxed';
export type DsTabsSize = 'sm' | 'md' | 'lg';

export interface DsTabItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  disabled?: boolean;
}

/** Size → text token mapping. */
const TABS_SIZE_FONT: Record<DsTabsSize, string> = {
  sm: 'var(--ds-text-label)',
  md: 'var(--ds-text-small)',
  lg: 'var(--ds-text-body)',
};

/**
 * ds-tabs — horizontal tab bar (standalone + OnPush).
 * Variants: underline (border-bottom on active) / boxed (filled active).
 * Each tab is selectable (activeId + tabChange) and/or a router link
 * (route + routerLinkActive). Token-driven; optional Lucide icon per tab.
 */
@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dst-color]': 'textColor() || null',
    '[style.--dst-active-color]': 'activeColor() || null',
    '[style.--dst-surface]': 'surface() || null',
  },
  template: `
    <div class="dst" [attr.data-tabs]="name()"
         role="tablist"
         [class.dst--boxed]="variant() === 'boxed'"
         (keydown)="onKeydown($event)">
      @for (tab of items(); track tab.id) {
        @if (tab.route) {
          <a class="dst__tab"
             #rla="routerLinkActive"
             [id]="tabId(tab)"
             role="tab"
             [class.dst__tab--active]="rla.isActive"
             [attr.aria-selected]="rla.isActive"
             [attr.tabindex]="rla.isActive ? '0' : '-1'"
             routerLinkActive="dst__tab--active"
             [routerLink]="tab.route"
             [style.font-size]="fontSize()"
             [class.dst__tab--disabled]="tab.disabled"
             [title]="tab.label">
            @if (tab.icon) { <ds-icon [name]="tab.icon" size="sm"/> }
            {{ tab.label }}
          </a>
        } @else {
          <button type="button"
                  class="dst__tab"
                  [id]="tabId(tab)"
                  role="tab"
                  [class.dst__tab--active]="isActive(tab)"
                  [attr.aria-selected]="isActive(tab)"
                  [attr.tabindex]="isActive(tab) ? '0' : '-1'"
                  [class.dst__tab--disabled]="tab.disabled"
                  [disabled]="tab.disabled || null"
                  [style.font-size]="fontSize()"
                  (click)="select(tab.id)"
                  [title]="tab.label">
            @if (tab.icon) { <ds-icon [name]="tab.icon" size="sm"/> }
            {{ tab.label }}
          </button>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block; width: 100%;
      --dst-surface: transparent;
      --dst-color: var(--ds-text-muted);
      --dst-active-color: var(--ds-text-primary);
    }
    .dst {
      display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-4);
      background: var(--dst-surface); border-bottom: 1px solid var(--ds-border-default);
    }
    .dst__tab {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      padding: var(--ds-space-2) 0; font-weight: var(--ds-font-weight-medium);
      color: var(--dst-color); text-decoration: none; white-space: nowrap; cursor: pointer;
      border-bottom: 2px solid transparent; background: transparent;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    .dst__tab:hover { color: var(--dst-active-color); }
    .dst__tab--active { color: var(--dst-active-color); border-bottom: 2px solid var(--ds-color-brand-accent); }
    .dst__tab--disabled { opacity: 0.45; cursor: not-allowed; }

    /* Boxed variant — filled active pill. */
    .dst--boxed { gap: var(--ds-space-2); border-bottom: none; }
    .dst--boxed .dst__tab {
      padding: var(--ds-space-1) var(--ds-space-3); border-bottom: none;
      border-radius: var(--ds-radius-full);
    }
    .dst--boxed .dst__tab:hover { background: var(--ds-surface-hover); }
    .dst--boxed .dst__tab--active { background: var(--ds-color-brand-primary); color: var(--ds-color-white); }
  `,
})
export class DsTabsComponent {
  readonly name = input('');
  readonly items = input<DsTabItem[]>([]);
  readonly variant = input<DsTabsVariant>('underline');
  readonly size = input<DsTabsSize>('md');
  readonly activeId = input<string>('');
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');

  readonly tabChange = output<string>();

  protected readonly fontSize = computed(() => TABS_SIZE_FONT[this.size()]);

  protected tabId(tab: DsTabItem): string {
    return `dst-tab-${this.name() || 'tabs'}-${tab.id}`;
  }

  /**
   * Manual-activation tab pattern (APG): ArrowLeft/Right/Home/End move focus
   * (roving tabindex); Enter/Space/click activates the focused tab natively.
   * Non-route tabs use activeId(); route tabs rely on RouterLinkActive.
   */
  protected isActive(tab: DsTabItem): boolean {
    return !tab.route && this.activeId() === tab.id;
  }

  protected select(id: string): void {
    this.tabChange.emit(id);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = event.currentTarget as HTMLElement;
    const tabs = Array.from(list.querySelectorAll<HTMLElement>('.dst__tab'));
    const enabled = tabs.filter((t) => !t.hasAttribute('disabled'));
    if (!enabled.length) return;
    const current = document.activeElement;
    let idx = enabled.indexOf(current as HTMLElement);
    if (idx === -1) idx = Math.max(0, enabled.findIndex((t) => t.getAttribute('aria-selected') === 'true'));

    let next = idx;
    switch (event.key) {
      case 'ArrowRight': next = (idx + 1) % enabled.length; break;
      case 'ArrowLeft': next = (idx - 1 + enabled.length) % enabled.length; break;
      case 'Home': next = 0; break;
      case 'End': next = enabled.length - 1; break;
      default: return;
    }
    event.preventDefault();
    enabled.forEach((t, i) => t.setAttribute('tabindex', i === next ? '0' : '-1'));
    enabled[next].focus();
  }
}