import { Injectable, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabService } from './fab.service';

/**
 * DsInspectorService — visual overlay that highlights the structural hierarchy
 * (page 1 → container 2 → row|block 3 → section 4 → subsection 5 → content 6)
 * directly in the browser, driven by FabService state, across TWO INDEPENDENT
 * PLANES:
 *   - LAYOUT plane  → the app shell (header/body/footer/aside + their structure)
 *   - PAGE plane    → the rendered page ([data-container="page"], below the layout in Z)
 * Each plane has its own per-level toggles; the planes live in DIFFERENT Z bands
 * (page below layout; within a plane: page < container < row|block < section <
 * subsection < content).
 * Globals: with-colors, structural-error detection.
 *
 * Injecting CSS once, then toggling classes on <html> (cheap, reactive).
 */
const INSPECTOR_STYLE_ID = 'ds-inspector-styles';

/** Rampa de grises del x-ray global ("Colores"): del más oscuro (display) al más
 *  claro (content), para identificar area/section/contenido por tonalidad. */
const XRAY_RAMP: readonly { kind: string; var: string }[] = [
  { kind: 'display', var: '--ds-inspector-xray-display' },
  { kind: 'page', var: '--ds-inspector-xray-page' },
  { kind: 'area', var: '--ds-inspector-xray-area' },
  { kind: 'row', var: '--ds-inspector-xray-row' },
  { kind: 'block', var: '--ds-inspector-xray-block' },
  { kind: 'section', var: '--ds-inspector-xray-section' },
  { kind: 'subsection', var: '--ds-inspector-xray-subsection' },
  { kind: 'content', var: '--ds-inspector-xray-content' },
];

@Injectable({ providedIn: 'root' })
export class DsInspectorService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly fabSvc = inject(FabService);

  constructor() {
    if (!this.isBrowser) return;

    effect(() => {
      // Reading the signals subscribes this effect to every state change
      const p = this.fabSvc.inspector();
      const on = this.fabSvc.designMode();
      const plane = this.fabSvc.activePlane();
      if (on) {
        this.injectStyles();
        this.scan();
        this.attachElementToggles();
        this.attachCursorFeedback();
      } else {
        this.removeStyles();
        this.detachElementToggles();
        this.detachCursorFeedback();
      }
      void p;
      void plane;
    });
  }

  /** Force a re-scan (call after DOM mutations if MutationObserver is undesired). */
  rescan(): void {
    if (this.isBrowser && this.fabSvc.designMode()) this.scan();
  }

  private injectStyles(): void {
    if (this.document.getElementById(INSPECTOR_STYLE_ID)) return;
    const style = this.document.createElement('style');
    style.id = INSPECTOR_STYLE_ID;
    style.textContent = this.buildCss();
    this.document.head.appendChild(style);
  }

  /** Build the design-mode overlay CSS for the two independent planes (layout | page). */
  private buildCss(): string {
    const planes = [
      // layout = the app shell (display + its areas): everything EXCEPT the page
      // canvas and its subtree; page = the page canvas itself AND its subtree.
      // zBase: page band 10.., layout band 50.. — the PAGE lives BELOW the LAYOUT.
      { id: 'layout', zBase: 50, label: 'LAYOUT' },
      { id: 'page', zBase: 10, label: 'PAGE' },
    ];
    // Canonical levels of the UNIFIED ds-container (2-digit tree): display(10)
    // page(20) area(30) row|block(31|32) section(40) subsection(41) content(50).
    // The primitive emits data-container="<kind>" and data-name="<name>"; every
    // structural element is a ds-container. `display` is the LAYOUT-ONLY root
    // that wraps the router-outlet and hosts the FAB.
    const levels = [
      { level: 'display', sels: ['[data-container="display"]'], colorVar: '--ds-designmode-level-display', surfaceVar: '--ds-designmode-level-display-surface', z: 0, tagPos: 'top:0.5rem; left:0.5rem;', tagPad: '1px 8px', contentVar: 'attr(data-name) " " attr(data-container)' },
      { level: 'page', sels: ['[data-container="page"]'], colorVar: '--ds-designmode-page-border', surfaceVar: '--ds-designmode-page-surface', z: 0, tagPos: 'top:0.5rem; right:0.5rem;', tagPad: '1px 8px', contentVar: 'attr(data-name) " " attr(data-page) " " attr(data-container)' },
      { level: 'area', sels: ['[data-container="area"]'], colorVar: '--ds-designmode-level-area', surfaceVar: '--ds-designmode-level-area-surface', z: 1, tagPos: 'top:0.5rem; left:50%; transform:translateX(-50%);', tagPad: '1px 8px', contentVar: 'attr(data-name) " " attr(data-container)' },
      { level: 'row', sels: ['[data-container="row"]'], colorVar: '--ds-designmode-level-row', surfaceVar: '--ds-designmode-level-row-surface', z: 2, tagPos: 'top:0.5rem; right:0.5rem;', tagPad: '1px 4px', contentVar: 'attr(data-name) " " attr(data-container)' },
      { level: 'block', sels: ['[data-container="block"]'], colorVar: '--ds-designmode-level-block', surfaceVar: '--ds-designmode-level-block-surface', z: 2, tagPos: 'top:0.5rem; left:0.5rem;', tagPad: '1px 4px', contentVar: 'attr(data-name) " " attr(data-container)' },
      { level: 'section', sels: ['[data-container="section"]'], colorVar: '--ds-designmode-level-section', surfaceVar: '--ds-designmode-level-section-surface', z: 3, tagPos: 'top:0.5rem; left:0.5rem;', tagPad: '1px 8px', contentVar: 'attr(data-name) " " attr(data-container)' },
      { level: 'subsection', sels: ['[data-container="subsection"]'], colorVar: '--ds-designmode-level-subsection', surfaceVar: '--ds-designmode-level-subsection-surface', z: 4, tagPos: 'top:0.5rem; left:50%; transform:translateX(-50%);', tagPad: '1px 8px', contentVar: 'attr(data-name) " " attr(data-container)' },
    ];

    let css = `/* DS INSPECTOR — two independent planes (layout ABOVE page) */
      html[data-theme] [data-container] { position: relative; }
      /* Shell chrome (layout areas: header/aside/footer) always sits ABOVE the
         page band (page paints at z 10), even when no plane level is painted —
         so a painted page never covers the header/aside/footer titles. */
      html.design-mode [data-container="area"]:not([data-container="page"] *) {
        position: relative; z-index: 51;
      }

      /* ── WITH COLORS (global): x-ray en RAMPA DE GRISES ──
         Cada nivel se pinta con un gris distinto (del más OSCURO display → al
         más CLARO content) con relleno visible, para identificar area / section /
         contenido directamente por tonalidad, en LAYOUT y PAGE por igual. Va
         ANTES de los pintados por nivel para que un nivel togglado (regla
         posterior, mismo peso, !important) gane con su color sólido. */
      :root {
        --ds-inspector-xray-display: #111827;
        --ds-inspector-xray-page: #1f2937;
        --ds-inspector-xray-area: #374151;
        --ds-inspector-xray-row: #4b5563;
        --ds-inspector-xray-block: #4b5563;
        --ds-inspector-xray-section: #6b7280;
        --ds-inspector-xray-subsection: #9ca3af;
        --ds-inspector-xray-content: #d1d5db;
      }
      ${XRAY_RAMP.map((x) => `
      html.ds-inspector-show-colors[data-theme] [data-container="${x.kind}"] {
        outline: 1.5px dashed var(${x.var}) !important;
        outline-offset: 0px;
        background-color: color-mix(in oklab, var(${x.var}) 24%, transparent) !important;
        border-radius: 0 !important;
      }`).join('')}
    `;

    for (const plane of planes) {
      // Plane scoping: `display` (10) is LAYOUT-ONLY (the layout root that wraps the
      // outlet and hosts the FAB) and `page` (20) is PAGE-ONLY (the routed page
      // canvas). The LAYOUT plane matches every structural element except the
      // page canvas and anything inside it; the PAGE plane matches the page
      // canvas itself (the `page` level) and everything rendered inside it.
      const selOf = (sel: string, cls: string) => plane.id === 'page'
        ? sel === '[data-container="page"]'
          ? `html.${cls}[data-theme] [data-container="page"]`
          : `html.${cls}[data-theme] [data-container="page"] ${sel}`
        : `html.${cls}[data-theme] ${sel}:not([data-container="page"]):not([data-container="page"] *)`;
      for (const lvl of levels) {
        const cls = 'ds-inspector-' + plane.id + '-' + lvl.level;
        const z = plane.zBase + lvl.z;
        const gated = lvl.sels.map((sel) => selOf(sel, cls)).join(',\n      ');
        css += `
      /* ${plane.label} — ${lvl.level} (z ${z}) */
      ${gated} {
        outline: 2px solid var(${lvl.colorVar}) !important;
        outline-offset: 1px;
        background-color: var(${lvl.surfaceVar}) !important;
        border-radius: 0 !important;
        z-index: ${z};
        position: relative;
      }
      ${gated}::before {
        content: '${plane.label[0]}: ' ${lvl.contentVar};
        display: inline-block; width: max-content; left: auto;
        position: absolute; ${lvl.tagPos}
        font: 9px/1 monospace; color: var(--ds-designmode-tag-on); background: var(${lvl.colorVar});
        padding: ${lvl.tagPad}; border-radius: 3px; z-index: 10000;
        pointer-events: auto; cursor: pointer; white-space: nowrap;
      }`;
      }

      // CONTENT — the innermost blocks (highest level of this plane). Content is
      // BOTH the `content` kind ([data-container="content"], the canonical leaf)
      // AND any non-container block still left inside sections/subsections
      // (incl. .ds-container-content). No marker is invented: a content block is
      // either the `content` container or whatever is NOT a container.
      const contentCls = 'ds-inspector-' + plane.id + '-content';
      const contentZ = plane.zBase + 5;
      const notStructural = ':not([data-container])';
      // Sections render content through the layout-transparent
      // .ds-container-content wrapper (display:contents → no box), so the real
      // content are its direct non-structural children. The `content` KIND is
      // itself the block — matched directly.
      const contentHosts = [
        { sel: '[data-container="section"]', viaContents: true },
        { sel: '[data-container="subsection"]', viaContents: true },
        { sel: '[data-container="content"]', viaContents: false },
      ];
      // Content is reached through the host selector ONLY once (selOf already
      // scopes to the section/subsection): sections render it through the
      // layout-transparent .ds-container-content wrapper (display:contents → no box).
      // A <form> is a STRUCTURAL wrapper (it only groups ds-containers), never
      // content itself: it is excluded so each section/subsection keeps its own
      // content control (the form's fields are content of their subsection).
      // A heading (h1..h6) is the SECTION's LABEL, not its content: it must stay
      // visible even when `content` is OFF (so a section never loses its title).
      const notTitle = ':not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)';
      const contentPath = (viaContents: boolean) =>
        viaContents
          ? `> .ds-container-content > ${notStructural}:not(form)${notTitle}`
          : `> ${notStructural}:not(form)${notTitle}`;
      const contentTargets = contentHosts.map((h) => `${selOf(h.sel, contentCls)} ${contentPath(h.viaContents)}`).join(',\n      ');
      const contentLabels = contentHosts.map((h) => `${selOf(h.sel, contentCls)} ${contentPath(h.viaContents)}::before`).join(',\n      ');
      css += `
      /* ${plane.label} — content (innermost rendered blocks, highest level) */
      ${contentTargets} {
        outline: 1px dashed var(--ds-designmode-muted) !important;
        z-index: ${contentZ};
        position: relative;
      }
      ${contentLabels} {
        content: '${plane.label[0]} content';
        position: absolute; top:-13px; left:0.5rem;
        font: 8px/1 monospace; color: var(--ds-designmode-tag-on); background: var(--ds-designmode-muted);
        padding: 1px 5px; border-radius: 3px; z-index: 10000;
        pointer-events: none; white-space: nowrap;
      }`;
    }

    css += `
      /* Structural errors (red dashed) */
      html.ds-inspector-show-errors [data-container=""] {
        outline: 3px dashed var(--ds-designmode-error) !important; outline-offset: 2px;
      }
      .ds-inspector-error-missing {
        outline: 3px dashed var(--ds-designmode-error) !important; outline-offset: 2px; position: relative;
      }
      .ds-inspector-error-missing::before {
        content: '⚠ MISSING data-*';
        position: absolute; top: -18px; left: 0;
        font: 9px/1 monospace; color: var(--ds-designmode-tag-on); background: var(--ds-designmode-error);
        padding: 1px 5px; border-radius: 3px 3px 0 0; z-index: 10000;
        pointer-events: none; white-space: nowrap;
      }
      .ds-inspector-error-loose {
        outline: 2px solid var(--ds-designmode-error) !important;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--ds-designmode-error), 0 0 8px color-mix(in oklab, var(--ds-color-state-danger) 50%, transparent) !important;
        position: relative;
      }
      .ds-inspector-error-loose::after {
        content: '⚠ outside section';
        position: absolute; top: -18px; right: 0;
        font: 9px/1 monospace; color: var(--ds-designmode-tag-on); background: var(--ds-designmode-error);
        padding: 1px 5px; border-radius: 3px 3px 0 0; z-index: 10000;
        pointer-events: none; white-space: nowrap;
      }
      .ds-inspector-hardcoded-color {
        outline: 2px solid var(--ds-designmode-error) !important;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--ds-designmode-error), 0 0 8px color-mix(in oklab, var(--ds-color-state-danger) 50%, transparent) !important;
        position: relative;
      }
      .ds-inspector-hardcoded-color::after {
        content: '⚠ hardcoded color';
        position: absolute; top: -18px; right: 0;
        font: 9px/1 monospace; color: var(--ds-designmode-tag-on); background: var(--ds-designmode-error);
        padding: 1px 5px; border-radius: 3px 3px 0 0; z-index: 10000;
        pointer-events: none; white-space: nowrap;
      }

      /* ── GLOBAL "with content" (OFF) ──
         Content everywhere becomes a GHOST: faded + grayscale, but keeps the
         SPACE it occupies (opacity, not display/visibility). Non-mutating peek.
         Dimming a DIRECT non-structural child of any container's content wrapper
         attenuates its whole subtree (opacity < 1 creates a stacking context),
         so "all content dimmed" is achieved by matching those direct children.
         The structural elements themselves ([data-container]) stay fully painted
         so the hierarchy remains readable; the design-mode FAB stays usable. */
      html.ds-inspector-ghost-content [data-container] .ds-container-content > :not([data-container]):not(ds-fab) {
        opacity: 0.12 !important;
        filter: grayscale(1) !important;
        pointer-events: none !important;
      }

      /* ── Per-element design toggles ──
         Each structural element carries data-ds-inspect="<level>". When design
         mode is ON a permanent badge shows its level; clicking the element
         toggles THAT element's visibility (ds-inspector-hidden). */
      [data-ds-inspect] {
        position: relative;
      }
      [data-ds-inspect].ds-inspector-hidden {
        display: none !important;
      }

      /* ── Plane focus (LAYOUT vs PAGE) ── EXCLUSIVE visibility ──
         The ACTIVE plane is shown; the OTHER plane is hidden with
         visibility (NOT display:none) so it keeps its position + space.
         Semantics of the classes (set in fab.service applyToDOM):
           ds-inspector-dim-layout  → hide LAYOUT structural elements, force PAGE visible.
           ds-inspector-dim-page    → hide PAGE subtree (it keeps its space). */
html.ds-inspector-dim-layout [data-container="display"]:not([data-container="page"]):not([data-container="page"] *),
html.ds-inspector-dim-layout [data-container="area"]:not([data-container="page"]):not([data-container="page"] *),
html.ds-inspector-dim-layout [data-container="row"]:not([data-container="page"]):not([data-container="page"] *),
html.ds-inspector-dim-layout [data-container="block"]:not([data-container="page"]):not([data-container="page"] *),
html.ds-inspector-dim-layout [data-container="section"]:not([data-container="page"]):not([data-container="page"] *),
html.ds-inspector-dim-layout [data-container="subsection"]:not([data-container="page"]):not([data-container="page"] *),
html.ds-inspector-dim-layout [data-container="content"]:not([data-container="page"]):not([data-container="page"] *) {
  visibility: hidden;
  }
      html.ds-inspector-dim-layout [data-container="page"],
      html.ds-inspector-dim-layout [data-container="page"] * {
        visibility: visible;
      }
      /* PAGE focus: collapse the layout chrome (shell header/aside/footer) so the
         page canvas FILLS the whole area — the page color then covers everything,
         header included. The page's ancestors (display / content-column / shell row)
         keep their space; only the sibling layout areas are removed. */
      html.ds-inspector-dim-layout [data-container="area"]:not([data-container="page"] *) {
        display: none;
      }
      html.ds-inspector-dim-page [data-container="page"],
      html.ds-inspector-dim-page [data-container="page"] * {
        visibility: hidden;
      }

      /* The design-mode FAB is the CONTROL surface: it must stay reachable even
         when its host (the layout display container) is dimmed for plane focus
         (visibility is inherited, but the FAB overrides it back to visible). */
      html.design-mode ds-fab {
        visibility: visible !important;
      }
    `;
    return css;
  }

  private removeStyles(): void {
    const el = this.document.getElementById(INSPECTOR_STYLE_ID);
    if (el) el.remove();
  }

  // ── Per-element design toggles ─────────────────────────────────────
  // Each structural element (data-container / data-page) gets its OWN design
  // toggle: a single click hides THAT element (ds-inspector-hidden), never its
  // siblings/ancestors. Clicking again restores it. The click is capture-phase
  // + stopPropagation, so toggling a section never toggles its container.

  private static readonly STRUCT_SEL = '[data-container]';

  private elementToggleHandler: any = null;
  private readonly attachedElements = new Set<Element>();
  private cursorFeedbackHandler: ((ev: Event) => void) | null = null;
  private cursorRaf = 0;
  private cursorPoint = { x: -1, y: -1 };

  /** Muestra cursor:pointer sobre los labels del inspector. El label es un
   *  ::before CONFINADO al stacking context del container (z 10..55), así que
   *  cuando el panel del FAB está abierto el backdrop (z 9998) lo tapa y su
   *  `cursor: pointer` nunca se ve: el elemento bajo el cursor es el backdrop.
   *  Este handler resuelve en cada mousemove si el punto cae sobre un label del
   *  plano activo y aplica el cursor al backdrop en consecuencia (rAF-throttled). */
  private attachCursorFeedback(): void {
    if (this.cursorFeedbackHandler) return;
    const handler = (ev: Event) => {
      if (!(ev instanceof MouseEvent)) return;
      const target = ev.target as Element | null;
      if (!target?.classList?.contains('ds-fab__backdrop')) return;
      this.cursorPoint.x = ev.clientX;
      this.cursorPoint.y = ev.clientY;
      if (this.cursorRaf) return;
      this.cursorRaf = requestAnimationFrame(() => {
        this.cursorRaf = 0;
        const backdrop = this.document.querySelector<HTMLElement>('.ds-fab__backdrop');
        if (!backdrop) return;
        const struct = this.structuralAtPoint(this.cursorPoint.x, this.cursorPoint.y);
        const onLabel = !!struct && this.isOnLabel({ clientY: this.cursorPoint.y } as MouseEvent, struct);
        backdrop.style.cursor = onLabel ? 'pointer' : '';
      });
    };
    this.cursorFeedbackHandler = handler;
    this.document.addEventListener('mousemove', handler, true);
  }

  private detachCursorFeedback(): void {
    if (this.cursorFeedbackHandler) {
      this.document.removeEventListener('mousemove', this.cursorFeedbackHandler, true);
      this.cursorFeedbackHandler = null;
    }
    if (this.cursorRaf) {
      cancelAnimationFrame(this.cursorRaf);
      this.cursorRaf = 0;
    }
  }

  private attachElementToggles(): void {
    if (this.elementToggleHandler) return;
    const handler = (ev: Event) => {
      const target = (ev.target as Element | null);
      if (!target) return;

      // El backdrop del panel (position:fixed; inset:0; z 9998) cubre TODA la
      // pantalla y queda POR ENCIMA de los containers pintados del inspector
      // (page z 10..15, layout z 50..55). Un click sobre el label de un container
      // cae geométricamente en el backdrop, no en el container. En LAYOUT eso
      // funcionaba "de casualidad" (closestStructural(backdrop) subía hasta el
      // display, un container de layout); en PAGE no resolvía NADA (el backdrop
      // vive en el layout) y el click solo cerraba el panel.
      // Solución: cuando el click cae sobre el backdrop, resolver el container
      // REAL bajo el cursor (elementsFromPoint) y operar sobre él. Se comprueba
      // ANTES del guard ds-fab (el backdrop ES parte del ds-fab).
      const isBackdrop = target.classList?.contains('ds-fab__backdrop') ?? false;
      let struct: Element | null = null;
      if (isBackdrop && ev instanceof MouseEvent) {
        struct = this.structuralAtPoint(ev.clientX, ev.clientY);
      } else {
        // The design-mode FAB lives INSIDE the display container; its own clicks
        // must never be hijacked as structural toggles (it would hide the display
        // and/or swallow the panel buttons). Exclude the whole ds-fab subtree
        // and the container-inspector popup.
        if (target.closest && target.closest('ds-fab, ds-container-inspector-popup')) return;
        struct = this.closestStructural(target);
      }
      if (!struct) return;
      ev.preventDefault();
      ev.stopPropagation();
      // Click sobre el LABEL (franja superior del container) → abre el popup de
      // propiedades. Click sobre el cuerpo → oculta/muestra (toggle) y cierra el popup.
      if (this.isOnLabel(ev as MouseEvent, struct)) {
        this.fabSvc.inspectElement(struct);
      } else {
        this.fabSvc.closeInspectedElement();
        struct.classList.toggle('ds-inspector-hidden');
      }
    };
    this.elementToggleHandler = handler;
    this.document.addEventListener('click', handler, true);
    this.markStructuralElements();
  }

  /** Devuelve el primer [data-container] del plano activo bajo el punto (x,y),
   *  ignorando el backdrop del FAB. El backdrop (z 9998) tapa los containers
   *  pintados (page z 10..15, layout z 50..55), así que no puede usarse
   *  `ev.target` ni `elementFromPoint` directamente: hay que atravesarlo. */
  private structuralAtPoint(x: number, y: number): Element | null {
    for (const el of this.document.elementsFromPoint(x, y)) {
      if (!el.matches || !el.matches(DsInspectorService.STRUCT_SEL)) continue;
      if (this.isActivePlaneStructural(el)) return el;
    }
    return null;
  }

  /** True si el elemento pertenece al plano activo (layout | page | both). */
  private isActivePlaneStructural(n: Element): boolean {
    const active = this.fabSvc.activePlane();
    if (!n.matches || !n.matches(DsInspectorService.STRUCT_SEL)) return false;
    if (active === 'both') return true;
    const insidePage = this.isInsidePage(n);
    const isPageItself = n.matches('[data-container="page"]');
    return active === 'page' ? insidePage || isPageItself : !insidePage && !isPageItself;
  }

  /** True si el click cayó sobre el label del container (franja superior donde el
   *  inspector pinta el tag ::before con nombre/tipo). El label es la zona
   *  clicable que abre el popup de propiedades. */
  private isOnLabel(ev: MouseEvent, struct: Element): boolean {
    if (ev.clientY < 0) return false;
    const rect = struct.getBoundingClientRect();
    if (rect.height === 0) return false;
    const localY = ev.clientY - rect.top;
    return localY >= 0 && localY <= 26;
  }

  private detachElementToggles(): void {
    if (this.elementToggleHandler) {
      this.document.removeEventListener('click', this.elementToggleHandler, true);
      this.elementToggleHandler = null;
    }
    this.attachedElements.forEach((el) => {
      el.classList.remove('ds-inspector-hidden');
    });
    this.attachedElements.clear();
    this.fabSvc.closeInspectedElement();
  }

  /** Annotate structural elements so CSS can show the per-element design badge.
   *  ONLY the ACTIVE plane is annotated: LAYOUT marks the app shell (display +
   *  areas + their structure) but never the page canvas or its subtree; PAGE
   *  marks the page canvas itself and everything inside it; BOTH marks every
   *  structural element. */
  private markStructuralElements(): void {
    const doc = this.document as any;
    const active = this.fabSvc.activePlane();
    const sel = active === 'layout'
      ? '[data-container]:not([data-container="page"]):not([data-container="page"] *)'
      : active === 'page'
        ? '[data-container="page"], [data-container="page"] [data-container]'
        : '[data-container]';
    // unmark everything first (previous plane)
    doc.querySelectorAll('[data-ds-inspect]').forEach((el: any) => {
      if (el !== this.document) el.removeAttribute('data-ds-inspect');
    });
    this.attachedElements.clear();
    doc.querySelectorAll(sel).forEach((el: any) => {
      const level = DsInspectorService.levelOf(el);
      el.setAttribute('data-ds-inspect', level);
      this.attachedElements.add(el);
    });
  }

  /** Map an element to its canonical level from the unified data-container kind
   *  (display 10, page 20, area 30, row|block 31|32, section 40, subsection 41, content 50). */
  private static levelOf(el: any): string {
    const kind = el.getAttribute && el.getAttribute('data-container');
    if (kind === 'display') return 'display';
    if (kind === 'page') return 'page';
    if (kind === 'area') return 'area';
    if (kind === 'row') return 'row';
    if (kind === 'block') return 'block';
    if (kind === 'section') return 'section';
    if (kind === 'subsection') return 'subsection';
    if (kind === 'content') return 'content';
    return 'area';
  }

  private closestStructural(el: Element): Element | null {
    const active = this.fabSvc.activePlane();
    let n: Element | null = el;
    while (n) {
      if (n.matches && n.matches(DsInspectorService.STRUCT_SEL)) {
        // Only toggle elements of the ACTIVE plane: in LAYOUT mode ignore the
        // page canvas and anything inside it; in PAGE mode toggle the page
        // canvas itself and everything inside it. In BOTH mode, any structural
        // element is toggleable.
        if (active === 'both') return n;
        const insidePage = this.isInsidePage(n);
        const isPageItself = n.matches('[data-container="page"]');
        if (active === 'page' ? insidePage || isPageItself : !insidePage && !isPageItself) return n;
      }
      const parent: Element | null = n.parentElement;
      if (!parent) return null;
      n = parent;
    }
    return null;
  }

  private isInsidePage(el: Element): boolean {
    if (el.matches && el.matches('[data-container="page"]')) return true;
    let n = el.parentElement;
    while (n) {
      if (n.matches && n.matches('[data-container="page"]')) return true;
      n = n.parentElement;
    }
    return false;
  }

  private scan(): void {
    const doc = this.document as any;
    const p = this.fabSvc.inspector();
    doc
      .querySelectorAll(
        '.ds-inspector-error-missing, .ds-inspector-hardcoded-color, .ds-inspector-error-loose',
      )
      .forEach((el: any) => el.classList.remove(
        'ds-inspector-error-missing', 'ds-inspector-hardcoded-color', 'ds-inspector-error-loose'),
      );
    if (!p.showErrors) return;

    /* 1) Missing data-* on structural elements (sections without a name).
       The page canvas [data-container="page"] is NOT a content section — exclude it. */
    doc.querySelectorAll('section:not([data-container="page"]):not([data-container="section"])').forEach((el: any) => {
      el.classList.add('ds-inspector-error-missing');
    });

    /* 2) Loose content not wrapped in a section.
       A "loose" element is non-structural content directly under the display
       root, an area, the page canvas [data-container="page"], under a row/block
       (groupers must only contain sections), or under a section/subsection.
       Children of layout primitives (h2/div inside a ds-container section,
       header/main wrappers inside a ds-container) are part of the primitive
       and NOT flagged. */
    const isStructural = (el: any): boolean => el.matches
      ? el.matches('[data-container]')
      : false;
    const isLooseHost = (el: any): boolean => el.matches
      ? el.matches('[data-container="display"], [data-container="page"], [data-container="area"], [data-container="row"], [data-container="block"]')
      : false;
    const isPrimitiveInternal = (el: any): boolean => {
      const parent = el.parentElement;
      return !!parent && parent.matches && parent.matches('ds-container');
    };
    doc.querySelectorAll('[data-container="display"], [data-container="page"], [data-container="area"], [data-container="row"], [data-container="block"]').forEach((host: any) => {
      Array.from(host.children || []).forEach((el: any) => {
        if (isStructural(el)) return;
        if (isPrimitiveInternal(el)) return;
        const tag = (el.nodeName || '').toLowerCase();
        if (['script', 'style', 'template', 'ds-fab', 'router-outlet', 'ng-component', 'ng-container', 'h1', 'h2', 'h3', 'p'].includes(tag)) return;
        if (el.children && el.children.length === 0 && (el.textContent || '').trim() === '') return;
        el.classList.add('ds-inspector-error-loose');
      });
    });

    /* 3) Hardcoded colors in inline styles (literal hex/rgb/named, not var(--ds-*)) */
    doc.querySelectorAll('[style]').forEach((el: any) => {
      const s = (el.getAttribute('style') || '').toLowerCase();
      if (this.hasHardcodedColor(s)) el.classList.add('ds-inspector-hardcoded-color');
    });
  }

  /** True if this element sits inside a section (canonical kind="section"/"subsection"). */
  private isInSection(el: any): boolean {
    let n: any = el.parentElement || el.parentNode;
    while (n && n !== this.document) {
      const g = n.getAttribute && n.getAttribute('data-container');
      if (g === 'section' || g === 'subsection') return true;
      n = n.parentElement || n.parentNode;
    }
    return false;
  }

  /** True if a style string contains a literal color not resolved via a var(). */
  private hasHardcodedColor(style: string): boolean {
    return this.hardcodedColor(style) !== null;
  }

  // ── Hardcoded detector (política "solo tokens semánticos") ────────────────
  // Detecta en estilos inline (atributo style) colores, espaciados y tipografía
  // con valores literales que violan el uso exclusivo de tokens var(--ds-*).

  /** Valor color literal detectado (o null). */
  private hardcodedColor(style: string): string | null {
    const re = /(?:^|;)\s*(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline(?:-color)?|fill|stroke)\s*:\s*([^;]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(style)) !== null) {
      const value = m[1].trim();
      if (!value || value.includes('var(')) continue;
      if (/#[0-9a-f]{3,8}\b/i.test(value)) return value;
      if (/rgba?\(/i.test(value) || /hsla?\(/i.test(value)) return value;
      if (/^(black|white|red|green|blue|gray|grey|orange|purple|yellow|teal|navy|maroon|olive|lime|cyan|pink|brown|transparent)$/i.test(value)) return value;
    }
    return null;
  }

  /** Valor de espaciado/dimensiones literal (px/rem/em/vw/vh/%) detectado (o null). */
  private hardcodedSpacing(style: string): string | null {
    const re = /(?:^|;)\s*(?:padding(?:-top|-right|-bottom|-left)?|margin(?:-top|-right|-bottom|-left)?|gap|width|height|min-width|max-width|min-height|max-height|inset|top|right|bottom|left)\s*:\s*([^;]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(style)) !== null) {
      const value = m[1].trim();
      if (!value || value.includes('var(') || value.includes('calc(')) continue;
      if (/\d+(\.\d+)?(px|rem|em|vh|vw|%)\b/.test(value)) return value;
    }
    return null;
  }

  /** Valor tipográfico literal (font-size/family/weight, letter-spacing, line-height) (o null). */
  private hardcodedTypography(style: string): string | null {
    const re = /(?:^|;)\s*(?:font-size|font-family|font-weight|letter-spacing|line-height)\s*:\s*([^;]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(style)) !== null) {
      const value = m[1].trim();
      if (!value || value.includes('var(')) continue;
      if (/\d+(\.\d+)?(px|rem|em|vw|vh|%)\b/.test(value) || /^[a-z][a-z -]*$/i.test(value)) return value;
    }
    return null;
  }

  private static readonly HARDCODED_STYLE_SEL = '[style]';

  /** Escanea el documento en busca de valores hardcoded (colores, espaciado,
   *  tipografía) en estilos inline que violan la política de tokens semánticos. */
  detectHardcoded(): HardcodedReport {
    const report: HardcodedReport = { colors: [], spacing: [], typography: [], total: 0 };
    if (!this.isBrowser) return report;
    const doc = this.document as any;
    doc.querySelectorAll(DsInspectorService.HARDCODED_STYLE_SEL).forEach((el: any) => {
      const style = (el.getAttribute('style') || '').toLowerCase();
      if (!style.trim()) return;
      const label = this.elementLabel(el);
      const color = this.hardcodedColor(style);
      if (color) report.colors.push({ element: label, property: 'color', value: color });
      const space = this.hardcodedSpacing(style);
      if (space) report.spacing.push({ element: label, property: 'spacing', value: space });
      const type = this.hardcodedTypography(style);
      if (type) report.typography.push({ element: label, property: 'typography', value: type });
    });
    report.total = report.colors.length + report.spacing.length + report.typography.length;
    return report;
  }

  private elementLabel(el: any): string {
    const name = el.getAttribute && el.getAttribute('data-name');
    const tag = (el.tagName || 'element').toLowerCase();
    return name ? `${tag} [${name}]` : tag;
  }
}

/** Una violación hardcoded concreta (elemento + propiedad + valor literal). */
export interface HardcodedViolation {
  element: string;
  property: string;
  value: string;
}

/** Resultado del escaneo de violaciones hardcoded en la página. */
export interface HardcodedReport {
  colors: HardcodedViolation[];
  spacing: HardcodedViolation[];
  typography: HardcodedViolation[];
  total: number;
}