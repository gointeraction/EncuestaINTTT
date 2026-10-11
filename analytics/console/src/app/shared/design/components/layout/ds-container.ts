import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { DsContainerKind } from '../../system';

/**
 * ds-container — the SINGLE container primitive, level-identified.
 *
 * One object, many cases. Every structural element of a layout or page is a
 * ds-container carrying a KIND (its level in the canonical tree, 2-digit):
 *
 *   display(10) → page(20) → area(30) → row(31)|block(32) → section(40) → subsection(41) → content(50)
 *
 * NESTING RULES: the MINIMAL canonical spine is display → page → area →
 * section → content. `display` is LAYOUT-ONLY: it wraps the <router-outlet/>
 * and hosts the design-mode FAB (what happens in the layout vs in the page).
 * `page` is the canvas of the ROUTED page, embedded inside display. `area` is
 * the structural block (roles header/aside/body/footer by name). `row` (flex
 * row) and `block` (flex column box) are GROUPERS that group sections;
 * `subsection` lives ONLY inside a section; `content` is the innermost block
 * level (leaf) and lives ONLY inside a section/subsection. Parents contain
 * children (nesting); siblings sit side by side (a row of sections with
 * [basis]). The page kind is ALSO the page canvas: it fills the available
 * viewport space where it is enclosed (flex column, no scroll of its own) and
 * hosts the shell roles by NAME — an area named "header" / "aside" / "footer"
 * stays fixed with a minimum size, "aside" scrolls itself, and "body" is the
 * ONLY element scrolled by the page. Styled ONLY with tokens + Tailwind; every
 * level answers the same knobs (bordered, position, background, padded, gap,
 * basis, wrap).
 */

@Component({
  selector: 'ds-container',
  standalone: true,
  host: {
    '[attr.data-container]': 'kind()',
    '[attr.data-name]': 'name()',
    '[attr.data-page]': 'page()',
    '[class.ds-container-sticky]': 'sticky()',
    '[class.ds-container-bordered]': 'bordered()',
    '[class.ds-container-nopad]': '!padded()',
    '[class.ds-container-wrap]': 'wrap()',
    '[style.flex]': 'basis() ? `0 0 ${basis()}` : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title(); as t) {
      <h2 class="ds-container-heading" [class.ds-container-heading-sub]="kind() === 'subsection'">{{ t }}</h2>
    }
    <div class="ds-container-content"><ng-content/></div>
  `,
  styles: `
    :host { display: block; box-sizing: border-box; }

    /* level 10 — display: the LAYOUT-ONLY container. Wraps the router-outlet
       (where the routed page embeds its page canvas) and hosts the design-mode
       FAB. Flex column, fills the viewport space the layout gives it; the
       routed page renders INSIDE it. */
    :host([data-container="display"]) {
      display: flex; flex-direction: column;
      flex: 1 1 auto; min-width: 0;
      min-height: 0;
      background: var(--ds-surface-page); color: var(--ds-surface-page-on);
      font-family: var(--ds-font-sans);
      overflow: hidden;
      padding: 0;
    }

    /* MECANISMO AUTOMÁTICO de altura page↔display — REGLA INVARIANTE:
       el layout asigna al display el espacio disponible y el display despliega
       el <router-outlet/>; toda página que se renderice allí debe tener un page
       container que COINCIDA exactamente con el display.
       El page container usa height:100% (abajo) para llenar el display. Pero el
       <router-outlet/> genera un host de componente anónimo (app-mf-login,
       app-dashboard, app-xxx-page…) entre el display y el page, un elemento
       block sin altura propia que ROMPE la cadena de porcentajes: height:100%
       se resuelve contra un padre height:auto y el page desborda el display.
       Fix automático: cualquier elemento NO estructural entre un display y un
       page container (el host ruteado y/o wrappers intermedios) se estira como
       flex item del display (:has() → independiente del nombre del host y de la
       profundidad de anidamiento). El wrapper .ds-container-content del display
       (display:contents) se transparenta, así que el host estirado ES de facto
       el flex item del display y el page (flex:1) llena exactamente su altura.
       Se excluyen ds-container y .ds-container-content para no alterar el
       modelo estructural (un page nunca contiene otro page, así que :has()
       nunca atrapa el interior de una página).
       ::ng-deep es obligatorio: el host es contenido proyectado por el
       router-outlet (encapsulación emulada no le adjunta atributos). */
    :host([data-container="display"]) ::ng-deep :not(ds-fab, router-outlet, ds-container, .ds-container-content):has([data-container="page"]) {
      display: flex; flex-direction: column;
      flex: 1 1 auto; min-height: 0; min-width: 0;
    }

    /* level 20 — page canvas. Fills the available viewport space where it is
       enclosed (flex column, full size). The page itself NEVER scrolls:
       header/footer areas are fixed, the body area child is the only page
       scroller, aside scrolls itself (roles by data-name below). */
    :host([data-container="page"]) {
      display: flex; flex-direction: column; flex: 1 1 auto;
      width: 100%; height: 100%; min-height: 0;
      background: var(--ds-surface-page); color: var(--ds-surface-page-on);
      font-family: var(--ds-font-sans);
      overflow: hidden;
      padding: 0;
    }

    /* ── App-shell roles (CONVENTION by name, not kinds) ──
       The role is read from the NAME's SUFFIX, so the two planes can be told
       apart: the LAYOUT (shell) uses shell-body / shell-header ..., the PAGE
       uses body / header ... . Both match the same role behavior. An area named
       *-header / *-aside / *-footer keeps its size (fixed) with a minimum;
       *-aside additionally scrolls itself; *-body is the ONLY element that
       scrolls with the page. These are the fixed frame pieces of the shell; the
       page itself never scrolls. */
    :host([data-container="area"][data-name="header"]),
    :host([data-container="area"][data-name$="-header"]),
    :host([data-container="area"][data-name="aside"]),
    :host([data-container="area"][data-name$="-aside"]),
    :host([data-container="area"][data-name="footer"]),
    :host([data-container="area"][data-name$="-footer"]) {
      flex-shrink: 0;
    }
    :host([data-container="area"][data-name="header"]),
    :host([data-container="area"][data-name$="-header"]) { min-height: var(--ds-shell-header-min, 3.5rem); }
    :host([data-container="area"][data-name="aside"]),
    :host([data-container="area"][data-name$="-aside"]) {
      min-width: var(--ds-shell-aside-min, 16rem);
      overflow-y: auto;
    }
    :host([data-container="area"][data-name="footer"]),
    :host([data-container="area"][data-name$="-footer"]) { min-height: var(--ds-shell-footer-min, 2.5rem); }
    :host([data-container="area"][data-name="body"]),
    :host([data-container="area"][data-name$="-body"]) {
      flex: 1 1 auto; min-height: 0;
      overflow-y: auto;
    }

    /* level 30 — area: STRUCTURAL ROLE ONLY (flex column). Size, surface
       and spacing belong to the author: w-[80%], flex-[70], bg-*, p-* all win. */
    :host([data-container="area"]) { display: flex; flex-direction: column; }

    /* level 31 — row: STRUCTURAL ROLE ONLY (flex row). Alignment, width and gap
       belong to the author: items-end, gap-3, lg:flex-[70] all win. */
    :host([data-container="row"]) { display: flex; flex-direction: row; }
    :host([data-container="row"].ds-container-wrap) { flex-wrap: wrap; }

    /* level 32 — block: GROUPER box (flex column) that groups sections. Box
       surface/size belong to the author: bg-*, rounded-*, shadow-*, p-* win. */
    :host([data-container="block"]) { display: flex; flex-direction: column; }
    :host([data-container="block"].ds-container-wrap) { flex-wrap: wrap; }

    /* level 40/41 — section / subsection: labelled content blocks (block flow).
       Subsection lives ONLY inside a section. */
    :host([data-container="section"]),
    :host([data-container="subsection"]) { display: block; }

    /* level 50 — content: the innermost block level (leaf). Lives ONLY inside a
       section/subsection; holds no structural children. */
    :host([data-container="content"]) { display: block; }

    .ds-container-heading {
      font-family: var(--ds-font-brand);
      font-size: var(--ds-text-heading-3);
      font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-surface-body-on);
      margin: 0 0 var(--ds-space-3);
    }
    :host([data-container="subsection"]) .ds-container-heading {
      font-size: var(--ds-text-heading-5);
      margin: 0 0 var(--ds-space-2);
    }

    /* Layout-transparent: children participate directly in the host's flex
       context, so a row's flex items ARE the sections and the page body
       scrolls the real content (no block wrapper in between). */
    .ds-container-content { display: contents; }

    /* common knobs — every level answers them */
    :host.ds-container-sticky { position: sticky; top: 0; z-index: var(--ds-z-sticky); }
    :host.ds-container-bordered { border: 1px solid var(--ds-border-subtle); }
    :host.ds-container-nopad { padding: 0; }
  `,
})
export class DsContainerComponent {
  /** Level in the canonical tree: display=10, page=20, area=30, row|block=31|32, section=40, subsection=41, content=50. */
  readonly kind = input<DsContainerKind>('area');
  /** Identifier for this container (emitted as data-name). */
  readonly name = input('');
  /** Optional heading for section/subsection (renders h2/h3). */
  readonly title = input('');
  /** Page-canvas id (emitted as data-page) when this container IS the page.
   *  Se escribe en el marcado como `data-page="<id>"` (alias) para que las
   *  páginas lo declaren directamente y el host binding lo emita intacto. */
  readonly page = input('', { alias: 'data-page' });
  /** Sticky positioning (position: sticky; top: 0; z: sticky). */
  readonly sticky = input(false);
  /** Border 1px var(--ds-border-subtle). */
  readonly bordered = input(false);
  /** Padding off. */
  readonly padded = input(true);
  /** Wrap content (rows). */
  readonly wrap = input(false);
  /** Proportional width inside a row context, e.g. '30%' → flex: 0 0 30%. */
  readonly basis = input('');
}