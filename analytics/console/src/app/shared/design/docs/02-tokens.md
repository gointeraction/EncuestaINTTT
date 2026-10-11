# 02 · Design Tokens

> Documento: **DS-TOKENS-001** · Status: ACTIVE · 2026-10-08
> Lectura previa: [01-architecture.md](./01-architecture.md) · Código: `tokens/`, `theme.css`, `fonts/`

Los tokens son CSS custom properties organizados en **dos niveles** que se importan en
orden desde `tokens/index.css`. Son la **única fuente visual**: ningún componente debería
usar un color, tamaño o tipografía literales.

---

## 1. Los dos niveles

### 1.1 PRIMITIVAS (`tokens/primitives/`) — *qué existe*

Vocabulario fundamental. Cada dominio en un archivo:

| Archivo | Define |
|---|---|
| `colors.css` | **Fuente única de todo color**: anclas + escalas 50–950 (`--ds-color-*`) |
| `gradients.css` | Transiciones color→color (entre familias / tonalidades de una misma familia) |
| `typography.css` | Familias, tamaños, pesos y roles tipográficos |
| `effects.css` | Movimiento: duraciones y easings |
| `shadows.css` | Elevación, sombras con tintado de marca, z-index |
| `spacing.css` | Escala de espaciado, gaps, contenedores, constantes de grid (12 col) |
| `breakpoints.css` | **Tiers responsive canónicos**: `--ds-breakpoint-mobile/tablet/desktop`. Única fuente; los servicios TS y Tailwind derivan de aquí |
| `surfaces.css` | Superficies de UI, bordes y radios |

> **La identidad de marca NO es una primitiva**: los anclas de color
> (`--ds-color-brand-*`) y las familias (`--ds-font-sans` / `--ds-font-brand`) viven en
> `themes/<id>/brand.css` (default en `themes/default/brand.css`). Las escalas derivadas
> (50–950) sí se mantienen aquí y re-derivan de los anclas en runtime. Ver [09-themes.md](./09-themes.md).

**Regla**: una primitiva solo se referencia a sí misma o a `colors.css`. Nunca a una compuesta.

### 1.2 COMPUESTAS (`tokens/composites/`) — *cómo se usa*

Implementación semántica. Pueden referenciar primitivas y otras compuestas:

| Archivo | Define |
|---|---|
| `status.css` | Roles de estado: surfaces `success/danger/info/warning/…` + pareja `-on` |
| `forms.css` | Controles de formulario |
| `components/` | Tokens por componente, **un archivo por elemento** (`button.css`, `card.css`, `badge.css`, `input.css`, `modal.css`, `toast.css`, `alert.css`, `table.css`, `empty-state.css`, `kpi-card.css`, `icon.css`, `notification.css`) |
| `data-viz.css` | Roles de series/ejes para gráficos (`--ds-viz-*`) |

### 1.3 Fuentes y tooling del FAB

- `tokens/index.css` también importa el **tema del FAB** (`../../fab/fab-theme.css`) y las
  fuentes (`../fonts/font-faces.css`, `../fonts/icons.css`) para que las URLs relativas se
  resuelvan dentro del DS y ningún frontend deba incluirlas en su `styles.css`.

---

## 2. Regla de capas (auditada)

```
PRIMITIVAS  →  COMPUESTAS  →  COMPONENTES (uso)
```

- Una primitiva **nunca** referencia una compuesta.
- Las compuestas referencian solo hacia abajo.
- Se audita con un gate determinista (`check-colors`).

**Consecuencia práctica**: para cambiar el color primario de todo el sistema tocas una
ancla en `colors.css`; `--ds-color-brand-primary-*`, las superficies `--ds-status-*` y las
utilidades Tailwind derivadas se actualizan juntas.

---

## 3. Cómo se usan

### 3.1 En CSS / estilos de componente

```css
.ds-card {
  background: var(--ds-component-card-bg);
  color: var(--ds-component-card-on);
  border: 1px solid var(--ds-component-card-border);
  border-radius: var(--ds-component-card-radius);
  box-shadow: var(--ds-component-card-shadow);
}
```

### 3.2 En la plantilla (utilidades Tailwind v4)

`theme.css` mapea los tokens a utilidades vía `@theme`. Los colores se nombran **por uso**:

```html
<div class="bg-primary-500 text-white rounded-md">
<button class="bg-danger-600 hover:bg-danger-700">
<span class="text-muted">
```

Cambiar `--ds-color-state-danger` → actualiza `bg-danger-*`, `text-danger-*`,
`border-info-*`, `--ds-status-danger*`, todo a la vez.

### 3.3 Dark mode / branding en runtime

Los tokens son CSS vars: `ThemeService.themeMode()` y los seams de branding
(`DESIGN_SYSTEM_SERVICE`) re-vinculan la paleta en runtime sin tocar estructura
(ver [05-system.md](./05-system.md)).

---

## 4. Fuentes

- **Tipografía variable auto-alojada** (Montserrat) en `fonts/assets/`, cargada con
  `font-faces.css`. Las reglas `font-display`/`font-sans` mapean a tokens.
- **Icon font (Material Icons)** en `fonts/icons.css`. El catálogo la consume vía
  `ds-icon` (ver [03-components.md](./03-components.md)).
- `FontLoaderService` puede cargar fuentes por nombre de tema en runtime.

---

## 5. Buenas prácticas

- Nombra los tokens por **uso** (intención), no por valor (`--ds-status-surface-success` no `--ds-blue-500`).
- No añadas una compuesta que nadie consume.
- Nunca mezcles literales de color en un componente; si falta un token, créalo en la capa correcta.
- Antes de tocar una primitiva, verifica las dependientes con el gate `check-colors`.
