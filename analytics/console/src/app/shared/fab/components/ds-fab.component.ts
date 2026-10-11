import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, Optional, ElementRef, DestroyRef } from '@angular/core';
import { NgTemplateOutlet, DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../design/system';
import { FabService, LEVEL_KEYS } from '../services/fab.service';
import { DsInspectorService } from '../services/ds-inspector.service';
import { FabI18nService } from '../services/fab-i18n.service';
import { DESIGN_SYSTEM_SERVICE } from '../../design/system';
import { DATA_SOURCE_SERVICE } from '../../design/system';
import { DATA_TOOLS_SERVICE } from '../../design/system';
import { DsContainerKind, DS_CONTAINER_KINDS, PlaneId } from '../../design/system';
import { LANGUAGE_SERVICE } from '../../design/system/services/language.service';
import { DsDataToolsModalComponent } from './ds-data-tools-modal.component';
import { DsContainerInspectorPopupComponent } from './ds-container-inspector-popup.component';
import { DsFabColorsTabComponent } from './ds-fab-colors-tab.component';
import { DsFabSurfacesTabComponent } from './ds-fab-surfaces-tab.component';
import { DsFabTypographyTabComponent } from './ds-fab-typography-tab.component';
import { DsFabNotificationsTabComponent } from './ds-fab-notifications-tab.component';
import { DsFabDsTabComponent } from './ds-fab-ds-tab.component';
import { DsFabEffectsTabComponent } from './ds-fab-effects-tab.component';
import { DsFabGradientsTabComponent } from './ds-fab-gradients-tab.component';
import { DsFabShadowsTabComponent } from './ds-fab-shadows-tab.component';
import { DsFabSpacingTabComponent } from './ds-fab-spacing-tab.component';
import { DsFabBreakpointsTabComponent } from './ds-fab-breakpoints-tab.component';
import { DsFabBrandTabComponent } from './ds-fab-brand-tab.component';

/** Per-level button model: canonical kind + i18n label key + design-mode dot. */
interface LevelButton {
  kind: DsContainerKind;
  labelKey: string;
  dot: string;
}

const LEVEL_LABEL_KEYS: Readonly<Record<DsContainerKind, string>> = {
  display: 'fab.level.display',
  page: 'fab.level.page',
  area: 'fab.level.areas',
  row: 'fab.level.rows',
  block: 'fab.level.blocks',
  section: 'fab.level.sections',
  subsection: 'fab.level.subsections',
  content: 'fab.level.content',
};

const LEVEL_DOTS: Readonly<Record<DsContainerKind, string>> = {
  display: 'var(--ds-designmode-level-display)',
  page: 'var(--ds-designmode-page-border)',
  area: 'var(--ds-designmode-level-area)',
  row: 'var(--ds-designmode-level-row)',
  block: 'var(--ds-designmode-level-block)',
  section: 'var(--ds-designmode-level-section)',
  subsection: 'var(--ds-designmode-level-subsection)',
  content: 'var(--ds-designmode-level-content)',
};

/** The canonical levels in order — the FAB renders exactly these, no more.
 *  `content` is EXCLUDED: it keeps its dedicated toggle below (innermost block
 *  level with hide-until-marked semantics, not a plain level button). */
const LEVEL_BUTTONS: readonly LevelButton[] = DS_CONTAINER_KINDS
  .filter((kind) => kind !== 'content')
  .map((kind) => ({
    kind, labelKey: LEVEL_LABEL_KEYS[kind], dot: LEVEL_DOTS[kind],
  }));

@Component({
  selector: 'ds-fab',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    DsDataToolsModalComponent,
    DsContainerInspectorPopupComponent,
    DsFabColorsTabComponent,
    DsFabSurfacesTabComponent,
    DsFabTypographyTabComponent,
    DsFabNotificationsTabComponent,
    DsFabDsTabComponent,
    DsFabEffectsTabComponent,
    DsFabGradientsTabComponent,
    DsFabShadowsTabComponent,
    DsFabSpacingTabComponent,
    DsFabBreakpointsTabComponent,
    DsFabBrandTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fabSvc.fabVisible()) {
      <button class="ds-fab__trigger" (click)="togglePanel()" [title]="i18n.t('fab.title')" [attr.aria-expanded]="panelOpen()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
      </button>

      @if (panelOpen()) {
        <div class="ds-fab__backdrop" (click)="togglePanel()"></div>
        <div
          class="ds-fab__panel ds-fab__panel--animate-in"
          [class.ds-fab__panel--dragged]="panelPos() !== null"
          [style.left.px]="panelPos()?.x ?? null"
          [style.top.px]="panelPos()?.y ?? null">
          <div class="ds-fab__header" (mousedown)="onDragStart($event)">
            <span class="ds-fab__title">{{ i18n.t('fab.title') }}</span>
            <span class="ds-fab__hotkey">{{ i18n.t('fab.hotkey') }}</span>
            <button class="ds-fab__close" (click)="togglePanel()" [attr.aria-label]="i18n.t('fab.close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <select class="ds-fab__select ds-fab__tabs-select" [value]="tab()" (change)="onTabChange($event)"
                  [attr.aria-label]="i18n.t('fab.sectionAria')">
            @for (group of tabGroups; track group.labelKey) {
              <optgroup [label]="i18n.t(group.labelKey)">
                @for (t of group.items; track t.id) {
                  <option [value]="t.id">{{ i18n.t(t.labelKey) }}</option>
                }
              </optgroup>
            }
          </select>

          <div class="ds-fab__context">
            <button type="button" class="ds-fab__context-toggle" (click)="contextOpen.set(!contextOpen())"
                    [attr.aria-expanded]="contextOpen()">
              <span class="ds-fab__plane-caret">{{ contextOpen() ? '▾' : '▸' }}</span>
              <span>{{ i18n.t('fab.context') }}</span>
            </button>
            @if (contextOpen()) {
            <div class="ds-fab__context-rows">
              <div class="ds-fab__context-row"><span>{{ i18n.t('fab.layout') }}</span><code>{{ context().layout || '—' }}</code></div>
              <div class="ds-fab__context-row"><span>{{ i18n.t('fab.module') }}</span><code>{{ context().module || '—' }}</code></div>
              <div class="ds-fab__context-row"><span>{{ i18n.t('fab.page') }}</span><code>{{ context().page || '—' }}</code></div>
            </div>
            }
          </div>

          <div class="ds-fab__tab-body">
            @switch (tab()) {
            @case ('layout') {
            <div class="ds-fab__grid">
              <div class="ds-fab__col">
                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.theme') }}</div>
                <div class="ds-fab__toggle">
                  <button [class.active]="themeSvc.themeMode() === 'light'" (click)="setMode('light')">{{ i18n.t('fab.tab.light') }}</button>
                  <button [class.active]="themeSvc.themeMode() === 'dark'" (click)="setMode('dark')">{{ i18n.t('fab.tab.dark') }}</button>
                </div>

                @if (langSvc) {
                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.language') }}</div>
                <div class="ds-fab__toggle">
                  <button [class.active]="langSvc.activeLang() === 'es'" (click)="langSvc.setLanguage('es')">ES</button>
                  <button [class.active]="langSvc.activeLang() === 'en'" (click)="langSvc.setLanguage('en')">EN</button>
                </div>
                }

                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.designMode') }}</div>
                <div class="ds-fab__toggle">
                  <button [class.active]="fabSvc.designMode()" (click)="fabSvc.toggleDesignMode()">
                    {{ fabSvc.designMode() ? i18n.t('fab.tab.yes') : i18n.t('fab.tab.no') }}
                  </button>
                </div>

                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.plane') }}</div>
                <div class="ds-fab__toggle">
                  <button [class.active]="fabSvc.activePlane() === 'layout'" (click)="fabSvc.setActivePlane('layout')">{{ i18n.t('fab.layout') }}</button>
                  <button [class.active]="fabSvc.activePlane() === 'page'" (click)="fabSvc.setActivePlane('page')">{{ i18n.t('fab.page') }}</button>
                  <button [class.active]="fabSvc.activePlane() === 'both'" (click)="fabSvc.setActivePlane('both')">{{ i18n.t('fab.tab.both') }}</button>
                </div>

                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.globals') }}</div>
                <div class="ds-fab__toggle ds-fab__toggle--stack">
                  <button [class.active]="insp().showColors" (click)="fabSvc.toggleColors()" style="width:100%; font-size:10px;">
                    {{ insp().showColors ? '✓' : '○' }} {{ i18n.t('fab.tab.colors') }}
                  </button>
                  <button [class.active]="insp().withContent" (click)="fabSvc.toggleWithContent()" style="width:100%; font-size:10px;">
                    {{ insp().withContent ? '✓' : '○' }} {{ i18n.t('fab.tab.content') }}
                  </button>
                  @if (dataSvc) {
                  <button [class.active]="dataSvc.origin() === 'mock'" (click)="dataSvc.toggle()" style="width:100%; font-size:10px;">
                    {{ dataSvc.origin() === 'mock' ? '✓' : '○' }} {{ i18n.t('fab.tab.mock') }}
                  </button>
                  }
                </div>

                @if (dataTools) {
                <button class="ds-fab__data-tools" (click)="openDataTools()" [title]="i18n.t('fab.tab.dataTools')">
                  {{ i18n.t('fab.tab.dataTools') }}
                </button>
                }
              </div>

              <div class="ds-fab__col ds-fab__col--inspector">
                @if (dsSvc) {
                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.ds') }}</div>
                <div class="ds-fab__ds">
                  <select class="ds-fab__select" [value]="dsSvc.activeId()" (change)="onDesignSystem($event)"
                          [attr.aria-label]="i18n.t('fab.tab.ds')">
                    @for (sys of dsSvc.options(); track sys.id) {
                      <option [value]="sys.id">{{ sys.name }}</option>
                    }
                  </select>
                  <div class="ds-fab__ds-preview" aria-hidden="true">
                    <span class="ds-fab__ds-dot" style="background: var(--ds-color-brand-primary)"></span>
                    <span class="ds-fab__ds-dot" style="background: var(--ds-color-brand-accent)"></span>
                    <span class="ds-fab__ds-dot" style="background: var(--ds-color-brand-contrast)"></span>
                    <span class="ds-fab__ds-dot" style="background: var(--ds-color-brand-dark)"></span>
                    <span class="ds-fab__ds-dot" style="background: var(--ds-color-state-success)"></span>
                    <span class="ds-fab__ds-dot" style="background: var(--ds-color-state-danger)"></span>
                  </div>
                </div>
                }

                <div class="ds-fab__col-title">{{ i18n.t('fab.tab.inspector') }}</div>

                @if (fabSvc.activePlane() === 'both') {
                  <ng-container *ngTemplateOutlet="planeBlock; context: { $implicit: 'layout' }" />
                  <ng-container *ngTemplateOutlet="planeBlock; context: { $implicit: 'page' }" />
                } @else {
                  <ng-container *ngTemplateOutlet="planeBlock; context: { $implicit: fabSvc.activePlane() }" />
                }
              </div>
            </div>
            }
            @case ('colores') {
              <ds-fab-colors-tab />
            }
            @case ('superficies') {
              <ds-fab-surfaces-tab />
            }
            @case ('tipografia') {
              <ds-fab-typography-tab />
            }
            @case ('efectos') {
              <ds-fab-effects-tab />
            }
            @case ('gradientes') {
              <ds-fab-gradients-tab />
            }
            @case ('sombras') {
              <ds-fab-shadows-tab />
            }
            @case ('espaciado') {
              <ds-fab-spacing-tab />
            }
            @case ('breakpoints') {
              <ds-fab-breakpoints-tab />
            }
            @case ('brand') {
              <ds-fab-brand-tab />
            }
            @case ('notif') {
              <ds-fab-notifications-tab />
            }
            @case ('ds') {
              <ds-fab-ds-tab />
            }
            }
          </div>

          <ng-template #planeBlock let-plane>
            <div class="ds-fab__plane">
              <button class="ds-fab__plane-name" [class.ds-fab__plane-name--layout]="plane === 'layout'"
                      [class.ds-fab__plane-name--page]="plane === 'page'"
                      (click)="togglePlaneSection(plane)"
                      [attr.aria-expanded]="planeSectionOpen(plane)">
                <span class="ds-fab__plane-caret">{{ planeSectionOpen(plane) ? '▾' : '▸' }}</span>
                {{ plane === 'layout' ? i18n.t('fab.layout') : i18n.t('fab.page') }}
              </button>
              @if (planeSectionOpen(plane)) {
              <div class="ds-fab__toggle ds-fab__toggle--stack">
                @for (btn of levelButtonsFor(plane); track btn.kind) {
                <button [class.active]="planeLevel(plane, btn.kind)" (click)="fabSvc.toggleLevel(plane, btn.kind)" style="width:100%; font-size:10px;">
                  <span class="ds-fab__dot" [style.background]="btn.dot"></span>
                  {{ planeLevel(plane, btn.kind) ? '✓' : '○' }} {{ i18n.t(btn.labelKey) }}
                </button>
                }
                <button [class.active]="planeContent(plane)" (click)="fabSvc.toggleContent(plane)" style="width:100%; font-size:10px;">
                  <span class="ds-fab__dot" style="background: var(--ds-designmode-muted)"></span>
                  {{ planeContent(plane) ? '✓' : '○' }} {{ i18n.t('fab.tab.content') }}
                </button>
              </div>
              }
            </div>
          </ng-template>

          <div class="ds-fab__footer">{{ themeSvc.themeMode() === 'dark' ? i18n.t('fab.footer.dark') : i18n.t('fab.footer.light') }}</div>
        </div>
      }

      @if (dataToolsOpen()) {
        <ds-data-tools-modal (closed)="closeDataTools()" />
      }
    }

    <!-- Container-inspector popup: click sobre el label de un container en
         design mode → propiedades del container (tokens propios del FAB). -->
    <ds-container-inspector-popup />
  `,
  host: { '(document:keydown.control.shift.f)': 'onHotkeyToggle($event)' },
  styles: [`
    .ds-fab__trigger {
      position: fixed; bottom: 6rem; right: 1.5rem; z-index: var(--ds-z-fab);
      display: flex; align-items: center; justify-content: center;
      width: 48px; height: 48px; border-radius: var(--ds-radius-full);
      border: 1px solid var(--ds-designmode-fab-border);
      background: var(--ds-designmode-fab-bg); color: var(--ds-designmode-fab-on);
      box-shadow: var(--ds-designmode-fab-shadow); cursor: pointer;
      transition: transform 0.2s ease;
    }
    .ds-fab__trigger:hover { transform: scale(1.1); background: var(--ds-designmode-fab-hover); color: var(--ds-designmode-fab-hover-on); }
    .ds-fab__backdrop { position: fixed; inset: 0; z-index: var(--ds-z-fab); background: transparent; }
    .ds-fab__panel {
      position: fixed; bottom: 5.5rem; right: 1.5rem; z-index: var(--ds-z-fab);
      width: 384px; height: 616px; background: var(--ds-designmode-inspector-bg);
      border: 1px solid var(--ds-designmode-inspector-border); border-radius: var(--ds-designmode-inspector-radius);
      box-shadow: var(--ds-shadow-lg); overflow-y: auto;
      display: flex; flex-direction: column;
      color: var(--ds-designmode-inspector-on);
    }
    .ds-fab__panel--dragged { bottom: auto; right: auto; }
    @keyframes dsFabPanelIn {
      from { opacity: 0; transform: translateY(12px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ds-fab__panel--animate-in { animation: dsFabPanelIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .ds-fab__header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; cursor: grab; }
    .ds-fab__header:active { cursor: grabbing; }
    .ds-fab__title { user-select: none; }
    .ds-fab__pair { margin-bottom: 8px; }
    .ds-fab__pair-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .ds-fab__pair-label { font-size: 11px; font-weight: 600; color: var(--ds-designmode-inspector-on); }
    .ds-fab__verify-btn { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--ds-designmode-control-border); background: var(--ds-designmode-control-bg); color: var(--ds-designmode-inspector-on); cursor: pointer; }
    .ds-fab__verify-btn:hover { filter: brightness(1.12); }
    .ds-fab__verify { margin-top: 4px; font: 9px/1.5 monospace; padding: 4px 6px; border-radius: 4px; background: var(--ds-designmode-control-bg); color: var(--ds-designmode-inspector-on); }
    .ds-fab__verify--pass { color: var(--ds-color-tooling-fab-notif-success); }
    .ds-fab__verify--fail { color: var(--ds-color-tooling-fab-notif-error); }
    .ds-fab__verify--error { color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-fab__hint { font-size: 10px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
    .ds-fab__title { font-size: 14px; font-weight: 700; color: var(--ds-designmode-inspector-on); flex: 1; }
    .ds-fab__hotkey { font-size: 9px; color: var(--ds-designmode-inspector-on); background: var(--ds-designmode-control-bg); padding: 2px 6px; border-radius: 4px; margin-right: 8px; }
    .ds-fab__context {
      display: flex; flex-direction: column;
      margin: 0 16px 8px; padding: 3px;
      border-radius: 8px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      font-size: 11px;
    }
    .ds-fab__context-toggle {
      display: flex; align-items: center; gap: 5px; width: 100%;
      padding: 3px 5px; border: none; border-radius: 6px;
      background: transparent; cursor: pointer; font-family: inherit;
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.85;
    }
    .ds-fab__context-toggle:hover { background: var(--ds-designmode-control-border); opacity: 1; }
    .ds-fab__context-rows { display: flex; flex-direction: column; gap: 3px; margin-top: 3px; }
    .ds-fab__context-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .ds-fab__context-row span {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; flex-shrink: 0;
    }
    .ds-fab__context-row code {
      font-family: monospace; font-size: 10px; font-weight: 600;
      color: var(--ds-designmode-level-area);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ds-fab__select.ds-fab__tabs-select {
      width: 50%; margin: 0 16px 8px;
      appearance: auto;
    }
    .ds-fab__tab-body { padding: 0 16px 8px; flex: 1 1 auto; overflow-y: auto; min-height: 0; }
    .ds-fab__grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 0; }
    .ds-fab__data-tools { width: 100%; margin: 4px 0 6px; padding: 7px 10px; border: none; border-radius: 8px; background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on); font-size: 11px; font-weight: 700; cursor: pointer; }
    .ds-fab__data-tools:hover { filter: brightness(1.1); }
    .ds-fab__col { padding: 4px 10px 10px; }
    .ds-fab__col:first-child { border-right: 1px solid var(--ds-designmode-inspector-border); }
    .ds-fab__col-title { font-size: 10px; font-weight: 700; color: var(--ds-designmode-inspector-on); text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 4px 4px; }
    .ds-fab__plane { margin-bottom: 4px; }
    .ds-fab__plane-name {
      width: 100%; text-align: left;
      font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 3px 6px; margin-bottom: 3px; border-radius: 5px;
      border: none; cursor: pointer; font-family: inherit;
      color: var(--ds-designmode-inspector-on); background: var(--ds-designmode-control-border);
      display: flex; align-items: center; gap: 4px;
    }
    .ds-fab__plane-name:hover { filter: brightness(1.15); }
    .ds-fab__plane-caret { font-size: 8px; line-height: 1; opacity: 0.8; }
    .ds-fab__plane-name--layout { color: var(--ds-designmode-level-area); }
    .ds-fab__plane-name--page { color: var(--ds-designmode-level-section); }
    .ds-fab__plane-name--globals { color: var(--ds-designmode-inspector-on); }
    .ds-fab__close { background: none; border: none; cursor: pointer; color: var(--ds-designmode-inspector-on); padding: 4px; border-radius: 6px; display: flex; }
    .ds-fab__close:hover { background: var(--ds-designmode-control-bg); }
    .ds-fab__toggle { display: flex; gap: 3px; margin: 0 0 6px; padding: 2px; background: var(--ds-designmode-control-bg); border: 1px solid var(--ds-designmode-control-border); border-radius: 8px; }
    .ds-fab__toggle--stack { flex-direction: column; gap: 2px; background: var(--ds-designmode-control-bg); padding: 3px; border-radius: 8px; }
    .ds-fab__toggle button {
      flex: 1; padding: 4px 8px; border: none; border-radius: 6px;
      background: transparent; color: var(--ds-designmode-inspector-on); font-size: 11px; font-weight: 600; cursor: pointer;
    }
    .ds-fab__toggle button:hover { background: var(--ds-designmode-control-border); color: var(--ds-designmode-inspector-on); }
    .ds-fab__toggle button.active { background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on); }
    /* Stacked bullet rows (notifications, inspector levels): dot + text LEFT */
    .ds-fab__toggle--stack button {
      display: flex; align-items: center; justify-content: flex-start; gap: 6px;
      text-align: left; width: 100%;
    }
    .ds-fab__toggle--lang {
      flex: 1; padding: 5px 8px; border: none; border-radius: 6px;
      background: var(--ds-designmode-control-bg); color: var(--ds-designmode-inspector-on); cursor: pointer;
      font-size: 11px; font-weight: 600; box-shadow: 0 1px 2px color-mix(in oklab, var(--ds-color-black) 8%, transparent);
    }
    .ds-fab__ds { display: flex; flex-direction: column; gap: 6px; margin: 0 0 8px; }
    .ds-fab__select {
      width: 100%; padding: 5px 8px; border-radius: 6px; font-family: inherit;
      border: 1px solid var(--ds-designmode-control-border);
      background: var(--ds-designmode-control-bg); color: var(--ds-designmode-inspector-on);
      font-size: 11px; font-weight: 600; cursor: pointer;
    }
    .ds-fab__select:hover { filter: brightness(1.12); }
    .ds-fab__ds-preview { display: flex; gap: 4px; }
    .ds-fab__ds-dot {
      display: inline-block; width: 14px; height: 14px; border-radius: 4px;
      border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-fab__toast {
      position: fixed; bottom: 6.5rem; right: 1.5rem; z-index: calc(var(--ds-z-fab) + 1);
      display: flex; align-items: center; gap: 8px;
      max-width: 340px; padding: 8px 12px; border-radius: 8px;
      background: var(--ds-color-tooling-fab-surface); color: var(--ds-color-tooling-fab-surface-on);
      border: 1px solid var(--ds-color-tooling-fab-control-border); box-shadow: var(--ds-shadow-lg);
      font-size: 11px; cursor: pointer;
      animation: dsFabPanelIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .ds-fab__toast-tag { font-size: 10px; font-weight: 700; }
    .ds-fab__toast--info .ds-fab__toast-tag { color: var(--ds-color-tooling-fab-notif-info); }
    .ds-fab__toast--warning .ds-fab__toast-tag { color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-fab__toast--error .ds-fab__toast-tag { color: var(--ds-color-tooling-fab-notif-error); }
    .ds-fab__toast--warning { border-color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-fab__toast--error { border-color: var(--ds-color-tooling-fab-notif-error); }
    .ds-fab__notif--info { color: var(--ds-color-tooling-fab-notif-info); }
    .ds-fab__notif--warning { color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-fab__notif--error { color: var(--ds-color-tooling-fab-notif-error); }
    .ds-fab__notif--success { color: var(--ds-color-tooling-fab-notif-success); }
    .ds-fab__dot {
      display: inline-block; width: 10px; height: 10px; border-radius: 50%;
      margin-right: 4px; flex-shrink: 0; border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-fab__footer {
      padding: 8px 16px; font-size: 10px; color: var(--ds-designmode-inspector-on);
      text-align: center; border-top: 1px solid var(--ds-designmode-inspector-border);
    }
    .ds-fab__banner {
      position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
      z-index: calc(var(--ds-z-fab) + 1); width: min(560px, calc(100vw - 2rem));
    }
  `],
})
export class DsFabComponent implements OnInit {
  /** Design-tool state (designMode, inspector overlays, FAB visibility). */
  protected readonly fabSvc = inject(FabService);
  /** External theme service — the FAB only consumes light/dark from it. */
  protected readonly themeSvc = inject(ThemeService);
  /** Overlay engine — instantiating it HERE boots the inspector lifecycle. */
  protected readonly inspectorSvc = inject(DsInspectorService);
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  @Optional() protected readonly router = inject(Router, { optional: true });
  @Optional() protected readonly dsSvc = inject(DESIGN_SYSTEM_SERVICE, { optional: true });
  @Optional() protected readonly dataSvc = inject(DATA_SOURCE_SERVICE, { optional: true });
  @Optional() protected readonly dataTools = inject(DATA_TOOLS_SERVICE, { optional: true });
  /** Optional i18n seam — shown only when the app provides LANGUAGE_SERVICE. */
  @Optional() protected readonly langSvc = inject(LANGUAGE_SERVICE, { optional: true }) ?? null;
  /** i18n ligero del FAB (diccionario es/en desacoplado de Transloco). */
  protected readonly i18n = inject(FabI18nService);
  protected readonly panelOpen = signal(false);

  /** Posición del panel cuando fue arrastrado (left/top en px). null = posición por defecto. */
  protected readonly panelPos = signal<{ x: number; y: number } | null>(null);
  private dragStart: { x: number; y: number; origX: number; origY: number } | null = null;

  /** Inicia el arrastre desde el header (solo botón izquierdo, no desde el close). */
  protected onDragStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    event.preventDefault();
    const panel = (event.currentTarget as HTMLElement).closest('.ds-fab__panel') as HTMLElement;
    const rect = panel.getBoundingClientRect();
    const pos = this.panelPos() ?? { x: rect.left, y: rect.top };
    this.dragStart = { x: event.clientX, y: event.clientY, origX: pos.x, origY: pos.y };
    this.document.addEventListener('mousemove', this.onDragMove);
    this.document.addEventListener('mouseup', this.onDragEnd);
  }

  private readonly onDragMove = (event: MouseEvent): void => {
    if (!this.dragStart) return;
    this.panelPos.set({
      x: this.dragStart.origX + (event.clientX - this.dragStart.x),
      y: this.dragStart.origY + (event.clientY - this.dragStart.y),
    });
  };

  private readonly onDragEnd = (): void => {
    this.dragStart = null;
    this.document.removeEventListener('mousemove', this.onDragMove);
    this.document.removeEventListener('mouseup', this.onDragEnd);
  };

  /** Contexto actual de la página: layout (data-layout del host), módulo (primer
   *  segmento de ruta) y página (data-page del page canvas activo). */
  protected readonly context = signal<{ layout: string; module: string; page: string }>({ layout: '', module: '', page: '' });

  /** Bloques de contexto colapsables (empieza plegado para ahorrar espacio). */
  protected readonly contextOpen = signal(false);

  /** Tab activo del panel de diseño. */
  protected readonly tab = signal<'layout' | 'notif' | 'ds' | 'colores' | 'superficies' | 'tipografia' | 'efectos' | 'gradientes' | 'sombras' | 'espaciado' | 'breakpoints' | 'brand'>('layout');
  /** Grupos de secciones del dropdown: herramientas, identidad de marca y primitivas. */
  protected readonly tabGroups: { labelKey: string; items: { id: 'layout' | 'notif' | 'ds' | 'colores' | 'superficies' | 'tipografia' | 'efectos' | 'gradientes' | 'sombras' | 'espaciado' | 'breakpoints' | 'brand'; labelKey: string }[] }[] = [
    {
      labelKey: 'fab.group.tools',
      items: [
        { id: 'layout', labelKey: 'fab.layout' },
        { id: 'notif', labelKey: 'fab.tab.notif' },
        { id: 'ds', labelKey: 'fab.tab.dsName' },
      ],
    },
    {
      labelKey: 'fab.group.brand',
      items: [
        { id: 'brand', labelKey: 'fab.tab.brand' },
      ],
    },
    {
      labelKey: 'fab.group.primitives',
      items: [
        { id: 'colores', labelKey: 'fab.tab.colors' },
        { id: 'superficies', labelKey: 'fab.tab.surfaces' },
        { id: 'tipografia', labelKey: 'fab.tab.typography' },
        { id: 'efectos', labelKey: 'fab.tab.effects' },
        { id: 'gradientes', labelKey: 'fab.tab.gradients' },
        { id: 'sombras', labelKey: 'fab.tab.shadows' },
        { id: 'espaciado', labelKey: 'fab.tab.spacing' },
        { id: 'breakpoints', labelKey: 'fab.tab.breakpoints' },
      ],
    },
  ];

  /** Cambia la sección activa desde el dropdown. */
  protected onTabChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value as 'layout' | 'notif' | 'ds' | 'colores' | 'superficies' | 'tipografia' | 'efectos' | 'gradientes' | 'sombras' | 'espaciado' | 'breakpoints' | 'brand';
    this.tab.set(id);
  }

  /** Data Tools modal (opened from the GLOBALS button). */
  protected readonly dataToolsOpen = signal(false);

  /** Open Data Tools: hide the FAB panel, show the modal. */
  protected openDataTools(): void {
    this.panelOpen.set(false);
    this.dataToolsOpen.set(true);
  }

  /** Close Data Tools and return to the FAB panel. */
  protected closeDataTools(): void {
    this.dataToolsOpen.set(false);
    this.panelOpen.set(true);
  }

  constructor() {
    // Recalcular el contexto (layout/módulo/página) al navegar dentro del layout.
    if (this.router) {
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.refreshContext());
    }
  }

  ngOnInit(): void {
    if (!this.themeSvc.themeMode()) {
      this.themeSvc.toggleTheme();
    }
    this.refreshContext();
    this.watchPageCanvas();
  }

  /** El page canvas de la página ruteada es un remote lazy: se monta DESPUÉS del
   *  FAB. Un MutationObserver sobre el contenedor que aloja el router-outlet
   *  refresca el contexto cuando el page canvas aparece/desaparece. */
  private watchPageCanvas(): void {
    const host = this.element.nativeElement.parentElement;
    if (!host || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(() => this.refreshContext());
    mo.observe(host, { childList: true, subtree: true });
    this.destroyRef.onDestroy(() => mo.disconnect());
  }

  /** Lee layout (ancestro [data-layout]), módulo (primer segmento de ruta) y
   *  página ([data-container="page"] → data-page, con fallback a data-name y al
   *  último segmento de ruta). */
  private refreshContext(): void {
    const layout = this.element.nativeElement.closest('[data-layout]')?.getAttribute('data-layout') ?? '';
    const pageEl = this.document.querySelector('[data-container="page"]');
    let page = pageEl?.getAttribute('data-page')?.trim() ?? '';
    if (!page) page = pageEl?.getAttribute('data-name')?.trim() ?? '';
    let module = '';
    let routeLast = '';
    if (this.router) {
      const segs = this.router.url.split('?')[0].split('/').filter(Boolean);
      module = segs[0] ?? '';
      routeLast = segs[segs.length - 1] ?? '';
    }
    if (!page) page = routeLast;
    this.context.set({ layout, module, page });
  }

  protected onHotkeyToggle(event: Event): void {
    event.preventDefault();
    this.fabSvc.toggleFabVisibility?.();
  }

  /** Open/close the design panel. The panel IS the design-mode entry point:
   *  opening it turns design mode ON (fresh inspector), closing it turns it OFF. */
  togglePanel(): void {
    const opening = !this.panelOpen();
    this.panelOpen.set(opening);
    if (opening) this.refreshContext();
    if (this.fabSvc.designMode() !== opening) this.fabSvc.toggleDesignMode();
  }

  setMode(mode: 'light' | 'dark'): void {
    this.themeSvc.themeMode.set(mode);
  }

  /** Select a design-system configuration (the token source is re-applied). */
  protected onDesignSystem(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.dsSvc?.setActive(id);
  }

  protected insp() { return this.fabSvc.inspector(); }

  /** Collapsible FAB inspector sections (LAYOUT, PAGE, globals). Start expanded. */
  protected readonly planeSections = signal<Record<'layout' | 'page' | 'globals', boolean>>({
    layout: true, page: true, globals: true,
  });

  protected planeSectionOpen(section: 'layout' | 'page' | 'globals'): boolean { return this.planeSections()[section]; }
  protected togglePlaneSection(section: 'layout' | 'page' | 'globals'): void {
    this.planeSections.update(s => ({ ...s, [section]: !s[section] }));
  }

  /** Per-plane per-level active state (independent for layout and page). Every
   *  level is a canonical ds-container kind (page 1 … subsection 5) — no special cases. */
  protected planeLevel(plane: PlaneId, level: DsContainerKind): boolean {
    const p = this.insp();
    const planePrefs = plane === 'layout' ? p.layout : p.page;
    return !!planePrefs[LEVEL_KEYS[level]];
  }

  /** Per-plane CONTENT toggle (everything that is NOT a container). */
  protected planeContent(plane: PlaneId): boolean {
    const p = this.insp();
    const planePrefs = plane === 'layout' ? p.layout : p.page;
    return !!planePrefs.showContent;
  }

  /** The five canonical levels as FAB buttons (page 1 … subsection 5). */
  protected readonly levelButtons = LEVEL_BUTTONS;

  /** Level buttons per plane: `display` (10) is LAYOUT-ONLY (the layout root
   *  wrapping the router-outlet) and `page` (20) is PAGE-ONLY (the routed page
   *  canvas). So the layout section offers display → content and the page
   *  section offers page → content. */
  protected levelButtonsFor(plane: PlaneId): readonly LevelButton[] {
    if (plane === 'page') {
      return LEVEL_BUTTONS.filter((btn) => btn.kind !== 'display');
    }
    return LEVEL_BUTTONS.filter((btn) => btn.kind !== 'page');
  }
}