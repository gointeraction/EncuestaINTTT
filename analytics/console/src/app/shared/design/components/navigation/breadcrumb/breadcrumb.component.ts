import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DsIconComponent } from '../../display/icon/icon.component';

export type DsBreadcrumbSize = 'sm' | 'md' | 'lg';

export interface DsBreadcrumbItem {
  label: string;
  route?: string;
}

/** Size → text token mapping. */
const BC_SIZE_FONT: Record<DsBreadcrumbSize, string> = {
  sm: 'var(--ds-text-label)',
  md: 'var(--ds-text-small)',
  lg: 'var(--ds-text-body)',
};

/**
 * ds-breadcrumb — breadcrumb trail (standalone + OnPush).
 * Each crumb is a link (route) or the last (current) crumb. A configurable
 * separator (default chevron-right) sits between crumbs. Token-driven.
 */
@Component({
  selector: 'ds-breadcrumb',
  standalone: true,
  imports: [RouterLink, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--dsbc-color]': 'textColor() || null',
    '[style.--dsbc-active-color]': 'activeColor() || null',
  },
  template: `
    <nav class="dsbc" [attr.data-breadcrumb]="name()" aria-label="Breadcrumb">
      @for (crumb of items(); track crumb.label; let i = $index) {
        @if (i > 0) {
          <ds-icon [name]="separator()" size="xs"/>
        }
        @if (crumb.route && !isLast(i)) {
          <a class="dsbc__crumb" [routerLink]="crumb.route" [style.font-size]="fontSize()">{{ crumb.label }}</a>
        } @else {
          <span class="dsbc__crumb dsbc__crumb--current" [style.font-size]="fontSize()">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
      --dsbc-color: var(--ds-text-muted);
      --dsbc-active-color: var(--ds-text-primary);
    }
    .dsbc { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-1); }
    .dsbc__crumb {
      display: inline-flex; align-items: center; gap: var(--ds-space-1);
      color: var(--dsbc-color); text-decoration: none; white-space: nowrap;
      transition: color 0.15s ease;
    }
    a.dsbc__crumb:hover { color: var(--dsbc-active-color); }
    .dsbc__crumb--current { color: var(--dsbc-active-color); font-weight: var(--ds-font-weight-medium); }
  `,
})
export class DsBreadcrumbComponent {
  readonly name = input('');
  readonly items = input<DsBreadcrumbItem[]>([]);
  readonly size = input<DsBreadcrumbSize>('md');
  readonly separator = input<string>('chevron-right');
  readonly textColor = input('');
  readonly activeColor = input('');

  protected readonly fontSize = computed(() => BC_SIZE_FONT[this.size()]);

  protected isLast(index: number): boolean {
    return index === this.items().length - 1;
  }
}