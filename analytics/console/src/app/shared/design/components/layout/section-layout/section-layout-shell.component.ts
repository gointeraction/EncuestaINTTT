import { ChangeDetectionStrategy, Component, computed, inject, input, signal, Type } from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { DsContainerComponent } from '../ds-container';
import {
  SectionLayoutService,
  type SectionColWidth,
  type SectionLayoutBlock,
  type SectionLayoutRow,
} from '../../../system/services/section-layout.service';

const TRACK: Record<SectionColWidth, string> = {
  'flex-1': 'minmax(0, 1fr)',
  'w-64': '256px',
  'w-80': '320px',
  'w-96': '384px',
  'col-span-3': '3fr',
  'col-span-4': '4fr',
  'col-span-5': '5fr',
  'col-span-8': '8fr',
  'col-span-12': '12fr',
};

/**
 * ds-section-layout — the body RENDERER of the official section-layout tool.
 * Reads SectionLayoutService for the active page and renders:
 *   desktop (md+) → rows → cols (grid tracks from SectionColWidth) → sections;
 *   mobile        → pages → sections (stacked).
 * The page owns the registry (`Record<sectionId, Component>`); only assigned
 * sections render. Composable, token-driven, no product coupling.
 */
@Component({
  selector: 'ds-section-layout',
  standalone: true,
  imports: [NgComponentOutlet, NgTemplateOutlet, DsContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (layout.hasLayout()) {
      <div class="ds-sl__desktop max-md:hidden">
        <ng-template #rowTpl let-row>
          <div class="ds-sl__row" [style.grid-template-columns]="track(row)">
            @for (col of row.cols; track col.id) {
              <div class="ds-sl__col">
                @for (id of col.sections; track id) {
                  @if (registry()[id]; as comp) { <ng-container *ngComponentOutlet="comp" /> }
                }
              </div>
            }
          </div>
        </ng-template>

        @for (node of nodes(); track node.id) {
          @if (node.block; as block) {
            <ds-container kind="block" [name]="'block-' + block.id" class="ds-sl__block">
              <p class="ds-sl__block-title">{{ block.label }}</p>
              @for (row of node.rows; track row.id) {
                <ng-container [ngTemplateOutlet]="rowTpl" [ngTemplateOutletContext]="{ $implicit: row }" />
              }
            </ds-container>
          } @else {
            @for (row of node.rows; track row.id) {
              <ng-container [ngTemplateOutlet]="rowTpl" [ngTemplateOutletContext]="{ $implicit: row }" />
            }
          }
        }
      </div>

      <div class="ds-sl__mobile md:hidden">
        @if (layout.mobileStrategy() === 'menu') {
          <!-- MENU strategy: pick one page/section from a selection menu -->
          <select class="ds-sl__menu" [value]="menuActive()" (change)="menuPage.set($any($event.target).value)"
                  aria-label="Select section">
            @for (p of menuPages(); track p.id) { <option [value]="p.id">{{ p.label }}</option> }
          </select>
          <div class="ds-sl__page">
            @for (id of menuSections(); track id) {
              @if (registry()[id]; as comp) { <ng-container *ngComponentOutlet="comp" /> }
            }
          </div>
        } @else {
          @for (page of mobile(); track page.id) {
            <div class="ds-sl__page">
              @for (id of page.sections; track id) {
                @if (registry()[id]; as comp) { <ng-container *ngComponentOutlet="comp" /> }
              }
            </div>
          }
        }
      </div>
    }
  `,
  styles: `
    .ds-sl__row { display: grid; gap: var(--ds-space-6); }
    .ds-sl__row + .ds-sl__row { margin-top: var(--ds-space-6); }
    .ds-sl__col { display: flex; flex-direction: column; gap: var(--ds-space-6); min-width: 0; }
    .ds-sl__page + .ds-sl__page { margin-top: var(--ds-space-6); }
    .ds-sl__page { display: flex; flex-direction: column; gap: var(--ds-space-6); }
    .ds-sl__menu { width: 100%; padding: var(--ds-space-2); margin-bottom: var(--ds-space-6); border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-surface-field); color: inherit; }
    .ds-sl__block { display: flex; flex-direction: column; }
    .ds-sl__block-title { font-size: var(--ds-text-small); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ds-text-muted); margin-bottom: var(--ds-space-3); }
    .ds-sl__block + .ds-sl__block, .ds-sl__block + .ds-sl__row, .ds-sl__row + .ds-sl__block { margin-top: var(--ds-space-6); }
  `,
})
export class DsSectionLayoutComponent {
  protected readonly layout = inject(SectionLayoutService);

  /** The page's section registry: sectionId → standalone component. */
  readonly registry = input<Record<string, Type<unknown>>>({});

  /** Optional active mobile page id → renders ONE page at a time (else stacked). */
  readonly mobileActive = input<string>('');

  /**
   * Optional TAB filter: when non-empty, only these section ids render and any
   * row/col/page left empty is dropped. Lets a page drive the shell from a tab bar.
   */
  readonly only = input<string[]>([]);

  protected readonly rows = computed(() => {
    const only = this.only();
    const rows = this.layout.desktopRows();
    if (!only.length) return rows;
    return rows
      .map((r) => ({
        ...r,
        cols: r.cols
          .map((c) => ({ ...c, sections: c.sections.filter((s) => only.includes(s)) }))
          .filter((c) => c.sections.length > 0),
      }))
      .filter((r) => r.cols.length > 0);
  });

  protected readonly mobile = computed(() => {
    const only = this.only();
    let pages = this.layout.mobilePages();
    if (only.length) {
      pages = pages
        .map((p) => ({ ...p, sections: p.sections.filter((s) => only.includes(s)) }))
        .filter((p) => p.sections.length > 0);
    }
    const active = this.mobileActive();
    return active ? pages.filter((p) => p.id === active) : pages;
  });

  // ── Mobile 'menu' strategy (one page at a time, chosen from a menu) ──
  protected readonly menuPage = signal<string>('');
  protected readonly menuPages = computed(() => {
    const only = this.only();
    let pages = this.layout.mobilePages();
    if (only.length) {
      pages = pages
        .map((p) => ({ ...p, sections: p.sections.filter((s) => only.includes(s)) }))
        .filter((p) => p.sections.length > 0);
    }
    return pages;
  });
  protected readonly menuActive = computed(() => this.menuPage() || this.menuPages()[0]?.id || '');
  protected readonly menuSections = computed(() => this.menuPages().find((p) => p.id === this.menuActive())?.sections ?? []);

  /** Desktop nodes: rows grouped by their optional BLOCK (full-width containers). */
  protected readonly nodes = computed<DesktopNode[]>(() => {
    const blocks = new Map(this.layout.blocks().map((b) => [b.id, b]));
    const nodes: DesktopNode[] = [];
    const byBlock = new Map<string, DesktopNode>();
    for (const row of this.rows()) {
      const block = row.blockId ? blocks.get(row.blockId) : undefined;
      if (block) {
        let node = byBlock.get(block.id);
        if (!node) {
          node = { id: block.id, block, rows: [] };
          byBlock.set(block.id, node);
          nodes.push(node);
        }
        node.rows.push(row);
      } else {
        nodes.push({ id: row.id, block: null, rows: [row] });
      }
    }
    return nodes;
  });

  protected track(row: SectionLayoutRow): string {
    return row.cols.map((c) => TRACK[c.width] ?? 'minmax(0, 1fr)').join(' ');
  }
}

/** One desktop node: a block (with its rows) or a loose row. */
interface DesktopNode {
  id: string;
  block: SectionLayoutBlock | null;
  rows: SectionLayoutRow[];
}
