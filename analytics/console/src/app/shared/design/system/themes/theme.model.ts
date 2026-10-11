/** Design-system theme + viewport model (ds- universal types). */
export type ThemeMode = 'light' | 'dark';
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';
export type CSSVarMap = Record<string, string>;

/** The two structural planes of the design-mode inspector. */
export type PlaneId = 'layout' | 'page';

/** Focus of the design-mode inspector: one plane, or BOTH at once (no dimming). */
export type PlaneFocus = PlaneId | 'both';

/**
 * Canonical container kinds of the UNIFIED ds-container primitive.
 * The design tree (2-digit levels, mandatory every 10, intermediates inside):
 *   display(10) → page(20) → area(30) → row(31)|block(32) → section(40) → subsection(41) → content(50)
 * NESTING RULES:
 *   - `display` is LAYOUT-ONLY: the layout deploys it (exclusive to the layout),
 *     it wraps the <router-outlet/> and hosts the design-mode FAB. Distinguishes
 *     what happens in the layout from what happens in the page.
 *   - `page` is the canvas of the ROUTED page, embedded inside display.
 *   - the MINIMAL canonical spine is display → page → area → section → content.
 *   - `area` is the structural block (roles header/aside/body/footer by name).
 *   - `row` and `block` are GROUPERS (they group sections) — optional layers
 *     between an area and its sections.
 *   - `subsection` lives ONLY inside a section.
 *   - `content` is the innermost block level (leaf) — lives ONLY inside a
 *     section or subsection, never outside them.
 * Parents contain children; siblings sit side by side (rows/blocks). Every level
 * answers the same knobs (bordered, position, background, padded, gap, basis, wrap).
 */
export type DsContainerKind =
  | 'display'
  | 'page'
  | 'area'
  | 'row'
  | 'block'
  | 'section'
  | 'subsection'
  | 'content';

/** Canonical order of the levels (index = level order; display first). */
export const DS_CONTAINER_KINDS: readonly DsContainerKind[] = [
  'display', 'page', 'area', 'row', 'block', 'section', 'subsection', 'content',
];

/** 2-digit level number of each kind (display=10 … content=50; row/block and
 *  subsection are the intermediate levels inside their interval). */
export const DS_KIND_LEVEL: Readonly<Record<DsContainerKind, number>> = {
  display: 10, page: 20, area: 30, row: 31, block: 32, section: 40, subsection: 41, content: 50,
};

export interface ViewportState {
  size: ViewportSize;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}