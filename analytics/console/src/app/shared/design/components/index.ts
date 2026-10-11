/* design-system components barrel — one entry per CATEGORY.
   Each category is a folder with its own index.ts. Functional blocks:
     layout/     — outside-in primitives (ds-container unico: kind=page|container|row|section|subsection)
     actions/    — user actions (ds-button; the FAB lives in ../../fab)
     form/       — every data-entry control + form blocks (forms AND filters live here)
     navigation/ — nav, menu, tabs, breadcrumb, pagination
     feedback/   — alert, notification, toast, modal (transient attention/overlays)
     display/    — presentational + data display (badge, chart, empty-state, icon, kpi-card, surface, table)
   Components are standalone + OnPush and use ONLY design tokens + Tailwind.
   The FAB (design tool) is separated in ../../fab — never mixed with product components. */
export * from './layout';
export { DsButtonComponent } from './actions/button/button.component';
export { DsQuickActionsComponent } from './actions/quick-actions/quick-actions.component';
export type { DsQuickAction, DsQuickActionTone } from './actions/quick-actions/quick-actions.component';
export { DsCrudActionsComponent } from './actions/crud-actions/crud-actions.component';
export type { DsCrudMode } from './actions/crud-actions/crud-actions.component';
export { DsDashboardActionsComponent } from './actions/dashboard-actions/dashboard-actions.component';
export { DsListActionsComponent } from './actions/list-actions/list-actions.component';
export { DsIconComponent } from './display/icon/icon.component';
export { DsBadgeComponent } from './display/badge/badge.component';
export { DsSurfaceComponent } from './display/surface/surface.component';
export { DsCardComponent } from './display/card/card.component';
export { DsEmptyStateComponent } from './display/empty-state/empty-state.component';
export { DsSkeletonComponent } from './display/skeleton/skeleton.component';
export { DsTableComponent } from './display/table/table.component';
export type { DsTableColumn, DsTableRow } from './display/table/table.component';
export { DsDataTableCardComponent } from './display/table/data-table-card.component';
export { DsKpiCardComponent } from './display/kpi-card/kpi-card.component';
export { DsKpiGridComponent } from './display/kpi-grid/kpi-grid.component';
export type { DsKpiItem, DsKpiTone } from './display/kpi-grid/kpi-grid.component';
export { DsChartComponent } from './display/chart/chart.component';
export type { DsChartSeries, DsChartType, DonutSegment, BarChartData } from './display/chart/chart.component';
export { DsChartCardComponent } from './display/chart/chart-card.component';
export { DsActivityTimelineComponent } from './display/activity-timeline/activity-timeline.component';
export type { DsTimelineEvent, DsTimelineDensity } from './display/activity-timeline/activity-timeline.component';
export { DsAgendaListComponent } from './display/agenda-list/agenda-list.component';
export type { DsAgendaItem } from './display/agenda-list/agenda-list.component';
export { DsPipelineListComponent } from './display/pipeline-list/pipeline-list.component';
export type { DsPipelineStage, DsPipelineTone } from './display/pipeline-list/pipeline-list.component';
export { DsProgressItemComponent } from './display/progress-item/progress-item.component';
export type { DsProgressItemData, DsProgressStage, DsProgressStageStatus } from './display/progress-item/progress-item.component';
export { DsPropertyCardComponent } from './display/property-card/property-card.component';
export type { DsPropertyData, DsPropertyStatus, DsPropertyListingType, DsPropertyViewMode } from './display/property-card/property-card.component';
export { DsRecentListComponent } from './display/recent-list/recent-list.component';
export type { DsRecentItem, DsRecentTone } from './display/recent-list/recent-list.component';
export { DsAlertComponent } from './feedback/alert/alert.component';
export { DsNotificationComponent } from './feedback/notification/notification.component';
export { DsToastHostComponent } from './feedback/toast-host.component';
export { DsModalComponent } from './feedback/modal/modal.component';
export { DsToastComponent } from './feedback/toast/toast.component';
export type { DsToastTone } from './feedback/toast/toast.component';
export { DsAlertPanelComponent } from './feedback/alert-panel/alert-panel.component';
export type { DsAlertItem, DsAlertTone } from './feedback/alert-panel/alert-panel.component';
export { DsErrorBannerComponent } from './feedback/ds-error-banner/ds-error-banner.component';
export { DsNotificationBannerComponent } from './feedback/ds-notification-banner/ds-notification-banner.component';
export { DsPageBannerComponent } from './feedback/page-banner/page-banner.component';
export { DsNavComponent } from './navigation/nav/nav.component';
export type { DsNavItem, DsNavVariant, DsNavSize } from './navigation/nav/nav.component';
export { DsMenuPanelComponent } from './navigation/menu/menu-panel.component';
export type { DsMenuTab, DsMenuSection, DsMenuItem, DsMenuChildItem } from './navigation/menu/menu-panel.component';
export { DsIconMenuComponent } from './navigation/menu/icon-menu.component';
export type { DsIconMenuItem } from './navigation/menu/icon-menu.component';
export { DsTabsComponent } from './navigation/tabs/tabs.component';
export type { DsTabItem, DsTabsVariant, DsTabsSize } from './navigation/tabs/tabs.component';
export { DsBreadcrumbComponent } from './navigation/breadcrumb/breadcrumb.component';
export type { DsBreadcrumbItem, DsBreadcrumbSize } from './navigation/breadcrumb/breadcrumb.component';
export { DsPaginationComponent } from './navigation/pagination/pagination.component';
export type { DsPaginationSize } from './navigation/pagination/pagination.component';
export { DsFormFieldComponent } from './form/field/form-field.component';
export type { DsFormFieldState } from './form/field/form-field.component';
export { DsFormGridComponent } from './form/grid/form-grid.component';
export type { DsFormGridCols } from './form/grid/form-grid.component';
export { DsFormInputComponent } from './form/input/form-input.component';
export { DsFormCheckboxComponent } from './form/checkbox/form-checkbox.component';
export { DsFormRadioComponent } from './form/radio/form-radio.component';
export { DsFormSwitchComponent } from './form/switch/form-switch.component';
export { DsFormTextareaComponent } from './form/textarea/form-textarea.component';
export { DsFormHintComponent } from './form/hint/form-hint.component';
export { DsFormActionsComponent } from './form/actions/form-actions.component';
export { DsFormSectionComponent } from './form/section/form-section.component';
export { DsFormSelectComponent } from './form/select/form-select.component';
export type { DsFormSelectOption, DsFormSelectState } from './form/select/form-select.component';
export { DsFormDateComponent } from './form/date/form-date.component';
export type { DsFormDateState } from './form/date/form-date.component';
export { DsFormDateRangeComponent } from './form/date/form-date-range.component';
export type { DsFormDateRangeState, DsFormDateRangeValue } from './form/date/form-date-range.component';
export { DsFormTimeComponent } from './form/time/form-time.component';
export type { DsFormTimeState } from './form/time/form-time.component';
export { DsFormTimeRangeComponent } from './form/time/form-time-range.component';
export type { DsFormTimeRangeState, DsFormTimeRangeValue } from './form/time/form-time-range.component';
export { DsFormUploadComponent } from './form/upload/form-upload.component';
export type { DsFormUploadState, DsFormUploadStatus, DsFormUploadFile, DsFormUploadConfig } from './form/upload/form-upload.component';
export { DsFilterBarComponent } from './form/filter-bar/form-filter-bar.component';