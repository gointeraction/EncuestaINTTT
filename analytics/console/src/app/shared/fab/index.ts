/* FAB — the design tool, self-contained, living OUTSIDE the design system.
   The FAB is a DESIGN TOOL (authoring layer) — a PARTICULAR implementation that
   not every application needs. It depends ON the design system (tokens + system)
   but is NOT part of it: the design system never imports the FAB.
     components/  — the FAB panel, its tabs, the container inspector popup and
                    the data-tools window
     services/    — FabService (state/mode) + DsInspectorService (overlay engine)
     fab-theme.css — its OWN palette (tooling colors + design-mode tokens)
   Consumed via the @cifraflow/fab alias (see tsconfig paths + rspack aliases). */

export { DsFabComponent } from './components/ds-fab.component';
export { DsDataToolsModalComponent } from './components/ds-data-tools-modal.component';
export { DsContainerInspectorPopupComponent } from './components/ds-container-inspector-popup.component';
export { DsFabColorsTabComponent } from './components/ds-fab-colors-tab.component';
export { DsFabSurfacesTabComponent } from './components/ds-fab-surfaces-tab.component';
export { DsFabTypographyTabComponent } from './components/ds-fab-typography-tab.component';
export { DsFabEffectsTabComponent } from './components/ds-fab-effects-tab.component';
export { DsFabGradientsTabComponent } from './components/ds-fab-gradients-tab.component';
export { DsFabShadowsTabComponent } from './components/ds-fab-shadows-tab.component';
export { DsFabSpacingTabComponent } from './components/ds-fab-spacing-tab.component';
export { DsFabBreakpointsTabComponent } from './components/ds-fab-breakpoints-tab.component';
export { DsFabBrandTabComponent } from './components/ds-fab-brand-tab.component';
export { FabService, DEFAULT_INSPECTOR, LEVEL_KEYS } from './services/fab.service';
export type { InspectorPrefs, PlanePrefs } from './services/fab.service';
export { DsInspectorService } from './services/ds-inspector.service';
export type { HardcodedReport, HardcodedViolation } from './services/ds-inspector.service';
export { FabI18nService } from './services/fab-i18n.service';