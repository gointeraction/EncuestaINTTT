# Design System — Taxonomía de componentes

> Document: DS-TAXO-001 · Status: ACTIVE · Date: 2026-09-20 (amended: bloques funcionales + adopted fuera del DS)
> Governs: `invesfront/src/app/shared/design/components` (A3)
> Método: Akuri-OMA — clasificación por complejidad y dominio de uso, no por posición en disco.

## Estructura física — bloques funcionales

Los componentes del DS viven agrupados por bloque funcional (`components/<bloque>/<nombre>/`):

| Bloque | Contenido |
|---|---|
| `layout/` | Primitive outside-in: `ds-container` único (kind=display/page/area/row/section/subsection/content) |
| `actions/` | Acciones del usuario: `ds-button`, `ds-fab` |
| `form/` | Todo control de entrada + bloques de form (forms y filters) |
| `navigation/` | `ds-nav`, `ds-menu-panel`, `ds-icon-menu`, `ds-tabs`, `ds-breadcrumb`, `ds-pagination` |
| `feedback/` | Feedback/atención transitoria: `ds-alert`, `ds-notification`, `ds-toast`, `ds-modal` |
| `display/` | Presentación + datos: `ds-surface`, `ds-badge`, `ds-icon`, `ds-empty-state`, `ds-kpi-card`, `ds-table`, `ds-chart` |

Los componentes migrados desde la capa OMA ya no viven aquí: ver **ADOPTED** más abajo.

## Criterio de clasificación

| Categoría | Definición | Dónde vive | Regla |
|---|---|---|---|
| **Standard** | Componentes atómicos, presentacionales, sin estado interno propio. Reciben datos → renderizan. | `components/<name>/` | Exportados por el barrel; pueden combinarse para construir complex/custom. |
| **Complex** | Estado interno + lógica de interacción: popups/overlays, drag & drop, data-binding, navegación por teclado, gestión de foco. | `components/<name>/` | Exportados por el barrel; mismos contratos de tokens que los standard. |
| **Custom** | Uso específico de la aplicación (property cards, tarjetas de integración, matrices, …). Componen piezas del DS para un caso de negocio. | **Fuera del DS** — `modules/**/sections/`, `shared/layouts/**/sections/` | No entran al barrel ni al DS; el DS los referencia en esta taxonomía como consumidores para saber que existen (build-on-demand). |

Los custom **no** se construyen dentro del design system. Si un custom revela un patrón reutilizable, ese patrón vuelve al DS como standard/complex con fila en `construction-kit.inventory.md` (never bottom-up silencioso).

---

## STANDARD

Componentes atómicos, sin estado interno, tokens-only. Ordenados por familia.

| Componente | Selector | Rol |
|---|---|---|
| `layout` | `ds-layout` | Canvas raíz de página (outside-in) |
| `layout` | `ds-container` | Contenedor canónico por `kind` (display/page/area/row/block/section/subsection/content) — 1 sola primitiva; árbol mínimo display→page→area→section→content; `display`=solo layout (envuelve el outlet + hosts el FAB), `page`=canvas de la página ruteada, `area`=bloque estructural, row/block son groupers de sections, `content`=hoja solo dentro de section/subsection. Niveles de 2 dígitos: display=10, page=20, area=30, row=31, block=32, section=40, subsection=41, content=50 |
| `layout` | `ds-row` | Franja horizontal / grid dentro de un contenedor |
| `layout` | `ds-section` | Bloque de contenido con título dentro de una row |
| `layout` | `ds-subsection` | Grupo hoja opcional dentro de una section |
| `display` | `ds-surface` | Capa de fondo de cards/pages (solid/gradient/image/video + overlay) |
| `form` | `ds-form-field` | Wrapper de campo: label + slot + estado/hint/error |
| `form` | `ds-form-input` | Input de texto (text/email/password/number/tel/url) |
| `form` | `ds-form-checkbox` | Checkbox (terms/privacy, toggles) |
| `form` | `ds-form-radio` | Radio (grupo por name) |
| `form` | `ds-form-switch` | Toggle switch |
| `form` | `ds-form-textarea` | Multi-línea |
| `form` | `ds-form-hint` | Elemento informativo (help/note/warning) |
| `form` | `ds-form-actions` | Botonera de acciones (submit dimmed-hasta-válido/cancel/reset) |
| `form` | `ds-form-section` | Bloque (sub-sección) de form con título |
| `form` | `ds-filter-bar` | FILTRO = form de primera clase (búsqueda + selects + contador) |
| `actions` | `ds-button` | Acción. Variantes: primary/secondary/brand-outline/ghost/premium/destructive/danger/success/warning/info |
| `display` | `ds-badge` | Estado/resaltado. Variantes solid/dot; tonos 11 (neutral/brand/success/warning/danger/info/sand + operativos locked/awaiting/blocked/offline) |
| `feedback` | `ds-alert` | Feedback transitorio in-page, dismissible |
| `feedback` | `ds-notification` | Feedback persistente (NO auto-dismiss) |
| `feedback` | `ds-toast` | Feedback flotante transitorio (lo posee el host) |
| `display` | `ds-icon` | Icono Lucide por nombre (registro curado) |
| `navigation` | `ds-nav` | Navegación horizontal (underline/pills/segmented) |
| `navigation` | `ds-tabs` | Pestañas (underline/boxed), selectable o router-link |
| `navigation` | `ds-breadcrumb` | Migas de pan |
| `navigation` | `ds-pagination` | Paginación con elipsis |
| `display` | `ds-empty-state` | Estado vacío/loading/skeleton con acción |
| `display` | `ds-kpi-card` | Métrica de dashboard (label + valor + trend) |
| `actions` | `ds-fab` | Entrada de design-mode (tooling, no producto) |

## COMPLEX

Estado interno + lógica de interacción. Mismo contrato de tokens, más superficie.

| Componente | Selector | Complejidad |
|---|---|---|
| `form` | `ds-form-select` | Listbox con búsqueda, panel fixed, backdrop, keyboard |
| `form` | `ds-form-date` | Date picker: grid de calendario, panel fixed, min/max |
| `form` | `ds-form-date-range` | Rango de fechas (dos calendarios) |
| `form` | `ds-form-time` | Time picker: panel fixed |
| `form` | `ds-form-time-range` | Rango de horas |
| `form` | `ds-form-upload` | Drag & drop, lista por archivo con progreso, inyectado/desacoplado |
| `display` | `ds-table` | Tabla de datos: columnas tipadas, formaters, filas clickeables |
| `display` | `ds-chart` | Gráfico de barras (data-viz tokens) |
| `feedback` | `ds-modal` | Overlay + foco/Esc, slots title/body/footer |
| `navigation` | `ds-menu-panel` | Panel de menú desplegable (tabs/secciones/items) |
| `navigation` | `ds-icon-menu` | Menú de iconos (grid compacto) |

## ADOPTED — componentes consolidados de la capa UX (2026-10-08)

La capa `shared/ux` fue **eliminada**. Todos sus componentes relevantes viven ahora
en `design/components/` (agrupados por bloque funcional). Los que conservaban el
prefijo `ds-` por compatibilidad lo mantienen; los `ux-*` de vocabulario de negocio
fueron **renombrados a `ds-*`** (selector, clase y tipos; 2026-10-08). Consolidación
2026-09-20: de 29 componentes solo quedaron los
12 con uso real; los 22 sin uso fueron eliminados (git conserva el historial) y
`shared/components` desapareció.

| Bloque | Selector | Estado |
|---|---|---|
| `feedback/` | `ds-error-banner` | banners de error de página (header-banner sections) |
| `feedback/` | `ds-notification-banner` | banners de notificación de página (header-banner sections) |
| `layout/` | `ds-page-group-nav` | navegación por grupos de páginas |
| `layout/panels/` | `ds-panel-container` / `-header` / `-body` / `-modal` | paneles laterales / modales |
| `display/badge/` | `ds-badge[shape=pill/rounded]` | badge de estado de propuesta (ex `ds-status-badge`) |
| `display/chart/` | `ds-chart[type=donut]` | gráfico donut (ex `ds-donut-chart`) |
| `display/chart/` | `ds-chart[type=bar]` | gráfico de barras completado/target (ex `ds-bar-chart`) |

> Consolidación 2026-10-08: `ds-toggle` y `ux-toggle` → absorbidos por `ds-form-switch`;
> `ux-filter-bar` → `ds-filter-bar`; `ds-dashboard-designer-sidebox` → **eliminado**
> (deprecado, sin consumidores, referenciaba un `core/` eliminado);
> `ds-status-badge` → variante de `ds-badge` (`shape`); `ds-bar-chart` y `ds-donut-chart`
> → variantes de `ds-chart` (`type`).

## CUSTOM — consumidores actuales (dentro del DS, `design/components`)

Los custom de la aplicación viven en `design/components/` (capa antes llamada `shared/ux`,
consolidada 2026-10-08) o en los módulos. Componen `ds-*` con vocabulario de negocio.

### Components de aplicación (antes `shared/ux`)
| Componente | Selector | Rol | Consume |
|---|---|---|---|
| `ds-header` | `ds-header` | **Estructura** — container de filas/secciones/subsecciones | tokens |
| `ds-page-title` | `ds-page-title` | Título (back + título + subtítulo) | `ds-icon` |
| `ds-crud-actions` | `ds-crud-actions` | Acciones modo view/create/edit | `ds-button`, `ds-icon` |
| `ds-dashboard-actions` | `ds-dashboard-actions` | Acciones dashboard (refresh/export/slot) | `ds-button`, `ds-icon` |
| `ds-list-actions` | `ds-list-actions` | Acciones list (new/refresh/export/slot) | `ds-button`, `ds-icon` |
| `ds-property-card` | `ds-property-card` | property card grid/list | `ds-icon`, `ds-badge`, tokens |
| `ds-side-box` | `ds-side-box` | mini página lateral (header/body/footer) | `ds-icon`, tokens |
| `ds-skeleton` | `ds-skeleton` | loading shimmer (table/card/form/kpi) | tokens |
| `ds-filter-bar` | `ds-filter-bar` | búsqueda + selects + contador | tokens |
| `ds-activity-timeline` | `ds-activity-timeline` | feed vertical (compact/full) | `ds-icon` |
| `ds-form-switch` | `ds-form-switch` | switch on/off (ex ds-toggle + ux-toggle) | tokens |

### Widgets de dashboard (antes `shared/ux`, familia dashboard)
| Componente | Selector | Rol | Compone |
|---|---|---|---|
| `ds-card` | `ds-card` | tarjeta contenedora (slots header/body/footer), base de widgets | tokens |
| `ds-kpi-grid` | `ds-kpi-grid` | 4–8 KPIs auto-ajustables (columnas por cantidad, font por longitud) | `ds-icon` |
| `ds-chart-card` | `ds-chart-card` | presentador de gráfico (header + `ds-chart` o ng-content) | `ds-chart` |
| `ds-recent-list` | `ds-recent-list` | listado 5–10 recientes (icono/título/subtitle/tiempo/autor) | `ds-icon` |
| `ds-data-table-card` | `ds-data-table-card` | tabla con header + paginación | `ds-table`, `ds-pagination` |
| `ds-agenda-list` | `ds-agenda-list` | agenda del día (hora/dot/título/chevron) | `ds-icon` |
| `ds-progress-item` | `ds-progress-item` | tarjeta con barra de progreso + etapas | `ds-icon` |
| `ds-section-layout` | `ds-section-layout` | **renderer oficial del layout** — filas/cols → grid (desktop) + páginas (mobile) vía `ngComponentOutlet` + registry | `ngComponentOutlet` |
| `ds-section-designer` | `ds-section-designer` | sidebox oficial (catálogo, filas/cols/páginas, reset) sobre `SectionLayoutService` | `ds-icon` |
| `ds-quick-actions` | `ds-quick-actions` | grid de tiles de acción rápida (icono+label+badge) | `ds-icon` |
| `ds-alert-panel` | `ds-alert-panel` | feed de severidad/hallazgos (accent bar + chip tonal + acción/dismiss) | `ds-icon` |
| `ds-pipeline-list` | `ds-pipeline-list` | funnel por etapas con % (barra de progreso por stage) | `ds-icon` |

### Módulo inventory
| Custom | Consume |
|---|---|
| `inventory-dashboard-kpis` | `ds-kpi-card`, `ds-empty-state` |
| `inventory-dashboard-alerts` | `ds-alert` |
| `inventory-dashboard-movement` | `ds-chart` |
| `inventory-catalog-table` | `ds-table` |
| `inventory-catalog-detail` | `ds-form-field`, `ds-badge` |
| `inventory-catalog-toolbar` | `ds-button`, `ds-icon` |
| `inventory-stock-matrix` | `ds-table` |
| `inventory-stock-adjust-modal` | `ds-modal`, `ds-form-field`, `ds-button`, `ds-alert` |
| `inventory-stock-transfer-modal` | `ds-modal` |
| `inventory-purchase-orders-list` | `ds-table` |
| `inventory-purchase-orders-receiving` | `ds-alert`, `ds-button` |
| `inventory-integrations-cards` | `ds-badge`, `ds-button` (property-card style) |
| `inventory-operations-route` / `-scan` | `ds-button`, `ds-badge` |
| `inventory-reports-*` | `ds-chart`, `ds-table` |
| `inventory-settings-*` | `ds-table`, `ds-modal` |

### Layout estándar
| Custom | Consume |
|---|---|
| `header-desktop` / `header-mobile` / `footer-mobile` | `ds-container`, `ds-nav`, `ds-icon`, `ds-badge` |
| `standard-toasts` | `ds-toast` (host del canal de notificaciones) |

> Regla: todo custom nuevo que necesite lógica no cubierta por el DS abre un gap → el gap se resuelve en el DS (tokens/variante/componente) antes de parchear en el módulo.

## Showcase — cobertura

| Estado | Páginas |
|---|---|
| ✅ Con página | buttons, badges, alerts, cards, color, empty, externals, forms, icons, modals, navigation, tables, typography, **states** (System states — 17 §13, 2026-09-08) |
| ⚠️ Sin página (renderizable en módulos, pendiente demo) | breadcrumb, chart, form/date, form/date-range, form/field, kpi-card, menu, notification, pagination, form/select, tabs, form/time, form/time-range, toast, form/upload, layout |

## Reglas de mantenimiento

1. **Standard y complex viven juntos**, organizados por **bloques funcionales** (`components/<bloque>/<nombre>/`, ver tabla de estructura física) — imports simples y barrel único en `components/index.ts`.
2. **Un componente cambia de categoría solo por decisión explícita** (amendment a este doc) — nunca por el código que lo consume.
3. **El gate `check-colors.mjs` se aplica por igual** a standard y complex; los custom de la app también (misma fuente de tokens).
4. **Nuevos custom** se registran en la tabla de consumidores de este documento al crearse (build-on-demand).