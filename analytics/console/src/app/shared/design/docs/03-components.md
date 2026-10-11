# 03 · Componentes (`design/components`)

> Documento: **DS-COMP-001** · Status: ACTIVE · 2026-10-08
> Lectura previa: [01-architecture.md](./01-architecture.md) · Catálogo completo: `components/` + `taxonomy.md`

Todos los componentes del DS son **standalone + OnPush**, se nombran `ds-*`, consumen
**solo tokens + Tailwind** y se importan donde se usan. Este documento es el catálogo
por bloque + las convenciones de uso.

---

## 1. Convenciones

- **Inputs como signals**: `readonly title = input.required<string>();`, `readonly size = input('md');`
- **Outputs como signals**: `readonly save = output<Payload>();`
- **Estilo**: `var(--ds-*)` o utilidades Tailwind que mapean a tokens (`theme.css`).
- **No dependencias de negocio**: los consumidores mapean sus DTOs a los tipos `ds-*`.
- **Clasificación**: la distinción *estándar / adoptado / custom* y su historia viven en
  [`components/taxonomy.md`](../components/taxonomy.md).

---

## 2. Catálogo por bloque

### 2.1 `layout/` — estructura

| Componente | Selector | Qué hace |
|---|---|---|
| `DsContainerComponent` | `ds-container` | **Único primitivo de layout**: 8 *kinds* jerárquicos. Ver [04-layout.md](./04-layout.md) |
| `DsScrollStripComponent` | `ds-scroll-strip` | franja con scroll horizontal |
| `DsPageGroupNavComponent` | `ds-page-group-nav` | navegación por grupos de páginas |
| `DsHeaderComponent` | `ds-header` | contenedor estructural de filas/secciones |
| `DsPageTitleComponent` | `ds-page-title` | título de página (back + título + subtítulo) |
| `DsPanelContainer`/`-Header`/`-Body`/`-Modal` | `ds-panel-*` | paneles laterales / modales |
| `DsSectionLayoutComponent` | `ds-section-layout` | **renderer oficial** de páginas de secciones |
| `DsSectionDesignerComponent` | `ds-section-designer` | sidebox de diseño sobre `SectionLayoutService` |
| `DsSideBoxComponent` | `ds-side-box` | mini página lateral (header/body/footer) |

### 2.2 `actions/` — acciones de usuario

| Componente | Selector | Qué hace |
|---|---|---|
| `DsButtonComponent` | `ds-button` | botón base (variantes/tamaños/tone) |
| `DsQuickActionsComponent` | `ds-quick-actions` | grid de tiles de acción rápida |
| `DsCrudActionsComponent` | `ds-crud-actions` | barra de acciones CRUD (modo view/create/edit) |
| `DsDashboardActionsComponent` | `ds-dashboard-actions` | barra de acciones de dashboard (refresh/export/slot) |
| `DsListActionsComponent` | `ds-list-actions` | barra de acciones de listado (New/export/slot) |

### 2.3 `display/` — presentación + datos

| Componente | Selector | Qué hace |
|---|---|---|
| `DsIconComponent` | `ds-icon` | icono (Material Icons) por `name`/`size` |
| `DsBadgeComponent` | `ds-badge` | badge de estado (`tone`, `variant` solid/dot, `shape` standard/pill/rounded) |
| `DsSurfaceComponent` | `ds-surface` | superficie base |
| `DsCardComponent` | `ds-card` | tarjeta contenedora con slots |
| `DsEmptyStateComponent` | `ds-empty-state` | estado vacío (título + cuerpo) |
| `DsSkeletonComponent` | `ds-skeleton` | shimmer de carga |
| `DsTableComponent` | `ds-table` | tabla (columnas configuradas) |
| `DsDataTableCardComponent` | `ds-data-table-card` | tabla con header + paginación |
| `DsKpiCardComponent` | `ds-kpi-card` | tarjeta KPI individual |
| `DsKpiGridComponent` | `ds-kpi-grid` | grid 4–8 KPIs auto-ajustable |
| `DsChartComponent` | `ds-chart` | **chart unificado**: `type='grouped'\|'donut'\|'bar'` |
| `DsChartCardComponent` | `ds-chart-card` | presentador de chart con shell de tarjeta |
| `DsActivityTimelineComponent` | `ds-activity-timeline` | feed vertical de eventos |
| `DsAgendaListComponent` | `ds-agenda-list` | agenda del día |
| `DsPipelineListComponent` | `ds-pipeline-list` | funnel por etapas con % |
| `DsProgressItemComponent` | `ds-progress-item` | tarjeta con barra de progreso + etapas |
| `DsPropertyCardComponent` | `ds-property-card` | tarjeta de propiedad (grid/list) |
| `DsRecentListComponent` | `ds-recent-list` | lista de recientes (5–10) |

### 2.4 `feedback/` — atención transitoria / overlays

| Componente | Selector | Qué hace |
|---|---|---|
| `DsAlertComponent` | `ds-alert` | alerta inline por tone |
| `DsAlertPanelComponent` | `ds-alert-panel` | feed de severidad/hallazgos |
| `DsNotificationComponent` | `ds-notification` | notificación |
| `DsToastComponent` + `DsToastHostComponent` | `ds-toast` / host | toast transitorio (ver `DsToastService`) |
| `DsModalComponent` | `ds-modal` | overlay con foco/Esc + slots |
| `DsErrorBannerComponent` | `ds-error-banner` | banner de error de página |
| `DsNotificationBannerComponent` | `ds-notification-banner` | banner de notificación de página |
| `DsPageBannerComponent` | `ds-page-banner` | banner a nivel de página (declarado por la página) |

### 2.5 `navigation/` — navegación

| Componente | Selector | Qué hace |
|---|---|---|
| `DsNavComponent` | `ds-nav` | navegación principal (variantes/tamaños) |
| `DsMenuPanelComponent` | `ds-menu-panel` | panel de menú desplegable (tabs/secciones/items) |
| `DsIconMenuComponent` | `ds-icon-menu` | menú de iconos (grid compacto) |
| `DsTabsComponent` | `ds-tabs` | tabs |
| `DsBreadcrumbComponent` | `ds-breadcrumb` | breadcrumb |
| `DsPaginationComponent` | `ds-pagination` | paginación |

### 2.6 `form/` — entrada de datos (formularios Y filtros)

| Componente | Selector | Qué hace |
|---|---|---|
| `DsFormFieldComponent` | `ds-form-field` | wrapper label + control + hint/errors (anatomy gobernada) |
| `DsFormGridComponent` | `ds-form-grid` | grid de columnas de formulario |
| `DsFormInputComponent` | `ds-form-input` | input de texto (border reacciona a `state`) |
| `DsFormCheckboxComponent` | `ds-form-checkbox` | checkbox |
| `DsFormRadioComponent` | `ds-form-radio` | radio |
| `DsFormSwitchComponent` | `ds-form-switch` | switch on/off |
| `DsFormTextareaComponent` | `ds-form-textarea` | textarea |
| `DsFormHintComponent` | `ds-form-hint` | hint |
| `DsFormActionsComponent` | `ds-form-actions` | acciones de formulario (submit/cancel) |
| `DsFormSectionComponent` | `ds-form-section` | sección de formulario |
| `DsFormSelectComponent` | `ds-form-select` | select |
| `DsFormDateComponent` / `DsFormDateRangeComponent` | `ds-form-date` / `-range` | fecha / rango |
| `DsFormTimeComponent` / `DsFormTimeRangeComponent` | `ds-form-time` / `-range` | hora / rango |
| `DsFormUploadComponent` | `ds-form-upload` | subida de archivos (config/status) |
| `DsFilterBarComponent` | `ds-filter-bar` | búsqueda + selects + contador |

> Los formularios son "ciudadanos de primera clase": su estructura está gobernada por
> leyes deterministas (label + control + hint + errors; border por `state`). Mantén esa
> anatomía al componer.

---

## 3. Patrón de uso

```ts
import { Component } from '@angular/core';
import { DsButtonComponent, DsCardComponent, DsBadgeComponent } from '<design-barrel>';

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [DsButtonComponent, DsCardComponent, DsBadgeComponent],
  template: `
    <ds-card>
      <h3>Últimos pedidos</h3>
      <ds-badge tone="success" shape="pill">Completado</ds-badge>
      <ds-button (click)="refresh()" tone="brand">Actualizar</ds-button>
    </ds-card>
  `,
})
export class OrdersPanelComponent { /* ... */ }
```

### Mapeo de datos → tipos ds-*

```ts
// La página mapea su DTO al tipo del DS (el DS no conoce el DTO)
const kpis: DsKpiItem[] = rows.map(r => ({ label: r.name, value: r.amount, tone: 'brand' }));
```

---

## 4. Reglas de uso (MUST)

- Prefiere componer `ds-*` antes que crear un custom. Si un patrón se repite en ≥2 módulos
  con la misma forma, proponlo como componente del DS (proceso Akuri-OMA).
- **Caso especial = componente local** del módulo. El DS cubre lo general.
- No sobreescribas tokens ni estilos de componente desde fuera (usa los inputs/knobs).
- Los componentes transitorios (`ds-toast`, `ds-notification`, `ds-*-banner`) se manejan
  **vía servicios** de `system`, no montándolos a mano.
