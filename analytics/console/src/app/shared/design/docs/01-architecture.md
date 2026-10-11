# 01 · Arquitectura

> Documento: **DS-ARCH-001** · Status: ACTIVE · 2026-10-08
> Lectura previa: [README.md](./README.md)

Este documento describe cómo está construido el DS, por qué, y las reglas de
dependencia que lo mantienen coherente y reutilizable en cualquier proyecto Akuri-OMA.

---

## 1. Principios de diseño

1. **Declarado = construido (Akuri-OMA).** El DS no crece por improvisación: lo que se
   declara en la capa de especificación (A2) se construye en A3 y un gate determinista
   lo verifica. Un componente que nadie usa no se añade.
2. **Tokens como única fuente visual.** Toda decisión de color, tipografía, espaciado,
   sombra o movimiento vive en `tokens/`. Los componentes consumen `var(--ds-*)`; nunca
   colores literales.
3. **Componentes standalone + OnPush.** Cada componente es una unidad autocontenida que
   se importa donde se usa. Sin módulos compartidos, sin herencia visual, sin estilos
   globales de componente.
4. **Cero dependencias de negocio.** El DS no importa DTOs, servicios de dominio ni
   marcas. Los consumidores mapean sus datos hacia los tipos `ds-*`.
5. **Seams en lugar de acoplamiento.** Idioma, backend y branding se inyectan mediante
   `InjectionToken` con implementaciones *no-op* por defecto (ver [05-system.md](./05-system.md)).
6. **Herramienta ≠ runtime.** El FAB (autoría) está físicamente separado del DS
   (`lib/fab/`) y no se distribuye con la UI de producción.

---

## 2. Las capas

```
┌────────────────────────────────────────────────────────────────────┐
│  fab/  (lib/fab)  — HERRAMIENTA DE AUTORÍA (design tool)          │
│  Consume el DS; el DS NUNCA lo importa.                          │
├────────────────────────────────────────────────────────────────────┤
│  system/ — RUNTIME (mecanismos)                                   │
│  servicios providedIn:'root' + modelo de temas/viewport.          │
│  Inyecta seams opcionales. NO importa components.                 │
├────────────────────────────────────────────────────────────────────┤
│  components/ — CATÁLOGO (6 bloques funcionales)                   │
│  Standalone + OnPush, SOLO tokens + Tailwind.                     │
│  Puede inyectar servicios de system.                              │
├────────────────────────────────────────────────────────────────────┤
│  themes/ — IDENTIDAD DE MARCA (brand colors + typography)         │
│  themes/<id>/brand.css define los anclas brand + familias brand.  │
│  Depende de tokens; los componentes lo consumen por rol (var).    │
├────────────────────────────────────────────────────────────────────┤
│  tokens/ + theme.css + fonts/ — FUNDACIÓN                          │
│  CSS custom properties núcleo (primitivas + compuestas), sin       │
│  literales de marca. No importa nada; el resto depende de esto.   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.1 `themes/` — la identidad de marca

Un tema es **solo** colores de marca (`--ds-color-brand-*`) y tipografía de marca
(`--ds-font-sans` / `--ds-font-brand`). El default vive en `themes/default/brand.css`
(anclas en `:root`, siempre activo); un tema adicional se scoped bajo
`:root[data-theme-name="<id>"]` y gana por especificidad. Las escalas 50–950 derivadas
se quedan en `tokens/` y re-vinculan en runtime al cambiar el ancla. Detalle en
[09-themes.md](./09-themes.md).

### 2.2 `tokens/` + `theme.css` + `fonts/` — la fundación

- `tokens/index.css` importa primitivas y compuestas en orden (detalle en [02-tokens.md](./02-tokens.md)).
- `theme.css` es el puente Tailwind v4 (`@theme`): mapea los tokens a utilidades
  (`bg-primary-500`, `text-danger-700`, …).
- `fonts/` provee la tipografía variable auto-alojada y el icon font (Material Icons).
- **Regla de capas**: una primitiva nunca referencia una compuesta; las compuestas
  solo referencian hacia abajo. Se audita con un gate determinista (`check-colors`).

### 2.2 `components/` — el catálogo

Seis bloques funcionales, cada uno con su propio `index.ts`:

| Bloque | Rol | Ejemplos |
|---|---|---|
| `layout/` | Primitivas estructurales "de afuera hacia adentro" | `ds-container`, `ds-scroll-strip`, `ds-page-group-nav`, `header`, `page-title`, `panels`, `section-layout`, `side-box` |
| `actions/` | Acciones de usuario | `ds-button`, `ds-quick-actions`, `ds-crud-actions`, `ds-dashboard-actions`, `ds-list-actions` |
| `display/` | Presentación + datos | `ds-icon`, `ds-badge`, `ds-card`, `ds-empty-state`, `ds-skeleton`, `ds-table`, `ds-chart`, `ds-kpi-grid`, … |
| `feedback/` | Atención transitoria / overlays | `ds-alert`, `ds-toast`, `ds-modal`, `ds-*-banner` |
| `navigation/` | Navegación | `ds-nav`, `ds-menu-panel`, `ds-tabs`, `ds-breadcrumb`, `ds-pagination` |
| `form/` | Entrada de datos (formularios Y filtros) | `ds-form-field`, `ds-form-input`, `select`, `date`, `time`, `upload`, `ds-filter-bar` |

Reglas:
- Standalone + `OnPush`.
- Estilo SOLO con tokens + Tailwind (las utilidades mapean a tokens vía `theme.css`).
- Inputs como `input<T>()` (signals), outputs como `output<T>()`.
- Un componente de catálogo puede inyectar servicios de `system`, pero nunca al revés.

### 2.3 `system/` — el runtime

Mecanismos `providedIn:'root'` autocontenidos y token-driven:

- **Tema**: `ThemeService` (themeName/themeMode/designMode/bodyScroll/pageMetadata) sobre `SettingsService`.
- **Viewport responsive**: `ViewportService` + `BreakpointObserverService`.
- **Canales de mensaje**: `DsToastService`, `DsNotificationService`, `DsMessagesService` (bus que enruta), `BannerService`, `DsPageBannerService`.
- **Seams opcionales** (la app los provee): `LANGUAGE_SERVICE`, `DATA_SOURCE_SERVICE`, `DATA_TOOLS_SERVICE`, `DESIGN_SYSTEM_SERVICE`.
- **Modelo**: `themes/theme.model.ts` (ThemeMode, ViewportSize, DsContainerKind, DS_CONTAINER_KINDS, …).

Regla: `system/` no importa `components/` (salvo `SectionLayoutService`, que es el
orquestador del layout y define el contrato que `section-layout` consume).

### 2.4 `fab/` (en `lib/`, fuera del DS)

La **herramienta de autoría**: panel flotante del design-mode, inspector de
`ds-container`, tabs de tipografía/colores/superficies/design-system/notificaciones,
y la modal de *Data Tools* (verificador mock ↔ api-sdk). Detalle en [06-fab.md](./06-fab.md).

---

## 3. Reglas de dependencia (MUST)

| De \ a | tokens | themes | components | system | fab |
|---|---|---|---|---|---|
| `tokens/` | — | ✗ | ✗ | ✗ | ✗ |
| `themes/` | ✅ (definen anclas) | — | ✗ | ✗ | ✗ |
| `components/` | ✅ | ✅ (por rol `var(--ds-color-brand-*)`) | entre bloques: permitido (débil, preferir barril) | ✅ (inyección) | ✗ |
| `system/` | ✅ | ✅ (registro `getTheme`) | ✗ (salvo excepciones declaradas) | entre servicios: ✅ | ✗ |
| `fab/` | ✅ | ✅ | ✅ | ✅ | — |
| Apps consumidoras | ✅ | ✅ | ✅ | ✅ | ✅ (solo authoring) |

- **El DS nunca importa el FAB.** La flecha es al revés.
- **Nada importa hacia arriba**: una capa solo depende de las inferiores.
- **La identidad de marca está desacoplada**: `themes/` define SOLO los anclas brand y las
  familias; los componentes los consumen por rol (`var(--ds-color-brand-*)`), de modo que
  cambiar de tema no altera nada del núcleo.
- Los componentes se re-exportan por el barril único `design/index.ts`
  (`export * from './components'; export * from './system'; export * from './themes';`).
- Cualquier violación de la regla de capas de tokens se audita en CI (check-colors).

---

## 4. Barril y consumo

```ts
// design/index.ts — el único punto de entrada
export * from './components';
export * from './system';
```

Consumidores (apps): `import { DsButtonComponent, ThemeService, … } from '<design-barrel>'`.
El FAB se importa aparte, desde `lib/fab`.

---

## 5. Cuándo algo NO entra al DS

- Es específico de un módulo / caso especial → vive **en el módulo** (componente local).
- Es una pieza de autoría (design-mode, inspector) → vive en **el FAB**.
- Nadie lo usa → **no existe** (el DS no acumula especulativos).
- Requiere una dependencia de negocio o de marca concreta → va detrás de un **seam**.
