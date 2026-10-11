import { ChangeDetectionStrategy, Component, inject, Optional, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ThemeService, DESIGN_SYSTEM_SERVICE } from '../../design/system';
import type { IDesignSystemService } from '../../design/system';
import { FabI18nService } from '../services/fab-i18n.service';

/** Resultado de un nivel de la estructura canónica mínima Akuri-OMA. */
interface CanonicalLevelResult {
  level: string;
  kind: string;
  present: boolean;
  count: number;
  note: string;
}

/** Niveles canónicos del spine mínimo: display → page → area → section → content. */
const CANONICAL_LEVELS: { level: string; kind: string }[] = [
  { level: 'Display', kind: 'display' },
  { level: 'Página', kind: 'page' },
  { level: 'Área', kind: 'area' },
  { level: 'Sección', kind: 'section' },
  { level: 'Contenido', kind: 'content' },
];

/**
 * ds-fab-ds-tab — TAB "DS": ubicación del design system (activo, tema, tokens
 * montados) y verificación de la ESTRUCTURA CANÓNICA MÍNIMA de Akuri-OMA
 * (display → page → area → section → content).
 */
@Component({
  selector: 'ds-fab-ds-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      <div class="ds-ft__group-title">{{ i18n.t('ds.location') }}</div>
      <div class="ds-ft__box">
        <div class="ds-ft__row"><span>{{ i18n.t('ds.active') }}</span><b>{{ dsName() }}</b></div>
        <div class="ds-ft__row"><span>{{ i18n.t('ds.theme') }}</span><b>{{ themeName() }} · {{ themeMode() }}</b></div>
        <div class="ds-ft__row"><span>{{ i18n.t('ds.tokens') }}</span><b>{{ tokenCount() }}</b></div>
        <div class="ds-ft__row"><span>{{ i18n.t('ds.origin') }}</span><b>{{ tokensResolved() ? i18n.t('ds.originMounted') : i18n.t('ds.originNone') }}</b></div>
        <div class="ds-ft__row"><span>{{ i18n.t('ds.source') }}</span><b>{{ i18n.t('ds.sourceValue') }}</b></div>
      </div>

      <div class="ds-ft__group-title">{{ i18n.t('ds.canonical') }}</div>
      <div class="ds-ft__box">
        <div class="ds-ft__summary" [class.ds-ft__badge--ok]="canonical().pass" [class.ds-ft__badge--warn]="!canonical().pass">
          {{ canonical().pass ? i18n.t('ds.complies') : i18n.t('ds.notComplies') }}
        </div>
        <div class="ds-ft__canon">
          @for (lvl of canonical().levels; track lvl.kind) {
            <div class="ds-ft__canon-row">
              <span class="ds-ft__canon-level">{{ lvl.level }}</span>
              <code class="ds-ft__canon-kind">{{ lvl.kind }}</code>
              <span class="ds-ft__canon-status" [class.ds-ft__canon-ok]="lvl.present" [class.ds-ft__canon-miss]="!lvl.present">
                {{ lvl.present ? '✓ ' + lvl.count : '✗' }}
              </span>
            </div>
            @if (lvl.note) { <div class="ds-ft__canon-note">{{ lvl.note }}</div> }
          }
        </div>
        <button class="ds-ft__scan" (click)="run()">{{ i18n.t('ds.reverify') }}</button>
      </div>
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7;
    }
    .ds-ft__box {
      display: flex; flex-direction: column; gap: 4px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 6px 8px;
    }
    .ds-ft__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .ds-ft__row span { font-size: 10px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
    .ds-ft__row b { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ds-ft__summary { font-size: 11px; font-weight: 700; margin-bottom: 2px; }
    .ds-ft__badge--ok { color: var(--ds-color-tooling-fab-notif-success); }
    .ds-ft__badge--warn { color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-ft__canon { display: flex; flex-direction: column; gap: 2px; }
    .ds-ft__canon-row { display: flex; align-items: center; gap: 8px; }
    .ds-ft__canon-level { font-size: 10px; font-weight: 600; color: var(--ds-designmode-inspector-on); width: 56px; flex-shrink: 0; }
    .ds-ft__canon-kind { font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7; flex: 1; }
    .ds-ft__canon-status { font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .ds-ft__canon-ok { color: var(--ds-color-tooling-fab-notif-success); }
    .ds-ft__canon-miss { color: var(--ds-color-tooling-fab-notif-error); }
    .ds-ft__canon-note { font-size: 9px; color: var(--ds-color-tooling-fab-notif-warning); margin: 0 0 2px 64px; }
    .ds-ft__scan {
      margin-top: 4px; padding: 5px 8px; border-radius: 6px; cursor: pointer;
      border: 1px solid var(--ds-designmode-control-border);
      background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on);
      font-size: 10px; font-weight: 700;
    }
    .ds-ft__scan:hover { filter: brightness(1.1); }
  `],
})
export class DsFabDsTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly themeSvc = inject(ThemeService);
  @Optional() private readonly dsSvc = inject(DESIGN_SYSTEM_SERVICE, { optional: true });
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly dsName = signal('');
  protected readonly themeName = signal('');
  protected readonly themeMode = signal('');
  protected readonly tokenCount = signal(0);
  protected readonly tokensResolved = signal(false);
  protected readonly canonical = signal<{ pass: boolean; levels: CanonicalLevelResult[] }>({ pass: false, levels: [] });

  constructor() {
    if (!this.isBrowser) return;
    this.dsName.set(this.dsSvc ? (this.dsSvc.activeId() || this.i18n.t('ds.unregistered')) : this.i18n.t('ds.unregistered'));
    this.themeName.set(this.themeSvc.themeName());
    this.themeMode.set(this.themeSvc.themeMode());
    const cs = getComputedStyle(this.document.documentElement);
    let count = 0;
    try {
      for (const prop of Array.from(cs)) {
        if (prop.startsWith('--ds-') && cs.getPropertyValue(prop).trim()) count++;
      }
    } catch {
      count = 0;
    }
    this.tokenCount.set(count);
    this.tokensResolved.set(!!cs.getPropertyValue('--ds-color-brand-primary').trim());
    this.run();
  }

  protected run(): void {
    if (!this.isBrowser) return;
    const doc = this.document as any;
    const count = (sel: string): number => doc.querySelectorAll(sel).length;

    const levels: CanonicalLevelResult[] = CANONICAL_LEVELS.map((l) => {
      const sel = `[data-container="${l.kind}"]`;
      const n = count(sel);
      let note = '';
      if (l.kind === 'page' && n > 0) {
        const page = doc.querySelector(sel);
        const inDisplay = page && page.closest && !!page.closest('[data-container="display"]');
        note = inDisplay ? '' : this.i18n.t('ds.notePageOutside');
      }
      if (l.kind === 'content' && n === 0) {
        // El spine permite content como bloques directos dentro de secciones.
        const sectionsWithContent = Array.from(doc.querySelectorAll('[data-container="section"], [data-container="subsection"]'))
          .filter((s: any) => Array.from(s.children || []).some((c: any) => !c.matches?.('[data-container]')));
        const n2 = sectionsWithContent.length;
        return { level: l.level, kind: l.kind, present: n2 > 0, count: n2, note: this.i18n.t('ds.noteDirectBlocks') };
      }
      return { level: l.level, kind: l.kind, present: n > 0, count: n, note };
    });

    const pass = levels.every((l) => l.present);
    this.canonical.set({ pass, levels });
  }
}