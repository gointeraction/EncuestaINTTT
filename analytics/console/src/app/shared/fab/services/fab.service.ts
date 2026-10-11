import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { DsContainerKind, DS_CONTAINER_KINDS, PlaneId, PlaneFocus } from '../../design/system/themes/theme.model';

/** Per-plane toggles — one per canonical level (display 10, page 20, area 30,
 *  row|block 31|32, section 40, subsection 41) plus `showContent` (level 50 —
 *  the innermost blocks: everything that is NOT a container AND the
 *  [data-container="content"] blocks inside sections/subsections).
 *  A plane is LAYOUT (the app shell: display + its areas) or PAGE (the rendered
 *  page); the PAGE container itself is just level 20 of the plane. */
export interface PlanePrefs {
  showDisplay: boolean;
  showPage: boolean;
  showAreas: boolean;
  showRows: boolean;
  showBlocks: boolean;
  showSections: boolean;
  showSubsections: boolean;
  /** See or hide the CONTENT level (innermost blocks: non-container children of
   *  sections/subsections + [data-container="content"] blocks). */
  showContent: boolean;
}

export interface InspectorPrefs {
  /** Independent per-plane visibility. The PAGE lives BELOW the LAYOUT in Z. */
  layout: PlanePrefs;
  page: PlanePrefs;
  showColors: boolean;
  showErrors: boolean;
  /** GLOBAL content: when OFF the content everywhere becomes a GHOST (faded)
   *  but keeps the space it occupies; when ON the content renders normally. */
  withContent: boolean;
}

export const DEFAULT_PLANE: PlanePrefs = {
  showDisplay: false,
  showPage: false,
  showAreas: false,
  showRows: false,
  showBlocks: false,
  showSections: false,
  showSubsections: false,
  showContent: false,
};

export const DEFAULT_INSPECTOR: InspectorPrefs = {
  layout: { ...DEFAULT_PLANE },
  page: { ...DEFAULT_PLANE },
  showColors: false,
  showErrors: false,
  withContent: true,
};

/** The canonical levels, in order (display 10 … content 50). */
const LEVELS: readonly DsContainerKind[] = DS_CONTAINER_KINDS;

/** Canonical kind → PlanePrefs field. NB: area→showAreas (plural), etc.
 *  `content` maps to showContent (its dedicated toggle, not a level button). */
export const LEVEL_KEYS: Readonly<Record<DsContainerKind, keyof PlanePrefs>> = {
  display: 'showDisplay',
  page: 'showPage',
  area: 'showAreas',
  row: 'showRows',
  block: 'showBlocks',
  section: 'showSections',
  subsection: 'showSubsections',
  content: 'showContent',
};

/**
 * FabService — single source of truth for the DESIGN TOOLS (the floating action
 * button + its inspector overlays). Context is the DESIGN AUTHORING tool, NOT the
 * app theme. Owns:
 *   designMode   design authoring on/off (FAB + overlays) — session-only, NO persistence
 *   fabVisible   FAB visibility (dev hotkey)
 *   activePlane  which plane (layout | page) the inspector targets — never both
 *   inspector    per-plane toggles (page/container/row/section/subsection/content),
 *                plus with-colors / errors globals.
 * Applies state to <html> (design-mode, ds-* classes) so the inspector CSS
 * reacts instantly. Session-scoped: every load starts CLEAN (nothing painted).
 *
 * The app theme (light/dark) is ThemeService's responsibility; the FAB never
 * reaches into it — it only toggles its own design state.
 */
@Injectable({ providedIn: 'root' })
export class FabService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly designMode = signal<boolean>(false);
  readonly fabVisible = signal<boolean>(true);
  readonly activePlane = signal<PlaneFocus>('page');
  readonly inspector = signal<InspectorPrefs>({ ...structuredClone(DEFAULT_INSPECTOR) });
  /** Container bajo inspección (abierto desde su label en design mode). */
  readonly inspectedElement = signal<Element | null>(null);

  constructor() {
    if (this.isBrowser) {
      this.applyToDOM();
      this.clearInspectorClasses();

      effect(() => {
        this.applyToDOM();
      });
    }
  }

  /** Hard-clean ALL inspector classes from <html> (defensive: stale state from a
   *  previous session could leave `ds-inspector-*` classes behind even if the
   *  signals are fresh). Runs once at boot so design mode ALWAYS starts clean. */
  private clearInspectorClasses(): void {
    const html = this.document.documentElement;
    const cls = Array.from(html.classList).filter(c => c.startsWith('ds-inspector-'));
    html.classList.remove(...cls);
  }

  /** Toggle design authoring mode (FAB + overlays). Turning it ON makes the
   *  inspector immediately visible: it enables the structural x-ray
   *  ("with colors") so the author sees the hierarchy without having to mark a
   *  level first. Turning it OFF leaves a clean state. */
  toggleDesignMode(): void {
    const on = !this.designMode();
    this.designMode.set(on);
    if (on) {
      this.resetInspector();
      this.inspector.update((p) => ({ ...p, showColors: true }));
    } else {
      this.inspectedElement.set(null);
    }
  }

  /** Abre/cierra el inspector de un container (toggle sobre el mismo elemento). */
  inspectElement(el: Element | null): void {
    this.inspectedElement.update((cur) => (cur === el ? null : el));
  }

  /** Cierra el inspector de container. */
  closeInspectedElement(): void {
    this.inspectedElement.set(null);
  }

  /** Toggle FAB visibility (dev hotkey). */
  toggleFabVisibility(): void {
    this.fabVisible.update(v => !v);
  }

  /** Select what the design-mode inspector targets: LAYOUT, PAGE, or BOTH at once. */
  setActivePlane(plane: PlaneFocus): void {
    this.activePlane.set(plane);
    this.inspectedElement.set(null);
  }

  /**
   * Toggle a single canonical level WITHIN a plane (layout or page). Each plane is
   * independent: showing the layout's rows does NOT show the page's rows. Every
   * level is a ds-container kind (display 10, page 20, area 30, row|block 31|32, section 40,
   * subsection 41) — no special cases. Content has its own dedicated toggle.
   */
  toggleLevel(plane: PlaneId, level: DsContainerKind): void {
    if (!LEVELS.includes(level)) return;
    const key = LEVEL_KEYS[level];
    this.inspector.update(p => {
      const planePrefs: any = { ...p[plane] };
      planePrefs[key] = !planePrefs[key];
      return { ...p, [plane]: planePrefs };
    });
  }

  /** Toggle the CONTENT level (everything that is NOT a container) for a plane.
   *  Content = the innermost rendered blocks, the direct non-container children
   *  of sections/subsections. Independent per plane, like every level. */
  toggleContent(plane: PlaneId): void {
    this.inspector.update(p => {
      const planePrefs: any = { ...p[plane] };
      planePrefs.showContent = !planePrefs.showContent;
      return { ...p, [plane]: planePrefs };
    });
  }

  /** Toggle color overlay (highlight with or without colors). */
  toggleColors(): void {
    this.inspector.update(p => ({ ...p, showColors: !p.showColors }));
  }

  /** Toggle structural-error detection. */
  toggleErrors(): void {
    this.inspector.update(p => ({ ...p, showErrors: !p.showErrors }));
  }

  /** GLOBAL "with content": ON = content normal; OFF = content everywhere becomes
   *  a ghost (faded) but KEEPS the space it occupies. */
  toggleWithContent(): void {
    this.inspector.update(p => ({ ...p, withContent: !p.withContent }));
  }

  resetInspector(): void {
    this.inspector.set(structuredClone(DEFAULT_INSPECTOR));
    this.inspectedElement.set(null);
  }

  /** Turn on everything for a plane (one-click "show all of <plane>"). */
  planeAll(plane: PlaneId): void {
    this.inspector.update(p => ({
      ...p,
      [plane]: { showDisplay: true, showPage: true, showAreas: true, showRows: true, showBlocks: true, showSections: true, showSubsections: true, showContent: true },
    }));
  }

  private applyToDOM(): void {
    if (!this.isBrowser) return;
    const html = this.document.documentElement;
    const p = this.inspector();
    const on = this.designMode();
    const active = this.activePlane();
    html.classList.toggle('design-mode', on);
    // Plane focus: when PAGE is active the layout chrome dims; when LAYOUT is
    // active the page subtree dims. 'both' focuses NO plane (nothing dimmed).
    html.classList.toggle('ds-inspector-dim-layout', on && active === 'page');
    html.classList.toggle('ds-inspector-dim-page', on && active === 'layout');
    // per-plane levels — the focused plane(s) are painted. In 'both' mode every
    // plane is painted at once. `page` is level 1 (a ds-container kind) like any other.
    for (const plane of ['layout', 'page'] as PlaneId[]) {
      const planePref = p[plane];
      const isActive = plane === active || active === 'both';
      for (const lvl of LEVELS) {
        const clazz = `ds-inspector-${plane}-${lvl}`;
        html.classList.toggle(clazz, on && isActive && !!planePref[LEVEL_KEYS[lvl]]);
      }
      // CONTENT — everything that is NOT a container. Painted (outlined) only
      // when the plane's "content" toggle is ON. El dimming global de contenido
      // lo controla el toggle GLOBAL "Contenido" (ghost), no un hide por plano.
      html.classList.toggle(`ds-inspector-${plane}-content`, on && isActive && !!planePref.showContent);
    }
    // globals
    html.classList.toggle('ds-inspector-show-colors', on && p.showColors);
    html.classList.toggle('ds-inspector-show-errors', on && p.showErrors);
    // GLOBAL content ghost: OFF → content everywhere becomes a faded ghost (space kept)
    html.classList.toggle('ds-inspector-ghost-content', on && !p.withContent);
  }
}