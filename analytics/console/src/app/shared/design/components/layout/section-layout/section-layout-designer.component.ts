import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DsIconComponent } from '../../display/icon/icon.component';
import {
  SectionLayoutService,
  SECTION_COL_WIDTHS,
  type SectionColWidth,
  type SectionCatalogItem,
  type SectionLayoutRow,
} from '../../../system/services/section-layout.service';

/**
 * ds-section-designer — the official DESIGNER sidebox of the section-layout tool.
 * Available to EVERY page: shows the section CATALOG (assign = visible, unassign =
 * invisible) and the layout structure (move/add/remove rows·cols·pages, resize
 * columns, reset). Mutates SectionLayoutService; persisted per page.
 */
@Component({
  selector: 'ds-section-designer',
  standalone: true,
  imports: [DsIconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (layout.isSideboxOpen()) {
      <div class="ds-sd__backdrop" (click)="layout.closeSidebox()"></div>
      <aside class="ds-sd" role="dialog" aria-label="Section designer">
        <header class="ds-sd__head">
          <span class="ds-sd__title">Sections</span>
          <div class="ds-sd__platforms">
            <button [class.is-active]="layout.platform() === 'desktop'" (click)="layout.platform.set('desktop')">Desktop</button>
            <button [class.is-active]="layout.platform() === 'mobile'" (click)="layout.platform.set('mobile')">Mobile</button>
          </div>
          <button class="ds-sd__x" (click)="layout.closeSidebox()" aria-label="Close">
            <ds-icon name="x" size="sm"/>
          </button>
        </header>

        <div class="ds-sd__body">
          <!-- Integrators declared by the page (universal or several per size) -->
          @if (integrators().length) {
            <p class="ds-sd__label">Integrators ({{ integrators().length }})</p>
            <div class="ds-sd__chips">
              @for (it of integrators(); track it) { <span class="ds-sd__chip-static">{{ it }}</span> }
            </div>
          }

          <!-- Catalog (collapsible): visible / invisible, grouped by integrator + badge per section -->
          <button type="button" class="ds-sd__section-head" (click)="catalogOpen.set(!catalogOpen())"
                  [attr.aria-expanded]="catalogOpen()">
            <span class="ds-sd__label ds-sd__label--inline">Available sections ({{ sections().length }})</span>
            <ds-icon [name]="catalogOpen() ? 'chevron-up' : 'chevron-down'" size="xs" />
          </button>
          @if (catalogOpen()) {
            @for (group of catalogGroups(); track group.key) {
              @if (group.key) { <p class="ds-sd__group">{{ group.key }}</p> }
              @for (s of group.items; track s.id) {
                <button type="button" class="ds-sd__cat" [class.is-assigned]="s.assigned" (click)="toggle(s.id)">
                  <ds-icon [name]="s.assigned ? 'eye' : 'eye-off'" size="xs"/>
                  <!-- Main: the section's title AS SHOWN on the page (translated). Below: internal name. -->
                  <span class="ds-sd__cat-text">
                    <span class="ds-sd__cat-label">{{ s.label }}</span>
                    <span class="ds-sd__cat-id">{{ s.id }}</span>
                  </span>
                  @if (badge(s); as b) { <span class="ds-sd__cat-badge">{{ b }}</span> }
                </button>
              }
            } @empty { <p class="ds-sd__muted">No catalog registered for this page.</p> }
          }

          <!-- Desktop structure: BLOCKS (full-width containers of rows) + loose ROWS -->
          @if (layout.platform() === 'desktop') {
            <p class="ds-sd__label">Desktop · {{ blocks().length }} blocks · {{ rows().length }} rows</p>

            @for (block of blocks(); track block.id) {
              <div class="ds-sd__block">
                <div class="ds-sd__row-head">
                  <button class="ds-sd__op" (click)="toggleBlock(block.id)" [attr.aria-expanded]="!isCollapsed(block.id)" aria-label="Toggle block">
                    <ds-icon [name]="isCollapsed(block.id) ? 'chevron-down' : 'chevron-up'" size="xs"/>
                  </button>
                  <span class="ds-sd__level ds-sd__level--block">BLOCK</span>
                  <input class="ds-sd__name" [value]="block.label" (change)="renameBlock(block.id, $any($event.target))" aria-label="Block name" />
                  <span class="ds-sd__count">{{ rowsOf(block.id).length }}</span>
                  <button class="ds-sd__op" (click)="layout.removeBlock(block.id)" aria-label="Remove block"><ds-icon name="x" size="xs"/></button>
                </div>
                @if (!isCollapsed(block.id)) {
                  @for (row of rowsOf(block.id); track row.id) {
                    <ng-container [ngTemplateOutlet]="rowCard" [ngTemplateOutletContext]="{ $implicit: row }" />
                  }
                  <button class="ds-sd__add-sm" (click)="layout.addRowInBlock(block.id)">+ row</button>
                }
              </div>
            }

            @for (row of looseRows(); track row.id) {
              <ng-container [ngTemplateOutlet]="rowCard" [ngTemplateOutletContext]="{ $implicit: row }" />
            }

            <div class="ds-sd__add-row">
              <button class="ds-sd__add" (click)="layout.addBlock()">+ block</button>
              <button class="ds-sd__add" (click)="layout.addRow()">+ row</button>
            </div>

            <!-- ROW card: sections/name on the LEFT (grow), size on the RIGHT -->
            <ng-template #rowCard let-row>
              <div class="ds-sd__row">
                <div class="ds-sd__row-head">
                  <span class="ds-sd__level ds-sd__level--row">ROW</span>
                  <!-- Controls aligned to the RIGHT edge (same as the column width selectors) -->
                  <div class="ds-sd__row-ops">
                    <button class="ds-sd__op" [disabled]="rowIndex(row) === 0" (click)="layout.moveRow(rowIndex(row), rowIndex(row) - 1)" aria-label="Move up"><ds-icon name="chevron-up" size="xs"/></button>
                    <button class="ds-sd__op" [disabled]="rowIndex(row) === rows().length - 1" (click)="layout.moveRow(rowIndex(row), rowIndex(row) + 1)" aria-label="Move down"><ds-icon name="chevron-down" size="xs"/></button>
                    <button class="ds-sd__op" (click)="layout.addColumn(row.id)" aria-label="Add column">+col</button>
                    <button class="ds-sd__op" (click)="layout.removeRow(row.id)" aria-label="Remove row"><ds-icon name="x" size="xs"/></button>
                  </div>
                </div>
                @for (col of row.cols; track col.id) {
                  <div class="ds-sd__col">
                    <div class="ds-sd__col-sections">
                      @for (sid of col.sections; track sid) {
                        <span class="ds-sd__chip">
                          {{ label(sid) }}
                          <button class="ds-sd__chip-x" (click)="layout.removeSectionFromCol(row.id, col.id, sid)" aria-label="Remove section"><ds-icon name="x" size="xs"/></button>
                        </span>
                      }
                      <select class="ds-sd__add-section" (change)="addSection(row.id, col.id, $any($event.target))" aria-label="Add section">
                        <option value="">+ section</option>
                        @for (sid of availableFor(col.sections); track sid) { <option [value]="sid">{{ label(sid) }}</option> }
                      </select>
                    </div>
                    <select class="ds-sd__width" [value]="col.width" (change)="setWidth(row.id, col.id, $any($event.target))"
                            aria-label="Column width">
                      @for (w of widths; track w) { <option [value]="w">{{ w }}</option> }
                    </select>
                    @if (row.cols.length > 1) {
                      <button class="ds-sd__op" (click)="layout.removeColumn(row.id, col.id)" aria-label="Remove column"><ds-icon name="x" size="xs"/></button>
                    }
                  </div>
                }
              </div>
            </ng-template>
          } @else {
            <!-- Mobile STRATEGY: same as desktop (tabs) or one page/section at a time (menu) -->
            <p class="ds-sd__label">Mobile strategy</p>
            <div class="ds-sd__seg">
              <button type="button" [class.is-active]="layout.mobileStrategy() === 'tabs'" (click)="layout.setMobileStrategy('tabs')">
                Tabs · like desktop
              </button>
              <button type="button" [class.is-active]="layout.mobileStrategy() === 'menu'" (click)="layout.setMobileStrategy('menu')">
                Menu · one at a time
              </button>
            </div>

            <p class="ds-sd__label">Mobile pages</p>
            @for (page of mobile(); track page.id; let pi = $index) {
              <div class="ds-sd__row">
                <div class="ds-sd__row-head">
                  <input class="ds-sd__page-label" [value]="page.label" (change)="setPageLabel(page.id, $any($event.target))" aria-label="Page label" />
                  <button class="ds-sd__op" [disabled]="pi === 0" (click)="layout.movePage(pi, pi - 1)" aria-label="Move up"><ds-icon name="chevron-up" size="xs"/></button>
                  <button class="ds-sd__op" [disabled]="pi === mobile().length - 1" (click)="layout.movePage(pi, pi + 1)" aria-label="Move down"><ds-icon name="chevron-down" size="xs"/></button>
                  <button class="ds-sd__op" (click)="layout.removePage(page.id)" aria-label="Remove page"><ds-icon name="x" size="xs"/></button>
                </div>
                @for (sid of page.sections; track sid) {
                  <span class="ds-sd__chip">
                    {{ label(sid) }}
                    <button class="ds-sd__chip-x" (click)="layout.removeSectionFromPage(page.id, sid)" aria-label="Remove section"><ds-icon name="x" size="xs"/></button>
                  </span>
                }
              </div>
            }
            <button class="ds-sd__add" (click)="layout.addPage()">+ page</button>
          }

          <button class="ds-sd__reset" (click)="layout.resetToDefault()">Reset to default</button>
        </div>
      </aside>
    }
  `,
  styles: `
    .ds-sd__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-overlay); background: color-mix(in oklab, var(--ds-color-black) 40%, transparent); }
    .ds-sd {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: calc(var(--ds-z-overlay) + 1);
      width: 30rem; max-width: 95vw; display: flex; flex-direction: column;
      background: var(--ds-surface-card); color: var(--ds-surface-card-on);
      border-left: 1px solid var(--ds-border-subtle); box-shadow: var(--ds-shadow-lg);
    }
    .ds-sd__head { display: flex; align-items: center; gap: var(--ds-space-2); padding: var(--ds-space-4); border-bottom: 1px solid var(--ds-border-subtle); }
    .ds-sd__title { font-weight: 700; }
    .ds-sd__platforms { margin-left: auto; display: flex; gap: 2px; }
    .ds-sd__platforms button { font-size: var(--ds-text-caption); padding: 2px 8px; border: 1px solid var(--ds-border-subtle); background: transparent; color: inherit; cursor: pointer; border-radius: var(--ds-radius-sm); }
    .ds-sd__platforms button.is-active { background: var(--ds-color-brand-primary); color: var(--ds-text-on-primary); border-color: transparent; }
    .ds-sd__seg { display: flex; gap: var(--ds-space-1); }
    .ds-sd__seg button { flex: 1; font-size: var(--ds-text-caption); padding: var(--ds-space-1) var(--ds-space-2); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-sm); background: transparent; color: inherit; cursor: pointer; }
    .ds-sd__seg button.is-active { background: var(--ds-color-brand-primary); color: var(--ds-text-on-primary); border-color: transparent; }
    .ds-sd__x { background: none; border: none; color: inherit; cursor: pointer; }
    .ds-sd__body { flex: 1; overflow-y: auto; padding: var(--ds-space-4); display: flex; flex-direction: column; gap: var(--ds-space-2); }
    .ds-sd__label { font-size: var(--ds-text-caption); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ds-text-muted); margin-top: var(--ds-space-3); }
    .ds-sd__section-head { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0; margin-top: var(--ds-space-3); background: transparent; border: none; color: inherit; cursor: pointer; }
    .ds-sd__label--inline { margin-top: 0; }
    .ds-sd__cat { display: flex; align-items: center; gap: var(--ds-space-2); width: 100%; text-align: left; padding: var(--ds-space-1) var(--ds-space-2); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-sm); background: transparent; color: inherit; cursor: pointer; font-size: var(--ds-text-body); }
    .ds-sd__cat.is-assigned { color: var(--ds-color-state-success); }
    .ds-sd__cat-text { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .ds-sd__cat-label { font-size: var(--ds-text-body); }
    .ds-sd__cat-id { font-size: 9px; color: var(--ds-text-muted); }
    .ds-sd__cat-badge { font-size: 9px; padding: 1px 6px; border-radius: var(--ds-radius-full); background: var(--ds-surface-muted); color: var(--ds-text-muted); }
    .ds-sd__chips { display: flex; flex-wrap: wrap; gap: var(--ds-space-1); }
    .ds-sd__chip-static { display: inline-flex; align-items: center; font-size: var(--ds-text-caption); padding: 2px 8px; border-radius: var(--ds-radius-full); background: var(--ds-surface-muted); }
    .ds-sd__group { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ds-text-muted); margin-top: var(--ds-space-2); }
    .ds-sd__row { border: 1px solid var(--ds-designmode-level-row); border-left-width: 3px; border-radius: var(--ds-radius-standard); padding: var(--ds-space-2); display: flex; flex-direction: column; gap: var(--ds-space-2); background: var(--ds-designmode-level-row-surface); }
    .ds-sd__row-head { display: flex; align-items: center; gap: 4px; font-size: var(--ds-text-caption); }
    .ds-sd__row-title { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
    .ds-sd__count { font-size: 9px; padding: 1px 6px; border-radius: var(--ds-radius-full); background: var(--ds-surface-muted); color: var(--ds-text-muted); }
    .ds-sd__name { flex: 1; min-width: 0; font-size: var(--ds-text-caption); padding: 2px 4px; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-sm); background: var(--ds-surface-field); color: inherit; }
    .ds-sd__block { display: flex; flex-direction: column; gap: var(--ds-space-2); padding: var(--ds-space-2); border: 1px dashed var(--ds-designmode-level-block); border-left-width: 3px; border-radius: var(--ds-radius-standard); background: var(--ds-designmode-level-block-surface); }
    .ds-sd__add-sm { align-self: flex-start; font-size: var(--ds-text-caption); padding: 2px 8px; border: 1px dashed var(--ds-border-strong); border-radius: var(--ds-radius-sm); background: transparent; color: inherit; cursor: pointer; }
    .ds-sd__add-row { display: flex; gap: var(--ds-space-2); }
    .ds-sd__add-row .ds-sd__add { flex: 1; }
    .ds-sd__op { display: inline-flex; align-items: center; justify-content: center; min-width: 1.75rem; height: 1.75rem; padding: 0 6px; font-size: 10px; border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-sm); background: transparent; color: inherit; cursor: pointer; }
    .ds-sd__row-ops { display: flex; gap: 4px; margin-left: auto; }
    .ds-sd__op:disabled { opacity: 0.4; cursor: default; }
    .ds-sd__col { display: flex; align-items: center; gap: var(--ds-space-2); }
    .ds-sd__col-sections { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-1); min-width: 0; }
    .ds-sd__add-section { font-size: 10px; padding: 2px 4px; border: 1px dashed var(--ds-border-strong); border-radius: var(--ds-radius-sm); background: transparent; color: inherit; cursor: pointer; }
    .ds-sd__width { font-size: 10px; padding: 2px 4px; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-sm); background: var(--ds-surface-field); color: inherit; }
    .ds-sd__chip { display: inline-flex; align-items: center; gap: 4px; font-size: var(--ds-text-caption); padding: 2px 6px; border-radius: var(--ds-radius-full); border: 1px solid var(--ds-designmode-level-section); background: var(--ds-designmode-level-section-surface); }
    /* Level tags — the SAME design-mode palette the FAB/inspector uses on the page */
    .ds-sd__level { font-size: 9px; font-weight: 700; letter-spacing: 0.05em; padding: 1px 6px; border-radius: var(--ds-radius-sm); color: var(--ds-designmode-tag-on); }
    .ds-sd__level--block { background: var(--ds-designmode-level-block); }
    .ds-sd__level--row { background: var(--ds-designmode-level-row); }
    .ds-sd__chip-x { display: inline-flex; border: none; background: transparent; color: inherit; cursor: pointer; padding: 0; }
    .ds-sd__page-label { flex: 1; font-size: var(--ds-text-caption); padding: 2px 4px; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-sm); background: var(--ds-surface-field); color: inherit; }
    .ds-sd__add, .ds-sd__reset { margin-top: var(--ds-space-2); padding: var(--ds-space-2); border: 1px dashed var(--ds-border-strong); border-radius: var(--ds-radius-standard); background: transparent; color: inherit; cursor: pointer; font-size: var(--ds-text-body); }
    .ds-sd__muted { font-size: var(--ds-text-caption); color: var(--ds-text-muted); }
  `,
})
export class DsSectionDesignerComponent {
  protected readonly layout = inject(SectionLayoutService);
  protected readonly widths = SECTION_COL_WIDTHS;

  protected readonly sections = computed(() => this.layout.catalogSections());
  protected readonly integrators = computed(() => this.layout.integrators());
  /** The "Available sections" block can be collapsed to free space for the structure. */
  protected readonly catalogOpen = signal(true);
  protected readonly rows = computed(() => this.layout.desktopRows());
  protected readonly mobile = computed(() => this.layout.mobilePages());

  /** Catalog grouped by integrator (only when the page declares more than one). */
  protected readonly catalogGroups = computed<{ key: string; items: SectionCatalogItem[] }[]>(() => {
    const items = this.sections();
    if (this.integrators().length <= 1) return [{ key: '', items }];
    const map = new Map<string, SectionCatalogItem[]>();
    for (const it of items) {
      const key = it.integrators?.length ? it.integrators.join(' · ') : 'all';
      map.set(key, [...(map.get(key) ?? []), it]);
    }
    return [...map.entries()].map(([key, list]) => ({ key, items: list }));
  });

  /** Integrator badge for a section: its own list, the single declared one, or 'all'. */
  protected badge(item: SectionCatalogItem): string {
    if (item.integrators?.length) return item.integrators.join(' · ');
    const list = this.integrators();
    return list.length === 1 ? list[0] : '';
  }

  // ── Desktop blocks / rows helpers ──
  protected readonly blocks = computed(() => this.layout.blocks());
  private readonly collapsed = signal<Set<string>>(new Set<string>());
  protected isCollapsed(blockId: string): boolean { return this.collapsed().has(blockId); }
  protected toggleBlock(blockId: string): void {
    this.collapsed.update((s) => {
      const next = new Set(s);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }
  protected readonly looseRows = computed(() => this.rows().filter((r) => !r.blockId));
  protected rowsOf(blockId: string): SectionLayoutRow[] { return this.rows().filter((r) => r.blockId === blockId); }
  protected rowIndex(row: SectionLayoutRow): number { return this.rows().indexOf(row); }
  protected renameBlock(blockId: string, target: HTMLInputElement): void { this.layout.renameBlock(blockId, target.value); }

  /** Catalog sections NOT yet in this column (the "+ section" dropdown). */
  protected availableFor(sections: string[]): string[] {
    return this.sections().map((s) => s.id).filter((id) => !sections.includes(id));
  }

  /** Add a section to a column (row) from the "+ section" dropdown. */
  protected addSection(rowId: string, colId: string, target: HTMLSelectElement): void {
    if (!target.value) return;
    this.layout.assignSection(rowId, colId, target.value);
    target.value = '';
  }

  protected label(id: string): string {
    return this.layout.catalog()[id]?.label ?? id;
  }

  protected toggle(id: string): void {
    if (this.layout.isAssigned(id)) {
      this.layout.unassignSection(id);
    } else {
      const rows = this.layout.desktopRows();
      if (rows.length && rows[0].cols.length) this.layout.assignSection(rows[0].id, rows[0].cols[0].id, id);
      else if (this.layout.mobilePages().length) this.layout.assignSectionToPage(this.layout.mobilePages()[0].id, id);
      else this.layout.addPage(), this.layout.assignSectionToPage(this.layout.mobilePages()[0].id, id);
    }
  }

  protected setWidth(rowId: string, colId: string, target: HTMLSelectElement): void {
    this.layout.setColumnWidth(rowId, colId, target.value as SectionColWidth);
  }

  protected setPageLabel(pageId: string, target: HTMLInputElement): void {
    this.layout.updatePageLabel(pageId, target.value);
  }
}
