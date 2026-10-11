import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FabService } from '../services/fab.service';
import { FabI18nService } from '../services/fab-i18n.service';

/** Caja CSS con sus 4 lados ya resueltos (px). */
interface CssBox {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

/** Snapshot de las características de layout de un container (getComputedStyle). */
interface ContainerInfo {
  name: string;
  kind: string;
  level: string;
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
  padding: CssBox;
  margin: CssBox;
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  alignContent: string;
  flexWrap: string;
  gap: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  position: string;
  boxSizing: string;
}

/** Etiqueta humana del nivel canónico (misma semántica que los LEVEL_BUTTONS del FAB). */
const LEVEL_LABELS: Readonly<Record<string, string>> = {
  display: 'ci.level.display',
  page: 'ci.level.page',
  area: 'ci.level.area',
  row: 'ci.level.row',
  block: 'ci.level.block',
  section: 'ci.level.section',
  subsection: 'ci.level.subsection',
  content: 'ci.level.content',
};

/**
 * ds-container-inspector-popup — popup de PROPIEDADES de un container.
 * Se abre al hacer click sobre el LABEL de un container en design mode. Muestra
 * las características medidas en runtime (getComputedStyle): nombre, tipo/nivel,
 * dimensiones (ancho/alto + min/max), padding, margin y el sistema flex o grid.
 * Estilos propios basados en los tokens de tooling del FAB (viajan con el paquete).
 */
@Component({
  selector: 'ds-container-inspector-popup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (info(); as c) {
      <div class="ds-ci">
        <header class="ds-ci__head">
          <span class="ds-ci__title">
            <span class="ds-ci__kind">{{ c.kind }}</span>
            <code class="ds-ci__name">{{ c.name }}</code>
          </span>
          <button type="button" class="ds-ci__close" [attr.aria-label]="i18n.t('fab.close')"
                  (click)="fab.closeInspectedElement()">×</button>
        </header>

        <div class="ds-ci__section ds-ci__section--id">
          <div class="ds-ci__row"><span>{{ i18n.t('ci.level') }}</span><b>{{ c.level }}</b></div>
          <div class="ds-ci__row"><span>{{ i18n.t('ci.display') }}</span><b>{{ c.display }}</b></div>
          <div class="ds-ci__row"><span>{{ i18n.t('ci.position') }}</span><b>{{ c.position }}</b></div>
          <div class="ds-ci__row"><span>{{ i18n.t('ci.boxSizing') }}</span><b>{{ c.boxSizing }}</b></div>
        </div>

        <div class="ds-ci__section-title">{{ i18n.t('ci.dimensions') }}</div>
        <div class="ds-ci__box ds-ci__box--2">
          <div class="ds-ci__row"><span>{{ i18n.t('ci.width') }}</span><b>{{ c.width }}</b></div>
          <div class="ds-ci__row"><span>{{ i18n.t('ci.height') }}</span><b>{{ c.height }}</b></div>
          <div class="ds-ci__row"><span>min-w</span><b>{{ c.minWidth }}</b></div>
          <div class="ds-ci__row"><span>max-w</span><b>{{ c.maxWidth }}</b></div>
          <div class="ds-ci__row"><span>min-h</span><b>{{ c.minHeight }}</b></div>
          <div class="ds-ci__row"><span>max-h</span><b>{{ c.maxHeight }}</b></div>
        </div>

        <div class="ds-ci__section-title">{{ i18n.t('ci.padding') }}</div>
        <div class="ds-ci__box ds-ci__box--2">
          <div class="ds-ci__row"><span>top</span><b>{{ c.padding.top }}</b></div>
          <div class="ds-ci__row"><span>right</span><b>{{ c.padding.right }}</b></div>
          <div class="ds-ci__row"><span>bottom</span><b>{{ c.padding.bottom }}</b></div>
          <div class="ds-ci__row"><span>left</span><b>{{ c.padding.left }}</b></div>
        </div>

        <div class="ds-ci__section-title">{{ i18n.t('ci.margin') }}</div>
        <div class="ds-ci__box ds-ci__box--2">
          <div class="ds-ci__row"><span>top</span><b>{{ c.margin.top }}</b></div>
          <div class="ds-ci__row"><span>right</span><b>{{ c.margin.right }}</b></div>
          <div class="ds-ci__row"><span>bottom</span><b>{{ c.margin.bottom }}</b></div>
          <div class="ds-ci__row"><span>left</span><b>{{ c.margin.left }}</b></div>
        </div>

        @if (isFlex()) {
          <div class="ds-ci__section-title">{{ i18n.t('ci.flex') }}</div>
          <div class="ds-ci__box ds-ci__box--2">
            <div class="ds-ci__row"><span>direction</span><b>{{ c.flexDirection }}</b></div>
            <div class="ds-ci__row"><span>wrap</span><b>{{ c.flexWrap }}</b></div>
            <div class="ds-ci__row"><span>justify</span><b>{{ c.justifyContent }}</b></div>
            <div class="ds-ci__row"><span>align</span><b>{{ c.alignItems }}</b></div>
            <div class="ds-ci__row"><span>align-content</span><b>{{ c.alignContent }}</b></div>
            <div class="ds-ci__row"><span>gap</span><b>{{ c.gap }}</b></div>
          </div>
        }

        @if (isGrid()) {
          <div class="ds-ci__section-title">{{ i18n.t('ci.grid') }}</div>
          <div class="ds-ci__box">
            <div class="ds-ci__row"><span>columns</span><b>{{ c.gridTemplateColumns }}</b></div>
            <div class="ds-ci__row"><span>rows</span><b>{{ c.gridTemplateRows }}</b></div>
            <div class="ds-ci__row"><span>gap</span><b>{{ c.gap }}</b></div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .ds-ci {
      position: fixed; left: 1rem; top: 50%; transform: translateY(-50%);
      z-index: calc(var(--ds-z-fab) + 2);
      width: 292px; max-height: 80vh; overflow-y: auto;
      background: var(--ds-designmode-inspector-bg); color: var(--ds-designmode-inspector-on);
      border: 1px solid var(--ds-designmode-inspector-border);
      border-radius: var(--ds-designmode-inspector-radius);
      box-shadow: var(--ds-shadow-lg);
      font-size: 11px;
      padding: 10px 12px 12px;
      box-sizing: border-box;
    }
    .ds-ci__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .ds-ci__title { display: flex; align-items: center; gap: 6px; min-width: 0; }
    .ds-ci__kind {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on);
      padding: 2px 6px; border-radius: 4px; flex-shrink: 0;
    }
    .ds-ci__name { font-family: monospace; font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ds-ci__close {
      flex-shrink: 0; border: none; background: transparent; color: var(--ds-designmode-inspector-on);
      font-size: 14px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 4px;
    }
    .ds-ci__close:hover { background: var(--ds-designmode-control-bg); }
    .ds-ci__section { margin-bottom: 6px; }
    .ds-ci__section--id { border-bottom: 1px solid var(--ds-designmode-inspector-border); padding-bottom: 6px; }
    .ds-ci__section-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7;
      margin: 8px 0 4px;
    }
    .ds-ci__box {
      display: flex; flex-direction: column; gap: 2px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 4px 8px;
    }
    .ds-ci__box--2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; }
    .ds-ci__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .ds-ci__row span { color: var(--ds-designmode-inspector-on); opacity: 0.7; font-size: 10px; }
    .ds-ci__row b { font-family: monospace; font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); white-space: nowrap; }
  `],
})
export class DsContainerInspectorPopupComponent {
  protected readonly fab = inject(FabService);
  protected readonly i18n = inject(FabI18nService);
  protected readonly info = signal<ContainerInfo | null>(null);

  protected readonly isFlex = computed(() => {
    const c = this.info();
    return !!c && /flex/.test(c.display);
  });
  protected readonly isGrid = computed(() => {
    const c = this.info();
    return !!c && /grid/.test(c.display);
  });

  constructor() {
    effect(() => {
      const el = this.fab.inspectedElement();
      this.info.set(el ? this.readInfo(el) : null);
    });
  }

  /** Lee las características de layout del container desde getComputedStyle. */
  private readInfo(el: Element): ContainerInfo {
    const cs = getComputedStyle(el);
    const kind = el.getAttribute('data-container') ?? 'content';
    const name = el.getAttribute('data-name') ?? el.getAttribute('data-page') ?? el.tagName.toLowerCase();
    return {
      name,
      kind,
      level: this.i18n.t(LEVEL_LABELS[kind] ?? kind),
      width: cs.width,
      height: cs.height,
      minWidth: cs.minWidth,
      maxWidth: cs.maxWidth,
      minHeight: cs.minHeight,
      maxHeight: cs.maxHeight,
      padding: this.box4(cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft),
      margin: this.box4(cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft),
      display: cs.display,
      flexDirection: cs.flexDirection,
      justifyContent: cs.justifyContent,
      alignItems: cs.alignItems,
      alignContent: cs.alignContent,
      flexWrap: cs.flexWrap,
      gap: cs.gap,
      gridTemplateColumns: cs.gridTemplateColumns,
      gridTemplateRows: cs.gridTemplateRows,
      position: cs.position,
      boxSizing: cs.boxSizing,
    };
  }

  private box4(top: string, right: string, bottom: string, left: string): CssBox {
    return { top, right, bottom, left };
  }
}