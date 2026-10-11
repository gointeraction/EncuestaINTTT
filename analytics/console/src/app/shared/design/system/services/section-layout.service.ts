import { Injectable, computed, inject, signal } from '@angular/core';
import { ThemeService } from './theme.service';

/* ── Section-layout model (unifies the former ux + core dashboard-layout) ──── */

export const SECTION_COL_WIDTHS = [
  'flex-1', 'w-64', 'w-80', 'w-96',
  'col-span-3', 'col-span-4', 'col-span-5', 'col-span-8', 'col-span-12',
] as const;
export type SectionColWidth = (typeof SECTION_COL_WIDTHS)[number];

export interface SectionLayoutCol { id: string; width: SectionColWidth; sections: string[]; }
/** A block is a full-width CONTAINER that groups one or more rows. */
export interface SectionLayoutBlock { id: string; label: string; }
export interface SectionLayoutRow { id: string; cols: SectionLayoutCol[]; blockId?: string; }
export interface SectionLayoutPage { id: string; label: string; sections: string[]; }
/** How mobile renders the layout: `tabs` (like desktop, several sections per tab) or
 *  `menu` (one page/section at a time, chosen from a selection menu). */
export type MobileStrategy = 'tabs' | 'menu';
export interface SectionLayoutPreference {
  pageId: string;
  version: number;
  desktop: SectionLayoutRow[];
  /** Optional blocks: full-width containers; a row with `blockId` renders inside its block. */
  blocks?: SectionLayoutBlock[];
  mobile: SectionLayoutPage[];
  /** Mobile rendering strategy (default 'tabs'). */
  mobileStrategy?: MobileStrategy;
  /** Catalog ids known when this layout was saved (lets NEW sections be placed once). */
  known?: string[];
}
export interface SectionCatalogEntry {
  label: string;
  defaultWidth: SectionColWidth;
  /** i18n key of the section's on-page title (the designer shows it translated). */
  titleKey?: string;
  /** Integrators that render this section (e.g. ['universal']); empty = rendered by all. */
  integrators?: string[];
}
export interface SectionCatalogItem extends SectionCatalogEntry { id: string; assigned: boolean; }

/** What a page declares to make its body sections manageable (order + visibility). */
export interface SectionLayoutConfig {
  catalog: Record<string, SectionCatalogEntry>;
  defaults: SectionLayoutPreference;
  /** The page's integrators (e.g. ['universal'] or ['universal', 'mobile']). */
  integrators?: string[];
  /** section id → component type, resolved by the page's shell outlet. */
  registry?: Record<string, string>;
}

const LS_PREFIX = 'inv_section_layout_';

/**
 * SectionLayoutService — the SINGLE, official tool to manage a page's body
 * sections: reorder (rows/cols/pages) and visibility (assign/unassign). ROOT +
 * keyed by the ACTIVE page (from `ThemeService.pageMetadata().page`), so EVERY
 * page gets it by simply `register()`ing its catalog + defaults. Persisted per
 * page in localStorage; the designer sidebox + a shell renderer read it.
 */
@Injectable({ providedIn: 'root' })
export class SectionLayoutService {
  private readonly theme = inject(ThemeService);

  private readonly configs = new Map<string, SectionLayoutConfig>();
  private readonly layouts = signal<Record<string, SectionLayoutPreference>>({});
  private readonly sideboxOpen = signal(false);

  /** Designer UI state (shared so page + designer stay in sync). */
  readonly platform = signal<'desktop' | 'mobile'>('desktop');
  readonly selection = signal<string[]>([]);
  readonly isSideboxOpen = this.sideboxOpen.asReadonly();

  /** Active page = the routed page that declared itself via pageMetadata. */
  readonly activePageId = computed(
    () => (this.theme.pageMetadata() as { page?: string } | null)?.page ?? null,
  );

  /** Register a page's section catalog + default layout (called by the page). */
  register(pageId: string, config: SectionLayoutConfig): void {
    this.configs.set(pageId, config);
    const raw = this._storage()?.getItem(LS_PREFIX + pageId) ?? null;
    let stored: SectionLayoutPreference | null = null;
    if (raw) {
      try { stored = JSON.parse(raw) as SectionLayoutPreference; } catch { stored = null; }
    }
    // A structural change bumps `defaults.version` → reset to the new defaults.
    // Same version → keep the user layout, reconciling any NEW catalog sections.
    const layout = stored && stored.version === config.defaults.version
      ? this._reconcile(stored, config)
      : this._withKnown(this._clone(config.defaults), config);
    this.layouts.update((m) => ({ ...m, [pageId]: layout }));
    this._persist(pageId);
  }

  hasLayout(pageId: string | null = this.activePageId()): boolean {
    return !!pageId && !!this.layouts()[pageId];
  }
  layout(pageId: string | null = this.activePageId()): SectionLayoutPreference | null {
    return pageId ? this.layouts()[pageId] ?? null : null;
  }
  desktopRows(pageId: string | null = this.activePageId()): SectionLayoutRow[] {
    return this.layout(pageId)?.desktop ?? [];
  }
  mobilePages(pageId: string | null = this.activePageId()): SectionLayoutPage[] {
    return this.layout(pageId)?.mobile ?? [];
  }
  catalog(pageId: string | null = this.activePageId()): Record<string, SectionCatalogEntry> {
    return (pageId && this.configs.get(pageId)?.catalog) || {};
  }
  integrators(pageId: string | null = this.activePageId()): string[] {
    return (pageId && this.configs.get(pageId)?.integrators) || [];
  }

  catalogSections(pageId: string | null = this.activePageId()): SectionCatalogItem[] {
    const assigned = this.assignedIds(pageId);
    return Object.entries(this.catalog(pageId))
      .map(([id, e]) => ({ ...e, id, assigned: assigned.has(id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  assignedIds(pageId: string | null = this.activePageId()): Set<string> {
    const l = this.layout(pageId);
    const set = new Set<string>();
    if (!l) return set;
    for (const row of l.desktop) for (const col of row.cols) for (const s of col.sections) set.add(s);
    for (const page of l.mobile) for (const s of page.sections) set.add(s);
    return set;
  }

  isAssigned(sectionId: string, pageId: string | null = this.activePageId()): boolean {
    return this.assignedIds(pageId).has(sectionId);
  }

  // ─── Desktop row/col ops ─────────────────────────────────────
  addRow(pageId: string | null = this.activePageId()): void {
    this._update(pageId, (l) => l.desktop.push({ id: this._uid('row'), cols: [{ id: this._uid('col'), width: 'flex-1', sections: [] }] }));
  }

  // ─── Desktop BLOCK ops (a block groups rows; both are full width) ──
  blocks(pageId: string | null = this.activePageId()): SectionLayoutBlock[] {
    return this.layout(pageId)?.blocks ?? [];
  }
  addBlock(pageId?: string | null): void {
    this._update(pageId, (l) => {
      if (!l.blocks) l.blocks = [];
      l.blocks.push({ id: this._uid('block'), label: `Block ${l.blocks.length + 1}` });
    });
  }
  removeBlock(blockId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      if (l.blocks) l.blocks = l.blocks.filter((b) => b.id !== blockId);
      for (const row of l.desktop) if (row.blockId === blockId) delete row.blockId;
    });
  }
  renameBlock(blockId: string, label: string, pageId?: string | null): void {
    this._update(pageId, (l) => { const b = l.blocks?.find((x) => x.id === blockId); if (b) b.label = label; });
  }
  /** Put a row inside a block (or take it out with `null`). */
  assignRowToBlock(rowId: string, blockId: string | null, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const row = l.desktop.find((r) => r.id === rowId);
      if (!row) return;
      if (blockId) row.blockId = blockId;
      else delete row.blockId;
    });
  }
  /** Add a row straight inside a block. */
  addRowInBlock(blockId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      l.desktop.push({ id: this._uid('row'), blockId, cols: [{ id: this._uid('col'), width: 'flex-1', sections: [] }] });
    });
  }
  removeRow(rowId: string, pageId?: string | null): void {
    this._update(pageId, (l) => { l.desktop = l.desktop.filter((r) => r.id !== rowId); });
  }
  moveRow(fromIndex: number, toIndex: number, pageId?: string | null): void {
    this._update(pageId, (l) => {
      if (fromIndex < 0 || fromIndex >= l.desktop.length) return;
      const [moved] = l.desktop.splice(fromIndex, 1);
      l.desktop.splice(Math.min(Math.max(toIndex, 0), l.desktop.length), 0, moved);
    });
  }
  addColumn(rowId: string, pageId?: string | null): void {
    this._update(pageId, (l) => { l.desktop.find((r) => r.id === rowId)?.cols.push({ id: this._uid('col'), width: 'flex-1', sections: [] }); });
  }
  removeColumn(rowId: string, colId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const row = l.desktop.find((r) => r.id === rowId);
      if (row && row.cols.length > 1) row.cols = row.cols.filter((c) => c.id !== colId);
    });
  }
  setColumnWidth(rowId: string, colId: string, width: SectionColWidth, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const col = l.desktop.find((r) => r.id === rowId)?.cols.find((c) => c.id === colId);
      if (col && (SECTION_COL_WIDTHS as readonly string[]).includes(width)) col.width = width;
    });
  }

  // ─── Section assignment ──────────────────────────────────────
  assignSection(rowId: string, colId: string, sectionId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const col = l.desktop.find((r) => r.id === rowId)?.cols.find((c) => c.id === colId);
      if (col && !col.sections.includes(sectionId)) col.sections.push(sectionId);
      this._removeFromMobile(l, sectionId);
    });
  }
  removeSectionFromCol(rowId: string, colId: string, sectionId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const col = l.desktop.find((r) => r.id === rowId)?.cols.find((c) => c.id === colId);
      if (col) col.sections = col.sections.filter((s) => s !== sectionId);
    });
  }
  reorderInCol(rowId: string, colId: string, fromIdx: number, toIdx: number, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const col = l.desktop.find((r) => r.id === rowId)?.cols.find((c) => c.id === colId);
      if (!col || fromIdx < 0 || fromIdx >= col.sections.length) return;
      const [moved] = col.sections.splice(fromIdx, 1);
      col.sections.splice(Math.min(Math.max(toIdx, 0), col.sections.length), 0, moved);
    });
  }
  unassignSection(sectionId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      for (const row of l.desktop) for (const col of row.cols) col.sections = col.sections.filter((s) => s !== sectionId);
      for (const page of l.mobile) page.sections = page.sections.filter((s) => s !== sectionId);
    });
  }
  setColumnSections(rowId: string, colId: string, sections: string[], pageId?: string | null): void {
    this._update(pageId, (l) => {
      const col = l.desktop.find((r) => r.id === rowId)?.cols.find((c) => c.id === colId);
      if (col) col.sections = [...new Set(sections)];
    });
  }
  insertInColumn(rowId: string, colId: string, sectionId: string, index: number, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const col = l.desktop.find((r) => r.id === rowId)?.cols.find((c) => c.id === colId);
      if (!col || col.sections.includes(sectionId)) return;
      col.sections.splice(Math.min(Math.max(index, 0), col.sections.length), 0, sectionId);
    });
  }
  moveToColumn(
    fromRowId: string, fromColId: string, toRowId: string, toColId: string, sectionId: string, pageId?: string | null,
  ): void {
    this._update(pageId, (l) => {
      const from = l.desktop.find((r) => r.id === fromRowId)?.cols.find((c) => c.id === fromColId);
      const to = l.desktop.find((r) => r.id === toRowId)?.cols.find((c) => c.id === toColId);
      if (from && to) {
        from.sections = from.sections.filter((s) => s !== sectionId);
        if (!to.sections.includes(sectionId)) to.sections.push(sectionId);
      }
    });
  }

  // ─── Mobile page ops ─────────────────────────────────────────
  addPage(pageId?: string | null): void {
    this._update(pageId, (l) => l.mobile.push({ id: this._uid('page'), label: `Page ${l.mobile.length + 1}`, sections: [] }));
  }
  removePage(mobilePageId: string, pageId?: string | null): void {
    this._update(pageId, (l) => { l.mobile = l.mobile.filter((p) => p.id !== mobilePageId); });
  }
  movePage(fromIndex: number, toIndex: number, pageId?: string | null): void {
    this._update(pageId, (l) => {
      if (fromIndex < 0 || fromIndex >= l.mobile.length) return;
      const [moved] = l.mobile.splice(fromIndex, 1);
      l.mobile.splice(Math.min(Math.max(toIndex, 0), l.mobile.length), 0, moved);
    });
  }
  assignSectionToPage(mobilePageId: string, sectionId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const page = l.mobile.find((p) => p.id === mobilePageId);
      if (page && !page.sections.includes(sectionId)) page.sections.push(sectionId);
      this._removeFromDesktop(l, sectionId);
    });
  }
  removeSectionFromPage(mobilePageId: string, sectionId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const page = l.mobile.find((p) => p.id === mobilePageId);
      if (page) page.sections = page.sections.filter((s) => s !== sectionId);
    });
  }
  reorderPageSections(mobilePageId: string, fromIdx: number, toIdx: number, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const page = l.mobile.find((p) => p.id === mobilePageId);
      if (!page || fromIdx < 0 || fromIdx >= page.sections.length) return;
      const [moved] = page.sections.splice(fromIdx, 1);
      page.sections.splice(Math.min(Math.max(toIdx, 0), page.sections.length), 0, moved);
    });
  }
  updatePageLabel(mobilePageId: string, label: string, pageId?: string | null): void {
    this._update(pageId, (l) => { const p = l.mobile.find((x) => x.id === mobilePageId); if (p) p.label = label; });
  }
  /** Mobile strategy: `tabs` (like desktop) or `menu` (one page/section at a time). */
  mobileStrategy(pageId: string | null = this.activePageId()): MobileStrategy {
    return this.layout(pageId)?.mobileStrategy ?? 'tabs';
  }
  setMobileStrategy(strategy: MobileStrategy, pageId?: string | null): void {
    this._update(pageId, (l) => { l.mobileStrategy = strategy; });
  }
  setPageSections(mobilePageId: string, sections: string[], pageId?: string | null): void {
    this._update(pageId, (l) => {
      const page = l.mobile.find((p) => p.id === mobilePageId);
      if (page) page.sections = [...new Set(sections)];
    });
  }
  moveToPage(fromPageId: string, toPageId: string, sectionId: string, pageId?: string | null): void {
    this._update(pageId, (l) => {
      const from = l.mobile.find((p) => p.id === fromPageId);
      const to = l.mobile.find((p) => p.id === toPageId);
      if (from && to) {
        from.sections = from.sections.filter((s) => s !== sectionId);
        if (!to.sections.includes(sectionId)) to.sections.push(sectionId);
      }
    });
  }

  // ─── General ─────────────────────────────────────────────────
  unassignedIds(pageId: string | null = this.activePageId()): string[] {
    const assigned = this.assignedIds(pageId);
    return Object.keys(this.catalog(pageId)).filter((id) => !assigned.has(id));
  }
  resetToDefault(pageId: string | null = this.activePageId()): void {
    const cfg = pageId ? this.configs.get(pageId) : undefined;
    if (!pageId || !cfg) return;
    this.layouts.update((m) => ({ ...m, [pageId]: this._withKnown(this._clone(cfg.defaults), cfg) }));
    this._persist(pageId);
  }
  forceLayout(pageId: string, layout: SectionLayoutPreference): void {
    this.layouts.update((m) => ({ ...m, [pageId]: this._clone(layout) }));
    this._persist(pageId);
  }
  toggleSidebox(): void { this.sideboxOpen.update((v) => !v); }
  closeSidebox(): void { this.sideboxOpen.set(false); }

  // ─── Internals ───────────────────────────────────────────────
  private _update(pageId: string | null | undefined, fn: (l: SectionLayoutPreference) => void): void {
    const id = pageId ?? this.activePageId();
    if (!id || !this.layouts()[id]) return;
    this.layouts.update((m) => {
      const next = this._clone(m[id]);
      fn(next);
      return { ...m, [id]: next };
    });
    this._persist(id);
  }
  private _persist(pageId: string): void {
    try { this._storage()?.setItem(LS_PREFIX + pageId, JSON.stringify(this.layouts()[pageId])); } catch { /* quota */ }
  }
  private _removeFromMobile(l: SectionLayoutPreference, sectionId: string): void {
    for (const page of l.mobile) page.sections = page.sections.filter((s) => s !== sectionId);
  }
  private _removeFromDesktop(l: SectionLayoutPreference, sectionId: string): void {
    for (const row of l.desktop) for (const col of row.cols) col.sections = col.sections.filter((s) => s !== sectionId);
  }
  private _uid(prefix: string): string { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
  private _clone<T>(v: T): T { return structuredClone(v); }
  private _storage(): Storage | null { return typeof localStorage !== 'undefined' ? localStorage : null; }

  /** Stamp a layout with the catalog ids it knows (so future NEW sections can be placed). */
  private _withKnown(layout: SectionLayoutPreference, config: SectionLayoutConfig): SectionLayoutPreference {
    layout.known = Object.keys(config.catalog);
    return layout;
  }

  /**
   * Reconcile a STORED layout with the current catalog: place catalog sections that
   * were never known (NEW sections) using their default placement, WITHOUT re-adding
   * sections the user may have hidden (those were already known).
   */
  private _reconcile(stored: SectionLayoutPreference, config: SectionLayoutConfig): SectionLayoutPreference {
    const out = this._clone(stored);
    const catalogIds = Object.keys(config.catalog);
    const known = new Set(out.known ?? this._inferKnown(out, config.defaults));
    const newIds = catalogIds.filter((id) => !known.has(id));
    if (newIds.length) {
      const onDesktop = new Set<string>();
      for (const r of out.desktop) for (const c of r.cols) for (const s of c.sections) onDesktop.add(s);
      const onMobile = new Set<string>();
      for (const p of out.mobile) for (const s of p.sections) onMobile.add(s);
      for (const sid of newIds) {
        const loc = this._defaultPlacement(sid, config.defaults);
        if (loc && !onDesktop.has(sid)) {
          let row = out.desktop.find((r) => r.id === loc.rowId);
          if (!row) { row = { id: loc.rowId, cols: [] }; out.desktop.push(row); }
          let col = row.cols.find((c) => c.id === loc.colId);
          if (!col) { col = { id: loc.colId, width: loc.width, sections: [] }; row.cols.push(col); }
          col.sections.push(sid);
          onDesktop.add(sid);
        }
        const page0 = config.defaults.mobile.find((p) => p.sections.includes(sid));
        if (page0 && !onMobile.has(sid)) {
          let page = out.mobile.find((p) => p.id === page0.id);
          if (!page) { page = { id: page0.id, label: page0.label, sections: [] }; out.mobile.push(page); }
          page.sections.push(sid);
          onMobile.add(sid);
        }
      }
    }
    out.known = catalogIds;
    return out;
  }

  /** For a legacy layout without `known`: a section counts as known if it is assigned
   *  OR its default row/page already exists (so hidden sections are not re-added). */
  private _inferKnown(stored: SectionLayoutPreference, defaults: SectionLayoutPreference): string[] {
    const assigned = new Set<string>();
    for (const r of stored.desktop) for (const c of r.cols) for (const s of c.sections) assigned.add(s);
    for (const p of stored.mobile) for (const s of p.sections) assigned.add(s);
    const rowIds = new Set(stored.desktop.map((r) => r.id));
    const pageIds = new Set(stored.mobile.map((p) => p.id));
    const known: string[] = [];
    for (const r of defaults.desktop) for (const c of r.cols) for (const s of c.sections) if (assigned.has(s) || rowIds.has(r.id)) known.push(s);
    for (const p of defaults.mobile) for (const s of p.sections) if (assigned.has(s) || pageIds.has(p.id)) known.push(s);
    return known;
  }

  private _defaultPlacement(
    sectionId: string, defaults: SectionLayoutPreference,
  ): { rowId: string; colId: string; width: SectionColWidth } | null {
    for (const row of defaults.desktop) {
      for (const col of row.cols) {
        if (col.sections.includes(sectionId)) return { rowId: row.id, colId: col.id, width: col.width };
      }
    }
    return null;
  }
}
