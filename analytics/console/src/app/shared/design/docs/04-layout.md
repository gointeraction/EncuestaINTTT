# 04 · Sistema de Layout

> Documento: **DS-LAYOUT-001** · Status: ACTIVE · 2026-10-08
> Lectura previa: [01-architecture.md](./01-architecture.md) · Código: `components/layout/`, `system/services/section-layout.service.ts`

El DS resuelve el layout con dos mecanismos complementarios:

1. **`ds-container`** — el primitivo estructural único (toda caja es un `ds-container` con un *kind*).
2. **`SectionLayoutService`** — el orquestador de páginas de secciones (orden + visibilidad), con renderer `ds-section-layout` y diseñador `ds-section-designer`.

---

## 1. `ds-container` — un objeto, muchos casos

### 1.1 Los *kinds* (niveles del árbol canónico)

```
display(10) → page(20) → area(30) → row(31)|block(32) → section(40) → subsection(41) → content(50)
```

| Nivel | Kind | Rol |
|---|---|---|
| 10 | `display` | **SOLO layout**: envuelve el `<router-outlet/>`, hostea el FAB de design-mode |
| 20 | `page` | lienzo de la **página enrutada**, embebido dentro de `display` |
| 30 | `area` | bloque estructural (roles `header` / `aside` / `body` / `footer` por nombre) |
| 31/32 | `row` / `block` | **agrupadores** opcionales de secciones (flex row / caja columna) |
| 40 | `section` | sección de contenido |
| 41 | `subsection` | vive SOLO dentro de una `section` |
| 50 | `content` | hoja (leaf): vive SOLO dentro de `section`/`subsection` |

### 1.2 Reglas de anidación

- Espina mínima canónica: **display → page → area → section → content**.
- Los padres contienen hijos (anidación); los hermanos se sientan lado a lado (row de sections con `basis`).
- `subsection` solo dentro de `section`; `content` solo dentro de `section`/`subsection`.
- Roles por **nombre** (`data-name`): un `area` llamado `header`/`aside`/`footer` queda fijo con tamaño mínimo, `aside` scrollea él mismo, y **`body` es el único elemento scrolleado por la página**.

### 1.3 Knobs (todos los niveles responden igual)

`bordered`, `position`, `background`, `padded`, `gap`, `basis`, `wrap` (+ `title`, `name`, `sticky`).

```html
<ds-container kind="page" name="orders">
  <ds-container kind="area" name="header">
    <ds-header>
      <ds-page-title title="Pedidos" subtitle="Gestión"/>
    </ds-header>
  </ds-container>
  <ds-container kind="area" name="body">
    <ds-container kind="section" name="list" [basis]="'0 0 100%'">
      <ds-data-table-card .../>
    </ds-container>
  </ds-container>
</ds-container>
```

> `display` distingue lo que ocurre en el layout de lo que ocurre en la página; es
> exclusivo del layout y no debe usarse dentro de una página enrutada.

---

## 2. `SectionLayoutService` — páginas de secciones

Orquestador **root** para gestionar el cuerpo de una página: **reordenar** (filas/columnas/páginas)
y **visibilidad** (asignar/quitar secciones). Claveado por la página activa
(`ThemeService.pageMetadata().page`), de modo que **cada página lo obtiene simplemente registrando su catálogo**.

### 2.1 Contrato que la página declara

```ts
interface SectionLayoutConfig {
  catalog: Record<string, SectionCatalogEntry>;   // id → {label, defaultWidth, titleKey?, integrators?}
  defaults: SectionLayoutPreference;               // layout por defecto (desktop + mobile)
  integrators?: string[];                          // ej. ['universal'] | ['universal','mobile']
  registry?: Record<string, string>;               // section id → componente (resuelto por el shell outlet)
}
```

### 2.2 Preferencia de layout

```ts
interface SectionLayoutPreference {
  pageId: string;
  version: number;
  desktop: SectionLayoutRow[];      // filas → columnas → secciones
  blocks?: SectionLayoutBlock[];    // contenedores full-width que agrupan filas
  mobile: SectionLayoutPage[];      // páginas móviles (cada una con sus secciones)
  mobileStrategy?: 'tabs' | 'menu'; // cómo se navega en móvil
  known?: string[];                 // catálogo conocido al guardar
}
```

- **Desktop**: grid de filas/columnas (`SECTION_COL_WIDTHS`: `flex-1`, `w-64`…, `col-span-*`).
- **Mobile**: páginas con estrategia `tabs` (varias secciones por tab, como desktop) o
  `menu` (una página/sección a la vez desde un menú).
- **Persistencia**: por página en `localStorage` (`inv_section_layout_<page>`).

### 2.3 Registro (la página lo llama una vez)

```ts
const layout = inject(SectionLayoutService);
layout.register('orders', {
  catalog: { list: { label: 'Listado', defaultWidth: 'flex-1' }, kpis: { label: 'KPIs', defaultWidth: 'col-span-6' } },
  defaults: { pageId: 'orders', version: 1, desktop: [{ id: 'r1', cols: [{ id: 'c1', width: 'flex-1', sections: ['kpis'] }] }, { id: 'r2', cols: [{ id: 'c2', width: 'flex-1', sections: ['list'] }] }], mobile: [{ id: 'm1', label: 'Resumen', sections: ['kpis'] }, { id: 'm2', label: 'Lista', sections: ['list'] }] },
});
```

### 2.4 Renderer y diseñador

- **`ds-section-layout`** — renderer oficial: filas/cols → grid (desktop) + páginas (mobile),
  vía `ngComponentOutlet` + `registry`. La página lo coloca como su cuerpo.
- **`ds-section-designer`** — sidebox oficial (catálogo, filas/cols/páginas, reset) sobre
  `SectionLayoutService`. Se abre desde el design-mode / FAB.

---

## 3. Responsive

Los **breakpoints están unificados en una sola fuente**: `tokens/primitives/breakpoints.css`
(`--ds-breakpoint-mobile: 640px`, `--ds-breakpoint-tablet: 768px`, `--ds-breakpoint-desktop: 1024px`).

- **`ViewportService`** los lee en runtime (`readBreakpoints()`) y expone `size`
  (`mobile | tablet | desktop`) + `isMobile/isTablet/isDesktop` + `breakpoints`.
- **`BreakpointObserverService`** genera sus media queries desde los MISMOS valores
  (`isMobile$`/`isTablet$`/`isDesktop$`, RxJS / CDK) — coinciden exactamente con ViewportService.
- Las utilidades Tailwind (`sm:`/`md:`/`lg:`) **mirroran** los valores en `theme.css`
  (las media queries no admiten `var()`).
- Los `@media` manuales de componentes usan los valores canónicos (comentados en el CSS).

Tiers: `width < 640` → **mobile** · `640 ≤ width < 1024` → **tablet** · `width ≥ 1024` → **desktop**.

El layout usa estas señales para cambiar de grid (desktop) a páginas (mobile) de forma reactiva.

---

## 4. Buenas prácticas

- Toda caja es un `ds-container` con su *kind*; no uses `div`s sueltos para estructura.
- Mantén la espina canónica mínima; añade `row`/`block` solo cuando haya que agrupar.
- Las páginas de secciones **declaran** su catálogo + defaults; nunca mutan el layout global.
- El `area` con nombre `body` es el que scrollea; los demás quedan fijos.
