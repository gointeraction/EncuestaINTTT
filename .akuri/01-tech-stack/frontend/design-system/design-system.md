---
file: design-system.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: DESIGN_SYSTEM
summary: Design system de la consola Angular — adoptado desde cifraflow-shared
  (design + fab) y adaptado al caso de uso y a la marca INTT. Tokens como única
  fuente de verdad; el FAB es el inspector de tema.
category: design-system
scope: the design-system specification
---

# Tech-Stack — Design System (frontend de consola)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: declara el design system que usará `analytics/console`, su origen, su alcance y su
adaptación. Es la fuente única de verdad de tokens y componentes de la consola.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=ANGULAR (componentes standalone) · TECH=CSS (tokens).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=DS_LIBRARY (componentes + tokens + docs).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=TOKENS_AS_SSOT; DESIGN_PATTERN=TAXONOMY (actions/display/feedback/form/layout/navigation).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-ORIGEN

WRITE INFO: adoptado de **cifraflow-shared** (la implementación más madura disponible):
`cifraflow-frontends/projects/cifraflow-shared/src/lib/design` (componentes + `docs/` + tokens) y
`.../src/lib/fab` (FAB / inspector de tema). Se **vendoriza** dentro de la consola (copia
adaptada) para mantener el backend analítico autocontenido, sin dependencia entre repos.

### SECTION 02-COMPONENTES

WRITE INFO: taxonomía adoptada (relevante para analítica en negrita):
  - actions: button, crud-actions, dashboard-actions, list-actions, quick-actions
  - display: **kpi-card**, **kpi-grid**, **chart**, **table**, activity-timeline, badge, card,
    empty-state, icon, pipeline-list, progress-item, property-card, recent-list, skeleton, surface
  - feedback: alert, alert-panel, ds-error-banner, ds-notification-banner, modal, notification, toast, page-banner
  - form: checkbox, date, field, **filter-bar**, grid, hint, input, radio, section, select, switch, textarea, time, upload
  - layout: ds-container, ds-page-group-nav, ds-scroll-strip, **header**, page-title, panels, section-layout, side-box
  - navigation: breadcrumb, menu, nav, pagination, tabs

### SECTION 03-FAB

WRITE INFO: se incluye el **FAB** (`ds-fab`) como inspector de tema de la consola (pestañas:
brand, colors, typography, spacing, shadows, gradients, effects, surfaces, breakpoints, data-tools,
notifications, ds). Útil para ajustar/verificar tokens en vivo durante el desarrollo.

### SECTION 04-ADAPTACION

WRITE INFO: adopción en `analytics/console` — **vendorizado y compilando**:
  1. Copiado `design/` (144 archivos) + `fab/` (19) + `core/settings/` (seam del host) a
     `src/app/shared/`.
  2. **Tailwind v4** añadido (`tailwindcss` + `@tailwindcss/postcss`, `.postcssrc.json`) y estilos
     globales en `src/styles.css`: `@import "tailwindcss"` → `design/theme.css` → `design/tokens/index.css`.
  3. Alias de módulo vía `tsconfig.json` `paths`: `@cifraflow/design`, `@cifraflow/fab`.
  4. Dependencia `@angular/cdk` (BreakpointObserver) y presupuestos de estilo de Angular ajustados.
  5. Shell mínimo wireado en `src/app/app.ts`/`app.html` (`ds-container kind="display"` + `ds-fab`).
  6. Tokens como SSOT (por adaptar a la marca INTT); ningún componente hardcodea color.

## Fields

1. **technology** — `frontend.design-system` — librería de componentes + tokens de la consola.
2. **major-version** — versionada con la consola (Angular 22).
3. **layer** — frontend.
4. **scope-role** — provee los componentes y tokens de toda la consola analítica.
5. **capabilities** — kpi-card/kpi-grid, chart, table, filter-bar, layout (header/panels/page-title), navigation, feedback, form.
6. **depends-on** — `frontend.angular.admin`.
7. **canonical-files** — `analytics/console/src/app/shared/design/**`, `analytics/console/src/app/shared/fab/**`, `analytics/console/src/app/shared/core/settings/**`, `analytics/console/src/styles.css`, `analytics/console/.postcssrc.json`, `analytics/console/tsconfig.json` (paths).
8. **compliance** — frontend: design-system-tokens (SSOT), api-sdk-only, no-console-log.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa y la librería vendorizada compila en la consola.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
