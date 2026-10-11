# 06 · FAB — la herramienta de autoría (design tool)

> Documento: **DS-FAB-001** · Status: ACTIVE · 2026-10-08
> Código: `lib/fab/` (FUERA de `design/`) · Acceso: alias `@cifraflow/fab`

El **FAB** es la herramienta de **autoría** del design system: un panel flotante de
design-mode para inspeccionar y ajustar la UI durante la construcción. Es una
implementación **particular** — no toda aplicación la necesita — y por eso vive
**fuera** del DS, en `lib/fab/`. El DS nunca importa el FAB; la flecha es al revés.

---

## 1. Qué es y qué no es

| Sí | No |
|---|---|
| Tool de authoring (design-mode, inspector, data tools) | Componente de runtime de producción |
| Depende del DS (tokens + system) | Parte del DS (depende de él, no lo compone) |
| Se importa solo en entornos de construcción | Se distribuye con la UI de usuario final |

`design/index.ts` (el barril del DS) **no exporta el FAB**; se consume aparte vía
`@cifraflow/fab`.

---

## 2. Componentes

| Componente | Rol |
|---|---|
| `DsFabComponent` (`ds-fab`) | panel flotante del design-mode: tabs + estado de visibilidad |
| `DsContainerInspectorPopupComponent` | popup de inspección sobre un `ds-container` (nivel, knobs, data-container) |
| `DsDataToolsModalComponent` | ventana *Data Tools*: verificación mock ↔ api-sdk |
| `DsFabColorsTabComponent` | tab de colores |
| `DsFabSurfacesTabComponent` | tab de superficies |
| `DsFabTypographyTabComponent` | tab de tipografía |
| `DsFabEffectsTabComponent` | tab de efectos/movimiento |
| `DsFabGradientsTabComponent` | tab de gradientes |
| `DsFabShadowsTabComponent` | tab de sombras |
| `DsFabSpacingTabComponent` | tab de espaciado |

## 3. Servicios

- **`FabService`** — estado y modo del FAB: `InspectorPrefs` (visibilidad por plano y por
  nivel canónico), `LEVEL_KEYS`, `DEFAULT_INSPECTOR`. Expone los toggles del inspector:
  `layout` / `page` (planos independientes), `showColors`, `showErrors` y el modo
  `content` "ghost" global.
- **`DsInspectorService`** — el motor del overlay de diseño: dibuja el contorno por nivel,
  detecta **colores hardcodeados** y emite un reporte (`HardcodedReport` / `HardcodedViolation`)
  — el DS es token-only, así que el inspector audita que así sea.

## 4. Tema del FAB

`fab-theme.css` es la **paleta propia** del FAB (colores de tooling + tokens de design-mode:
`--ds-designmode-level-*`, etc.). Se importa desde `tokens/index.css` para que estén
disponibles globalmente (el inspector y el section-designer los consumen).

## 5. Cómo se usa

```ts
// Solo en la construcción del layout (entorno de authoring)
import { DsFabComponent, FabService } from '@cifraflow/fab';

@Component({
  standalone: true,
  imports: [DsFabComponent],
  template: ` <ds-fab/> `,   // dentro de ds-container kind="display"
})
export class AppShellComponent {}
```

- El `display` (level 10) **hostea el FAB**: distingue lo que ocurre en el layout de lo
  que ocurre en la página (ver [04-layout.md](./04-layout.md)).
- `ThemeService.designMode()` / `designModeStructureOnly` gobiernan la visibilidad del
  modo de diseño.
- El inspector se sincroniza con `ds-container` vía `[attr.data-container]` / `[attr.data-name]`.

## 6. Buenas prácticas

- El FAB solo en shells de construcción, nunca en rutas de producción.
- Las reglas del inspector (token-only, sin colores hardcodeados) son un **gate de calidad**:
  trátalas como tal en el workflow de desarrollo.
