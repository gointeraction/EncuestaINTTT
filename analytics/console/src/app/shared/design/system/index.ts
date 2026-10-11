/* design-system SYSTEM — runtime mechanisms (theme, viewport). NOT the FAB:
   the design tool (FabService, DsInspectorService) lives separated in ../fab.
   Services are providedIn:'root', self-contained, token-driven. */

export { ThemeService } from './services/theme.service';
export { SettingsService } from '../../core/settings/settings.service';
export type { SettingsShape } from '../../core/settings/settings.service';
export { ViewportService } from './services/viewport.service';
export { DsNotificationService } from './services/notification.service';
export { DsToastService } from './services/toast.service';
export type { ToastTone, ToastPosition, ToastItem } from './services/toast.service';
export { DsMessagesService } from './services/messages.service';
export type { MessageTone, MessageSurface } from './services/messages.service';
export { SectionLayoutService, SECTION_COL_WIDTHS } from './services/section-layout.service';
export type { SectionLayoutRow, SectionLayoutCol, SectionLayoutBlock, SectionLayoutPage, SectionLayoutPreference, SectionCatalogEntry, SectionCatalogItem, SectionColWidth, SectionLayoutConfig } from './services/section-layout.service';
export type { DsNotification, DsNotificationTone } from './services/notification.service';
export { LANGUAGE_SERVICE, NoopLanguageService } from './services/language.service';
export type { ILanguageService, SupportedLang } from './services/language.service';
export { DESIGN_SYSTEM_SERVICE, NoopDesignSystemService } from './services/design-system.service';
export type { IDesignSystemService, DesignSystemOption } from './services/design-system.service';
export { DATA_SOURCE_SERVICE, NoopDataSourceService } from './services/data-source.service';
export type { IDataSourceService, DataOrigin } from './services/data-source.service';
export { DATA_TOOLS_SERVICE, NoopDataToolsService } from './services/data-tools.service';
export type { IDataToolsService, DataPair, DataVerifyResult, DataVerifyStatus, DataManifest, DataModelInfo, DataEndpointInfo, WorkingMemoryInfo, DataFlowStep } from './services/data-tools.service';
export type { ThemeMode, ViewportSize, CSSVarMap, ViewportState, PlaneId, PlaneFocus } from './themes/theme.model';
export type { DsContainerKind } from './themes/theme.model';
export { DS_CONTAINER_KINDS, DS_KIND_LEVEL } from './themes/theme.model';
export { readBreakpoints, BREAKPOINT_TOKENS, DEFAULT_BREAKPOINTS } from './themes/breakpoints';
export type { Breakpoints } from './themes/breakpoints';
