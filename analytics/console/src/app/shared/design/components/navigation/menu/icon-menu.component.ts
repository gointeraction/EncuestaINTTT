import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DsIconComponent } from '../../display/icon/icon.component';

export interface DsIconMenuItem {
  id: string;
  icon: string;
  title: string;
}

/** Size → icon pixel size (matches ds-icon presets). */
const ICON_SIZE_PX: Record<string, number> = {
  xs: 14, sm: 16, md: 20, lg: 24, xl: 32,
};

/**
 * ds-icon-menu — vertical icon launcher/dock (standalone + OnPush).
 * A narrow strip of large-area shortcuts. Selecting one EMITS its id so the
 * host can swap the active menu (it pairs with ds-menu-panel: selecting an area
 * here switches the tabs/sections shown in the adjacent menu panel).
 *
 * Presentation & scroll:
 *   surface     → strip background (default transparent)
 *   iconSize    → 'xs'|'sm'|'md'|'lg'|'xl' preset or a pixel number
 *   textColor   → idle icon color (default --ds-text-muted)
 *   activeColor → hover/active icon color (default --ds-text-primary)
 *   height      → CSS height of the strip (e.g. '100%', '480px')
 *   scrollable  → when true the strip scrolls vertically (overflow auto)
 */
@Component({
  selector: 'ds-icon-menu',
  standalone: true,
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-icon-menu]': 'name()',
    '[style.--dsim-surface]': 'surface() || null',
    '[style.--dsim-color]': 'textColor() || null',
    '[style.--dsim-active-color]': 'activeColor() || null',
    '[style.height]': 'height() || "100%"',
    '[style.display]': '"flex"',
    '[style.flex-direction]': '"column"',
    '[style.flex-shrink]': '"0"',
  },
  template: `
    <nav class="dsim" [class.dsim--scrollable]="scrollable()" aria-label="Application areas"
         (keydown)="onKeydown($event)">
      @for (item of items(); track item.id) {
        <button type="button"
                class="dsim__item"
                [class.dsim__item--active]="activeValue() === item.id"
                (click)="select(item.id)"
                [title]="item.title"
                [attr.aria-label]="item.title"
                [attr.aria-current]="activeValue() === item.id ? 'true' : null">
          <ds-icon [name]="item.icon" [size]="iconSizePx()"/>
        </button>
      }
    </nav>
  `,
  styles: `
    :host {
      --dsim-surface: transparent;
      --dsim-color: var(--ds-text-muted);
      --dsim-active-color: var(--ds-text-primary);
    }
    .dsim {
      display: flex; flex-direction: column; align-items: center;
      gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-2);
      border-right: 1px solid var(--ds-border-default);
      background: var(--dsim-surface);
      height: 100%; flex: 1;
    }
    .dsim--scrollable { overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; }
    .dsim__item {
      display: flex; align-items: center; justify-content: center;
      width: var(--ds-size-10); height: var(--ds-size-10); border-radius: var(--ds-radius-lg);
      border: none; background: transparent; color: var(--dsim-color); cursor: pointer;
      flex-shrink: 0;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .dsim__item:hover { background: var(--ds-surface-hover); color: var(--dsim-active-color); }
    .dsim__item--active {
      background: color-mix(in oklab, var(--ds-color-brand-primary) 14%, transparent);
      color: var(--dsim-active-color);
    }
    .dsim__item:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--ds-color-brand-primary) 30%, transparent);
    }
  `,
})
export class DsIconMenuComponent {
  readonly name = input('');
  readonly items = input<DsIconMenuItem[]>([]);
  readonly activeValue = input<string>('');
  readonly surface = input('');
  readonly iconSize = input<string | number>('md');
  readonly textColor = input('');
  readonly activeColor = input('');
  readonly height = input('');
  readonly scrollable = input(false);

  readonly valueChange = output<string>();

  protected readonly iconSizePx = computed(() => {
    const s = this.iconSize();
    return typeof s === 'number' ? s : ICON_SIZE_PX[s] ?? 20;
  });

  protected select(id: string): void {
    this.valueChange.emit(id);
  }

  /** R6: ArrowUp/Down/Home/End move focus across the vertical icon dock. */
  protected onKeydown(event: KeyboardEvent): void {
    const nav = event.currentTarget as HTMLElement;
    const items = Array.from(nav.querySelectorAll<HTMLElement>('.dsim__item'));
    if (!items.length) return;
    const current = document.activeElement;
    const idx = items.indexOf(current as HTMLElement);
    let next = idx;
    switch (event.key) {
      case 'ArrowDown': next = (idx + 1) % items.length; break;
      case 'ArrowUp': next = (idx - 1 + items.length) % items.length; break;
      case 'Home': next = 0; break;
      case 'End': next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    items[next].focus();
  }
}