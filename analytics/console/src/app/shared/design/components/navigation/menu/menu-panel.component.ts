import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DsIconComponent } from '../../display/icon/icon.component';

export interface DsMenuTab {
  id: string;
  icon: string;
  title?: string;
}

export interface DsMenuChildItem {
  label: string;
  route?: string;
  icon?: string;
}

export interface DsMenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: DsMenuChildItem[];
}

export interface DsMenuSection {
  id: string;
  label: string;
  icon?: string;
  items: DsMenuItem[];
}

/** Track open state per expandable key (section or submenu). */
type OpenState = Record<string, boolean>;

/**
 * ds-menu-panel — vertical collapsible navigation menu (standalone + OnPush).
 * Mirrors the super-layout sidebar pattern:
 *   - a top ICON TAB BAR switches the visible content (tabs),
 *   - each tab renders SEVERAL COLLAPSIBLE SECTIONS (label + caret),
 *   - a section holds menu ITEMS, and an item can open a SUBMENU (children).
 * Token-driven, icon names are resolved by ds-icon (Lucide).
 */
@Component({
  selector: 'ds-menu-panel',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-menu-panel]': 'name()',
    '[style.--dsmp-surface]': 'surface() || null',
    '[style.--dsmp-color]': 'textColor() || null',
    '[style.--dsmp-active-color]': 'activeColor() || null',
    '[style.--dsmp-font-size]': 'textSize() || "var(--ds-text-small)"',
    '[style.height]': 'height() || "100%"',
    style: 'display: flex; flex-direction: column; overflow: hidden;',
  },
  template: `
    @if (title() || subtitle()) {
      <div class="dsmp-header">
        @if (title()) { <h2 class="dsmp-header__title">{{ title() }}</h2> }
        @if (subtitle()) { <p class="dsmp-header__subtitle">{{ subtitle() }}</p> }
      </div>
    }

    <!-- Icon tab bar — switches the active tab content -->
    <div class="dsmp-tabbar" role="tablist" (keydown)="onTabbarKeydown($event)">
      @for (tab of tabs(); track tab.id) {
        <button type="button"
                class="dsmp-tab"
                role="tab"
                [attr.aria-selected]="activeTab() === tab.id"
                [class.dsmp-tab--active]="activeTab() === tab.id"
                (click)="selectTab(tab.id)"
                [title]="tab.title ?? tab.id"
                [attr.aria-label]="tab.title ?? tab.id">
          <ds-icon [name]="tab.icon" size="sm"/>
        </button>
      }
    </div>

    <!-- Collapsible sections of the active tab -->
    <nav class="dsmp-nav" aria-label="Menu">
      @for (section of sections(); track section.id) {
        <section class="dsmp-section">
          <button type="button" class="dsmp-section__toggle"
                  [attr.aria-expanded]="openState(section.id)"
                  (click)="toggleSection(section.id)">
            @if (section.icon) { <ds-icon [name]="section.icon" size="xs"/> }
            <span class="dsmp-section__label">{{ section.label }}</span>
            <ds-icon [name]="openState(section.id) ? 'chevron-up' : 'chevron-down'" size="xs"/>
          </button>
          @if (openState(section.id)) {
            <div class="dsmp-section__items">
              @for (item of section.items; track item.label) {
                @if (item.children?.length) {
                  <div class="dsmp-submenu">
                    <button type="button" class="dsmp-submenu__toggle"
                            [attr.aria-expanded]="openState(itemKey(section, item))"
                            (click)="toggleSubmenu(section, item)">
                      @if (item.icon) { <ds-icon [name]="item.icon" size="xs"/> }
                      <span class="dsmp-submenu__label">{{ item.label }}</span>
                      <ds-icon [name]="openState(itemKey(section, item)) ? 'chevron-up' : 'chevron-down'" size="xs"/>
                    </button>
                    @if (openState(itemKey(section, item))) {
                      <div class="dsmp-submenu__items">
                        @for (child of item.children; track child.label) {
                          <a class="dsmp-link dsmp-link--child"
                             #rla="routerLinkActive"
                             [routerLink]="child.route"
                             routerLinkActive="dsmp-link--active"
                             [attr.aria-current]="rla.isActive ? 'page' : null"
                             [title]="child.label">
                            @if (child.icon) { <ds-icon [name]="child.icon" size="xs"/> }
                            {{ child.label }}
                          </a>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <a class="dsmp-link"
                     #rla="routerLinkActive"
                     [routerLink]="item.route"
                     routerLinkActive="dsmp-link--active"
                     [attr.aria-current]="rla.isActive ? 'page' : null"
                     [title]="item.label">
                    @if (item.icon) { <ds-icon [name]="item.icon" size="xs"/> }
                    {{ item.label }}
                  </a>
                }
              }
            </div>
          }
        </section>
      }
    </nav>
  `,
  styles: `
    :host {
      display: flex; flex-direction: column; overflow: hidden;
      --dsmp-surface: transparent;
      --dsmp-color: var(--ds-text-muted);
      --dsmp-active-color: var(--ds-text-primary);
    }

    .dsmp-header { padding: var(--ds-space-3) var(--ds-space-4); border-bottom: 1px solid var(--ds-border-default); flex-shrink: 0; background: var(--dsmp-surface); }
    .dsmp-header__title { margin: 0; font-family: var(--ds-font-brand); font-size: var(--ds-text-heading-4); font-weight: var(--ds-font-weight-semibold); color: var(--dsmp-active-color); }
    .dsmp-header__subtitle { margin: var(--ds-space-1) 0 0; font-size: var(--ds-text-caption); color: var(--dsmp-color); text-transform: uppercase; letter-spacing: 0.08em; }

    .dsmp-tabbar { display: flex; align-items: center; gap: var(--ds-space-1); padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-default); flex-shrink: 0; background: var(--dsmp-surface); }
    .dsmp-tab {
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ds-size-8); height: var(--ds-size-8); border-radius: var(--ds-radius-md);
      border: none; background: transparent; color: var(--dsmp-color); cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .dsmp-tab:hover { background: var(--ds-surface-hover); color: var(--dsmp-active-color); }
    .dsmp-tab--active { background: color-mix(in oklab, var(--ds-color-brand-primary) 12%, transparent); color: var(--dsmp-active-color); }
    .dsmp-tab:focus-visible,
    .dsmp-section__toggle:focus-visible,
    .dsmp-submenu__toggle:focus-visible,
    .dsmp-link:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--ds-color-brand-primary) 30%, transparent);
    }

    .dsmp-nav { flex: 1; overflow-y: auto; padding: var(--ds-space-2); scrollbar-width: thin; }

    .dsmp-section { margin-bottom: var(--ds-space-1); }
    .dsmp-section__toggle {
      display: flex; align-items: center; gap: var(--ds-space-2); width: 100%;
      padding: var(--ds-space-2); border-radius: var(--ds-radius-md);
      border: none; background: transparent; color: var(--dsmp-active-color); cursor: pointer;
      font-size: var(--dsmp-font-size); font-weight: var(--ds-font-weight-semibold);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .dsmp-section__toggle:hover { background: var(--ds-surface-hover); }
    .dsmp-section__label { flex: 1; text-align: left; margin-right: var(--ds-space-1); }
    .dsmp-section__items { margin-left: var(--ds-space-3); }

    .dsmp-submenu__toggle {
      display: flex; align-items: center; gap: var(--ds-space-2); width: 100%;
      padding: var(--ds-space-1) var(--ds-space-2); border-radius: var(--ds-radius-md);
      border: none; background: transparent; color: var(--dsmp-color); cursor: pointer;
      font-size: var(--dsmp-font-size);
    }
    .dsmp-submenu__toggle:hover { background: var(--ds-surface-hover); color: var(--dsmp-active-color); }
    .dsmp-submenu__label { flex: 1; text-align: left; }
    .dsmp-submenu__items { margin-left: var(--ds-space-3); }

    .dsmp-link {
      display: flex; align-items: center; gap: var(--ds-space-2);
      padding: var(--ds-space-1) var(--ds-space-2); border-radius: var(--ds-radius-md);
      font-size: var(--dsmp-font-size); color: var(--dsmp-color); text-decoration: none;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .dsmp-link:hover { background: var(--ds-surface-hover); color: var(--dsmp-active-color); }
    .dsmp-link--active { background: color-mix(in oklab, var(--ds-color-brand-primary) 12%, transparent); color: var(--dsmp-active-color); }
    .dsmp-link--child { padding-left: var(--ds-space-2); }
  `,
})
export class DsMenuPanelComponent {
  readonly name = input('');
  readonly title = input('');
  readonly subtitle = input('');
  readonly tabs = input<DsMenuTab[]>([]);
  readonly sections = input<DsMenuSection[]>([]);
  readonly activeTab = input<string>('');
  readonly surface = input('');
  readonly textColor = input('');
  readonly activeColor = input('');
  readonly textSize = input<string>('var(--ds-text-small)');
  readonly height = input('');

  readonly tabChange = output<string>();

  private readonly open = signal<OpenState>({});

  protected openState(key: string): boolean {
    const s = this.open();
    return s[key] !== false; // default open (sections render expanded)
  }

  protected toggleSection(sectionId: string): void {
    this.open.update((s) => ({ ...s, [sectionId]: !this.openState(sectionId) }));
  }

  protected toggleSubmenu(section: DsMenuSection, item: DsMenuItem): void {
    const key = this.itemKey(section, item);
    this.open.update((s) => ({ ...s, [key]: !this.openState(key) }));
  }

  protected selectTab(tabId: string): void {
    this.tabChange.emit(tabId);
  }

  /** R6: ArrowLeft/Right/Home/End move focus across the icon tab bar. */
  protected onTabbarKeydown(event: KeyboardEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const tabs = Array.from(bar.querySelectorAll<HTMLElement>('.dsmp-tab'));
    if (!tabs.length) return;
    const current = document.activeElement;
    const idx = tabs.indexOf(current as HTMLElement);
    let next = idx;
    switch (event.key) {
      case 'ArrowRight': next = (idx + 1) % tabs.length; break;
      case 'ArrowLeft': next = (idx - 1 + tabs.length) % tabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    tabs[next].focus();
  }

  protected itemKey(section: DsMenuSection, item: DsMenuItem): string {
    return `${section.id}::${item.label}`;
  }
}