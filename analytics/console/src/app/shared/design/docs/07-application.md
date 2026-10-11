# 07 · Aplicar el DS en un proyecto Akuri-OMA

> Documento: **DS-APP-001** · Status: ACTIVE · 2026-10-08
> Lectura previa: [01-architecture.md](./01-architecture.md) y el resto de `docs/`

Guía paso a paso para llevar este design system a **cualquier proyecto frontend Angular
gobernado por Akuri-OMA** (standalone, Tailwind v4). El patrón de referencia es
`cifraflow-frontends` (app host).

---

## 0. Requisitos

- Angular **standalone** (17+ / señales).
- **Tailwind v4** (CSS-first, `@theme`).
- Alias de módulo para el DS y el FAB.

## 1. Incorpora la carpeta `design/`

Copia `shared/lib/design/` completa (o apunta tu workspace monorepo a ella):

```
tu-proyecto/
└── lib/design/          ← components/ + system/ + tokens/ + fonts/ + theme.css + docs/
└── lib/fab/             ← (opcional) herramienta de autoría
```

Declara los alias en `tsconfig.json` (paths) y en el bundler (rspack/webpack/vite):

```jsonc
// tsconfig.json
"paths": {
  "@cifraflow/design": ["../cifraflow-shared/src/lib/design"],
  "@cifraflow/fab":    ["../cifraflow-shared/src/lib/fab"]
}
```

```ts
// rspack.config.ts (o equivalente)
resolve: {
  alias: {
    '@cifraflow/design': resolve(__dirname, '../cifraflow-shared/src/lib/design'),
    '@cifraflow/fab':    resolve(__dirname, '../cifraflow-shared/src/lib/fab'),
  },
},
```

## 2. Carga los estilos globales

En `src/styles.css`:

```css
@import "tailwindcss";

/* Design System: puente Tailwind + tokens (incluye fonts e icon font). */
@import "<ruta>/design/theme.css";
@import "<ruta>/design/tokens/index.css";

/* Escaneo de templates del proyecto (Tailwind v4). */
@source "./";
```

`tokens/index.css` ya importa el tema del FAB y las fuentes (auto-alojadas, icon font):
ningún frontend necesita incluirlas por separado.

## 3. Usa el barril

```ts
import { DsButtonComponent, DsCardComponent, DsBadgeComponent } from '@cifraflow/design';
import { ThemeService, SectionLayoutService, DsToastService } from '@cifraflow/design';
```

## 4. Provee los seams opcionales (si aplican)

En `app.config.ts` / providers:

```ts
providers: [
  { provide: LANGUAGE_SERVICE, useExisting: MyLanguageService },        // i18n real
  { provide: DATA_SOURCE_SERVICE, useExisting: MyDataSourceService },   // api/mock global
  // DESIGN_SYSTEM_SERVICE → branding data-driven
  // DATA_TOOLS_SERVICE    → verificación mock↔api (FAB)
]
```

Sin proveedor, el DS degrada con gracia (no-op): toggles ocultos, idioma por defecto, etc.
Ver [05-system.md](./05-system.md).

## 5. Construye el shell con `ds-container` + FAB

```html
<!-- layout (app shell) -->
<ds-container kind="display" name="shell">
  <ds-fab/>                                <!-- @cifraflow/fab, solo authoring -->
  <router-outlet/>
</ds-container>
```

- `display` es SOLO del layout (envuelve el router-outlet y hostea el FAB).
- Cada página enrutada abre su lienzo `kind="page"` con `area`s nombradas (`header`/`aside`/`body`/`footer`).
- Detalle y reglas de anidación en [04-layout.md](./04-layout.md).

## 6. Páginas de secciones con `SectionLayoutService`

1. La página **registra** su catálogo + defaults (una vez).
2. Coloca `ds-section-layout` como su cuerpo.
3. `ds-section-designer` (sidebox) permite reordenar/asignar en design-mode.

```ts
const layout = inject(SectionLayoutService);
layout.register('orders', { catalog, defaults, integrators: ['universal'], registry: { /* section → comp */ } });
```

## 7. Autoría con el FAB

En el shell de construcción importa `DsFabComponent` desde `@cifraflow/fab`. El inspector
marca niveles, knobs y **colores hardcodeados** (gate token-only). Usa las tabs
(tipografía, colores, superficies, espaciado, efectos, gradientes, sombras, design-system,
notificaciones) para ajustar y el *Data Tools* para verificar mock ↔ api.

## 8. Testing

Los componentes son standalone + OnPush con inputs/outputs puros: testéalos montándolos
con `provideExperimentalZonelessChangeDetection()` (o zoneless) y alimentando inputs por
signals. No dependen de backend ni de idioma (seams opcionales), así que los specs no
necesitan mocks de red.

## 9. Reglas de integración (MUST)

- **Caso especial = componente local** del módulo; el DS solo contiene lo general.
- Mantén el flujo Akuri-OMA: lo que se declara en A2 se construye en A3 y un gate lo verifica.
- No toques tokens de un componente desde fuera; usa sus inputs/knobs.
- El FAB no se exporta en producción.

---

## Resumen visual del flujo

```
tokens/ + theme.css ─▶ components/ ds-* ─▶ páginas (ds-container + section-layout)
        │                    │                      │
        └─ system/ (runtime) ┴─ seams (i18n/data/branding) ┴─ FAB (authoring)
```
