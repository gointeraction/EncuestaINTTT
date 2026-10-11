# Design System — Akuri-OMA

Design system **embebido, autónomo y reutilizable** pensado para cualquier proyecto
frontend Angular gobernado por la metodología **Akuri-OMA** (A2 declara → A3 construye →
gates deterministas verifican).

Este `design/` no es una librería externa ni un tema de marca: es la **unidad de
construcción** del UI — tokens, componentes, layout y runtime — que cualquier
aplicación Akuri-OMA puede copiar, adaptar y mantener de forma determinista.

> Documento: **DS-README** · Status: ACTIVE · Última revisión: 2026-10-08
> Ubicación: `shared/design/` (carpeta completa: `components/`, `system/`, `tokens/`, `fonts/`, `theme.css`, `docs/`)

---

## Qué es (en 30 segundos)

- **Tokens primero**: toda decisión visual vive en `tokens/` como CSS custom
  properties (`var(--ds-*)`). Cambiar un color de fuente re-vincula todo el sistema.
- **Breakpoints unificados**: una fuente CSS (`breakpoints.css`); servicios TS y
  utilidades Tailwind derivan de ella (ver [10-breakpoints.md](./10-breakpoints.md)).
- **Componentes standalone + OnPush**, solo tokens (cero dependencias de negocio,
  cero estilos hardcodeados). Prefijo unificado `ds-*`.
- **Layout canónico**: un único primitivo `ds-container` con 8 *kinds* jerárquicos +
  `SectionLayoutService` para páginas de secciones.
- **Runtime token-driven**: tema, viewport, toasts, notificaciones, mensajes y seams
  opcionales de i18n / data-source / branding por inyección.
- **FAB separado**: la herramienta de autoría (design tool) vive FUERA del DS, en
  `lib/fab/`, y se usa durante la construcción, no en runtime de producción.
- **Gobernado por Akuri-OMA**: cómo se declara = lo que se construye; los gates
  deterministas auditan estructura, conexión y forma.

---

## Estructura de capas

```
shared/design/
├── index.ts            → barrel público (export * from components + system)
├── components/         → componentes standalone ds-* (6 bloques funcionales)
│   ├── layout/         → ds-container, header, page-title, panels, section-layout, side-box…
│   ├── actions/        → ds-button, ds-quick-actions, ds-crud/dashboard/list-actions
│   ├── display/        → ds-icon, ds-badge, ds-card, ds-table, ds-chart, ds-kpi-grid…
│   ├── feedback/       → ds-alert, ds-toast, ds-modal, ds-*-banner…
│   ├── navigation/     → ds-nav, ds-menu-panel, ds-tabs, ds-breadcrumb, ds-pagination
│   └── form/           → ds-form-field, ds-form-input, select, date, time, upload, filter-bar…
├── system/             → servicios runtime + modelo de temas/viewport
│   ├── services/       → Theme, Viewport, Toast, Notification, Messages, Banner, seams…
│   └── themes/         → ThemeMode, ViewportSize, DsContainerKind…
├── themes/             → TEMAS DE MARCA (identidad): brand colors + brand typography
│   └── default/        → brand.css (el tema por defecto) + su definición TS
├── tokens/             → CSS custom properties (primitivas + compuestas, incl. breakpoints.css)
├── fonts/              → tipografías auto-alojadas + icon font
├── theme.css           → puente a utilidades Tailwind v4 (@theme)
└── docs/               → ESTA documentación
```

La **herramienta de autoría** (FAB) vive en `shared/lib/fab/`, separada del DS por
diseño (ver [06-fab.md](./06-fab.md)).

---

## Índice de documentación

| Doc | Contenido | Para quién |
|---|---|---|
| [01-architecture.md](./01-architecture.md) | Principios, capas y reglas de dependencia | Quien mantiene el DS |
| [02-tokens.md](./02-tokens.md) | Primitivas vs compuestas, cómo usar `var(--ds-*)`, theme.css, fonts | Todos |
| [03-components.md](./03-components.md) | Catálogo de componentes por bloque + convenciones de uso | Frontends |
| [04-layout.md](./04-layout.md) | `ds-container` (kinds/niveles) + `SectionLayoutService` + responsive | Frontends / layouts |
| [05-system.md](./05-system.md) | Servicios runtime y seams de inyección (i18n, data, branding) | Integración |
| [06-fab.md](./06-fab.md) | La herramienta de autoría (FAB): tabs, inspector, data tools | Diseñadores / devs |
| [07-application.md](./07-application.md) | Paso a paso para aplicar el DS en un proyecto Akuri-OMA | Nuevos proyectos |
| [08-a11y.md](./08-a11y.md) | Checklist de accesibilidad WCAG 2.2 AA por componente | Todos |
| [09-themes.md](./09-themes.md) | Temas de marca: `themes/<id>/brand.css`, cómo crear/cambiar un tema | Diseñadores / devs |
| [10-breakpoints.md](./10-breakpoints.md) | Breakpoints unificados: fuente única CSS, derivaciones y cómo cambiarlos | Todos |

> La clasificación histórica de componentes (estándar vs adoptados vs custom) vive en
> [../components/taxonomy.md](../components/taxonomy.md).

---

## Convenciones globales (resumen)

- **Prefijo**: todo componente, tipo, input y clase CSS relevante usa `ds-`.
- **Standalone + OnPush**: los componentes se importan donde se usan; `ChangeDetectionStrategy.OnPush` siempre.
- **Solo tokens**: el estilo usa `var(--ds-*)` o utilidades Tailwind que mapean a tokens. Nunca colores sueltos.
- **Seams opcionales**: el DS nunca asume idioma, backend, ni marca. Los provee la app vía
  `InjectionToken` (ver [05-system.md](./05-system.md)).
- **Casos especiales = locales**: si un componente es específico de un módulo, vive en el
  módulo, no en el DS.
