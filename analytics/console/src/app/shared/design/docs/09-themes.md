# 09 · Temas de marca (`themes/`)

> Documento: **DS-THEMES-001** · Status: ACTIVE · 2026-10-08
> Código: `design/themes/` · Lectura previa: [02-tokens.md](./02-tokens.md)

Un **tema** es SOLO identidad de marca: **colores de marca** + **tipografía de marca**.
Todo lo demás (layout, estados, componentes, formularios) es **núcleo** y NO cambia al
cambiar de tema. Esto se consigue porque los componentes y compuestas consumen
`var(--ds-color-brand-*)` y `var(--ds-font-*)` por rol, y esos roles los define el tema.

---

## 1. Dónde vive la identidad

| Identidad | Núcleo (no cambia) | Tema (cambia) |
|---|---|---|
| Colores brand | escalas 50–950 derivadas + `theme.css` + superficies (referencian los anclas) | **los 5 anclas** `--ds-color-brand-{primary,accent,contrast,secondary,dark}` |
| Tipografía brand | pesos, tamaños, roles (`--ds-text-*`) | **las familias** `--ds-font-sans` / `--ds-font-brand` |

- `colors.css` y `typography.css` (primitivas núcleo) **ya no contienen literales de marca**.
- `themes/<id>/brand.css` es el **único archivo** (junto a `colors.css`) que puede contener
  literales de la identidad.

### Estructura

```
design/themes/
├── index.css               ← barrel CSS: importa el tema por defecto
├── index.ts                ← registro TS: THEMES, DEFAULT_THEME, getTheme()
├── theme.model.ts          ← BrandTheme { id, name, css, externalFonts? }
└── default/
    ├── brand.css           ← EL TEMA POR DEFECTO (anclas brand + familias)
    └── default.theme.ts    ← su definición TS
```

`tokens/index.css` importa `themes/index.css` **al final**, para que los anclas estén
definidos tras las primitivas que los referencian.

---

## 2. El tema por defecto

`themes/default/brand.css` declara en `:root` (línea base siempre activa):

```css
:root {
  --ds-color-brand-primary:   #00c0f3;
  --ds-color-brand-accent:    #d81e8a;
  --ds-color-brand-contrast:  #006ec1;
  --ds-color-brand-secondary: #5844e0;
  --ds-color-brand-dark:      #0f172a;
  --ds-font-sans:  "Montserrat", system-ui, …;
  --ds-font-brand: "Montserrat", system-ui, …;
}
```

Cambiar un ancla re-vincula en runtime toda la paleta derivada (escalas 50–950 vía
`color-mix()`, superficies, utilidades Tailwind) **sin tocar ningún componente**.

---

## 3. Crear un tema nuevo

1. **Crea `themes/<id>/brand.css`** — declara los anclas/familias de ese tema, scoped bajo
   `:root[data-theme-name="<id>"]`:

   ```css
   /* themes/corporate/brand.css */
   :root[data-theme-name="corporate"] {
     --ds-color-brand-primary:   #1d4ed8;
     --ds-color-brand-accent:    #0e7490;
     --ds-color-brand-contrast:  #1e3a8a;
     --ds-color-brand-secondary: #4338ca;
     --ds-color-brand-dark:      #0f172a;
     --ds-font-sans:  "Inter", system-ui, …;
     --ds-font-brand: "Inter", system-ui, …;
   }
   ```

2. **Crea `themes/<id>/<id>.theme.ts`** con su `BrandTheme` (si tiene familias externas,
   decláralas en `externalFonts`).

3. **Regístralo en `themes/index.ts`** (añádelo a `THEMES`).

4. **Aplícalo** — `ThemeService.applyTheme('corporate')` setea `data-theme-name="corporate"`
   en `<html>`; el tema scoped gana por especificidad sobre el `:root` por defecto.
   `FontLoaderService` carga sus `externalFonts` si las declara.

> El `DESIGN_SYSTEM_SERVICE` (seam, ver [05-system.md](./05-system.md)) permite además
> **branding data-driven**: cambiar la fuente de tokens en runtime sin rebuild.

---

## 4. Reglas (MUST)

- Un tema solo define **anclas brand + familias brand**. No colores de estado, no superficies,
  no layout, no tamaños tipográficos.
- Los literales de marca viven SOLO en `themes/<id>/brand.css` (y en `colors.css` para el núcleo).
- El tema por defecto nunca se borra: es la línea base de `:root`.
- Para tocar un componente con colores del tema, usa los roles (`var(--ds-color-brand-primary)`),
  nunca un literal.
