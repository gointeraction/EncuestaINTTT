# 10 · Breakpoints responsive (mecanismo unificado)

> Documento: **DS-BP-001** · Status: ACTIVE · 2026-10-08
> Código: `tokens/primitives/breakpoints.css` · `system/themes/breakpoints.ts` · `system/services/{viewport,breakpoint-observer}.service.ts` · `theme.css`
> Lectura previa: [02-tokens.md](./02-tokens.md) · [04-layout.md](./04-layout.md) · [05-system.md](./05-system.md)

Los breakpoints tienen **una única fuente**: el CSS. Todo lo demás (servicios TS,
utilidades Tailwind, media queries manuales) deriva de ella. Cambiar un breakpoint en
`breakpoints.css` re-vincula la detección en runtime y documenta el valor canónico para
el resto.

---

## 1. La fuente única (`tokens/primitives/breakpoints.css`)

```css
:root {
  --ds-breakpoint-mobile: 640px;
  --ds-breakpoint-tablet: 768px;
  --ds-breakpoint-desktop: 1024px;
}
```

**Tiers canónicos** (anchura de viewport):

| Tier | Condición |
|---|---|
| mobile | `width < 640` |
| tablet | `640 ≤ width < 1024` (768 = sub-boundary "md") |
| desktop | `width ≥ 1024` |

---

## 2. Cómo se propaga

```
        tokens/primitives/breakpoints.css   ← ÚNICA FUENTE
                      │
        ┌─────────────┴───────────────┐
        │                             │
   TS readBreakpoints()          theme.css @theme
   (getComputedStyle)            --breakpoint-sm/md/lg  (MIRROR literal)
        │                             │
   ViewportService               utilidades Tailwind sm:/md:/lg:
   BreakpointObserverService
   (genera sus media queries
    desde los mismos valores)
```

| Consumidor | Cómo deriva |
|---|---|
| `ViewportService` | `readBreakpoints(document)` → `isMobile/isTablet/isDesktop/breakpoints` (runtime) |
| `BreakpointObserverService` | genera `(max-width: mobile-1)`, `(min-width: mobile) and (max-width: desktop-1)`, `(min-width: desktop)` desde los mismos valores |
| Utilidades Tailwind | `theme.css` **mirrora** los valores en `--breakpoint-*` (las media queries no admiten `var()`) |
| `@media` manuales | usan los valores canónicos, comentados (`/* = var(--ds-breakpoint-mobile) */`) |

> **Por qué el mirror de Tailwind**: las media queries de utilidades (`@media (width >= …)`)
> no pueden usar `var()`, así que `theme.css` declara los valores literales con un comentario
> que los ata a `breakpoints.css`. Un gate de CI puede verificar la coincidencia.

---

## 3. Cambiar un breakpoint

1. **Edita `breakpoints.css`** (nuevo valor, p. ej. `--ds-breakpoint-mobile: 600px`).
2. **Sincroniza el mirror de `theme.css`** (`--breakpoint-sm: 37.5rem` si mobile=600px).
3. **Actualiza `DEFAULT_BREAKPOINTS`** en `system/themes/breakpoints.ts` (fallback SSR).
4. **Revisa los `@media` manuales** que usen el valor cambiado (busca `/* = var(--ds-breakpoint-…) */`).

Los servicios TS **no requieren cambios**: leen el CSS en runtime.

---

## 4. Consumo desde TS

```ts
import { inject } from '@angular/core';
import { ViewportService, readBreakpoints } from '<design-barrel>';

// reactivo (signals)
const viewport = inject(ViewportService);
const isCompact = computed(() => viewport.isMobile() || viewport.isTablet());

// puntual / en una función
const bp = readBreakpoints(document);
if (window.innerWidth >= bp.desktop) { /* … */ }
```

---

## 5. Reglas (MUST)

- **`breakpoints.css` es la única fuente** de los valores. Los servicios no hardcodean umbrales.
- El **mirror de Tailwind** (`theme.css --breakpoint-*`) y `DEFAULT_BREAKPOINTS` se mantienen **en sync** con la fuente.
- Las media queries manuales usan los **valores canónicos**, no inventados.
- `readBreakpoints()` sin documento o sin token definido cae a `DEFAULT_BREAKPOINTS` (SSR seguro).
