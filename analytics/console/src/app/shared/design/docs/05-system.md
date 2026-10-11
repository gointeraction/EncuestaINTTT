# 05 · System — servicios runtime y seams

> Documento: **DS-SYS-001** · Status: ACTIVE · 2026-10-08
> Lectura previa: [01-architecture.md](./01-architecture.md) · Código: `system/services/`, `system/themes/`

`system/` es la capa de **mecanismos**: servicios `providedIn:'root'`, autocontenidos y
token-driven. Incluye tema, viewport, canales de mensaje y los **seams** opcionales que la
aplicación provee.

---

## 1. Tema y viewport

### `ThemeService` (+ `SettingsService`)
Estado global del shell/theme, persistido en `localStorage`:
- `themeName` (signal), `themeMode` (`'light' | 'dark'`), `designMode`, `designModeStructureOnly`, `bodyScroll`.
- `pageMetadata()` — metadatos de la página activa que dirigen el layout y el enrutado de mensajes.
- `SettingsService` (en `core/settings/`) es la **fuente única** de preferencias persistidas
  (`themeName`, `themeMode`, `fabVisible`, `useMockData`, `designMode`, `designModeStructureOnly`).

### `ViewportService`
Detecta el viewport de forma reactiva: `width`, `size` (`mobile|tablet|desktop`),
`isMobile/isTablet/isDesktop` y `breakpoints`. Los umbrales se **leen del CSS**
(`tokens/primitives/breakpoints.css` → `readBreakpoints()`): servicios TS y utilidades
Tailwind comparten la misma fuente única.

### `BreakpointObserverService`
Las mismas señales como `Observable<boolean>` (RxJS / CDK): `isMobile$`, `isTablet$`, `isDesktop$`.
Las media queries se **generan desde los mismos tokens CSS**, por lo que coinciden
exactamente con `ViewportService` (no un BreakpointObserver hardcodeado).

### `NetworkStateService`
`status` (`online|offline`) + `isOnline`, escuchando los eventos de red.

### `FontLoaderService`
Carga las fuentes **externas** declaradas por el tema activo en runtime
(`loadThemeFonts(themeName)` lee el registro de `themes/index.ts` → `externalFonts`).
Las familias del tema normalmente se sirven auto-alojadas vía `fonts/font-faces.css`.

`ThemeService.getAvailableThemes()` devuelve los ids de `THEMES` (registro de temas).

---

## 2. Canales de mensaje

### `DsToastService`
Cola de toasts transitorios (auto-dismiss): `push(...)` con `tone`
(`neutral|success|warning|danger|info`). La **posición** se declara por página
(`ToastPosition`, default top-right). Convención: aquí viven los mensajes `success`
y todo lo no-bloqueante.

### `DsNotificationService`
Canal de notificación global (root): `emit()` + `clear()`, expone `active()`.
Un header de notificaciones puede suscribirse a `active()` y renderizar.

### `DsMessagesService` — el bus
Los productores (FAB, GlobalErrorHandler, interceptor del backend) llaman `emit()`;
el bus **enruta por la declaración de la página actual** (`pageMetadata().messages`):
- `error` | `warning` | `info` → la superficie declarada (`banner` | `toast`);
- `success` → **siempre** toast (un banner no lo justifica).

No es una regla fija: la página declara e intencionalmente decide.

### `BannerService`
Lista simple de banners (`add/dismiss/clear`) con `type` (`error|warning|info|success`).

### `DsPageBannerService`
Canales de banner a nivel de página: `errors` y `notifications` (con severidad, source y
timestamp), expone `hasError`, `hasNotification`, `firstError`. Lo consumen
`ds-error-banner` y `ds-notification-banner`.

---

## 3. Seams opcionales (inyección)

El DS **nunca asume** idioma, backend ni marca. Cada seam es un `InjectionToken` con una
implementación *no-op* por defecto; la app provee la suya y las herramientas de diseño
(FAB) la exponen.

| Token | Interfaz | Qué provee la app |
|---|---|---|
| `LANGUAGE_SERVICE` | `ILanguageService` (`activeLang`, `setLanguage`, `toggle`) | implementación real de i18n (transloco u otra). Sin proveedor, el toggle de idioma se oculta |
| `DATA_SOURCE_SERVICE` | `IDataSourceService` (`origin`: `'api'\|'mock'`, `setOrigin`, `toggle`) | origen global de datos. Cada página lee `origin` para elegir entre api-sdk y su `*.mock.data.ts` |
| `DATA_TOOLS_SERVICE` | `IDataToolsService` (`DataPair`, verificación mock↔api, manifiesto, endpoints, working memory) | herramienta de verificación de datos que la modal *Data Tools* del FAB usa |
| `DESIGN_SYSTEM_SERVICE` | `IDesignSystemService` (`options`, `activeId`, aplicar por id) | **branding data-driven**: una fuente de tokens de color configurable. Cambiar la fuente re-vincula la paleta en runtime |

### Uso del patrón seam

```ts
// La app provee su servicio real una vez (app.config)
providers: [
  { provide: LANGUAGE_SERVICE, useExisting: MyLanguageService },
  { provide: DATA_SOURCE_SERVICE, useExisting: MyDataSourceService },
]

// La página lo consume opcionalmente (nunca asume que existe)
const lang = inject(LANGUAGE_SERVICE, { optional: true });
```

> Modelo compartido: `system/themes/theme.model.ts` exporta `ThemeMode`, `ViewportSize`,
> `ViewportState`, `PlaneId`, `PlaneFocus`, `DsContainerKind`, `DS_CONTAINER_KINDS`,
> `DS_KIND_LEVEL` y `CSSVarMap` — los tipos universales que consumen components, system y fab.

---

## 4. Reglas (MUST)

- `system/` no importa `components/` (salvo el contrato que `SectionLayoutService` define y
  `section-layout` consume).
- Los canales de mensaje se **inyectan**, no se montan componentes a mano.
- Un seam sin proveedor degrada con gracia (no-op): el DS sigue funcionando.
