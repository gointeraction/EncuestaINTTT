import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { DATA_TOOLS_SERVICE, ThemeService, type DataManifest, type DataPair, type DataVerifyResult } from '../../design/system';
import { FabI18nService } from '../services/fab-i18n.service';

type DataToolsTab = 'info' | 'models' | 'endpoints' | 'memory' | 'flow' | 'verify';

/**
 * ds-data-tools-modal — the Data Tools WINDOW (too big for the FAB panel). It reads
 * the DATA_TOOLS_SERVICE and shows, per registered page manifest, tabs:
 * MODELS (mock vs api), ENDPOINTS, WORKING MEMORY (initial load vs working data),
 * the data FLOW, and the mock⇄api VERIFIER. Dev-only: created while the page is
 * built; once certified it (and the mock) lose value and never ship to production.
 */
@Component({
  selector: 'ds-data-tools-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dtd__backdrop" (click)="closed.emit()"></div>
    <div class="dtd__window" role="dialog" aria-modal="true" [attr.aria-label]="i18n.t('dataTools.title')">
      <header class="dtd__head">
        <span class="dtd__title">{{ i18n.t('dataTools.title') }}</span>
        <span class="dtd__page-tag">{{ i18n.t('dataTools.page') }}</span>
        @if (manifests().length > 1) {
          <select class="dtd__select" [value]="manifest().id" (change)="onSelect($event)">
            @for (m of manifests(); track m.id) { <option [value]="m.id">{{ m.label }}</option> }
          </select>
        } @else if (manifest(); as m) {
          <span class="dtd__page">
            @if (m.module) { <span class="dtd__module">{{ m.module }}</span><span class="dtd__sep">/</span> }
            {{ m.label }}
            <span class="dtd__page-id">{{ m.id }}</span>
          </span>
        }
        <button class="dtd__close" (click)="closed.emit()" [attr.aria-label]="i18n.t('dataTools.close')">✕</button>
      </header>

      <nav class="dtd__tabs">
        <button [class.active]="tab() === 'info'" (click)="tab.set('info')">{{ i18n.t('dataTools.tabInfo') }}</button>
        <button [class.active]="tab() === 'models'" (click)="tab.set('models')">{{ i18n.t('dataTools.tabModels') }}</button>
        <button [class.active]="tab() === 'endpoints'" (click)="tab.set('endpoints')">{{ i18n.t('dataTools.tabEndpoints') }}</button>
        <button [class.active]="tab() === 'memory'" (click)="tab.set('memory')">{{ i18n.t('dataTools.tabMemory') }}</button>
        <button [class.active]="tab() === 'flow'" (click)="tab.set('flow')">{{ i18n.t('dataTools.tabFlow') }}</button>
        <button [class.active]="tab() === 'verify'" (click)="tab.set('verify')">{{ i18n.t('dataTools.tabVerify') }}</button>
      </nav>

      <div class="dtd__body">
        @if (tab() === 'verify') {
          @if (pairs().length === 0) { <p class="dtd__muted">{{ i18n.t('dataTools.noPairs') }}</p> }
          @for (pair of pairs(); track pair.id) {
            <div class="dtd__card">
              <div class="dtd__card-head">
                <strong>{{ pair.label }}</strong>
                <button class="dtd__btn" (click)="runVerify(pair)">{{ i18n.t('dataTools.run') }}</button>
              </div>
              @if (verifyResults()[pair.id]; as r) {
                <div class="dtd__verify dtd__verify--{{ r.status }}">
                  <strong>{{ r.status }}</strong>
                  @if (r.missingInMock.length) { <div>{{ i18n.t('dataTools.missingMock') }}: {{ r.missingInMock.join(', ') }}</div> }
                  @if (r.missingInApi.length) { <div>{{ i18n.t('dataTools.missingApi') }}: {{ r.missingInApi.join(', ') }}</div> }
                  @if (r.message) { <div>{{ r.message }}</div> }
                </div>
              }
            </div>
          }
        } @else if (manifest(); as m) {
          @switch (tab()) {
            @case ('info') {
              <div class="dtd__card">
                <div class="dtd__row"><span>{{ i18n.t('dataTools.module') }}</span><strong>{{ m.module ?? '—' }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.name') }}</span><strong>{{ m.label }} <span class="dtd__page-id">{{ m.id }}</span></strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.route') }}</span><strong>{{ m.route ?? '—' }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.layout') }}</span><strong>{{ m.layout ?? '—' }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.maturity') }}</span><strong>{{ m.maturity ?? '—' }}</strong></div>
              </div>
              <div class="dtd__card">
                <div class="dtd__card-head"><strong>{{ i18n.t('dataTools.sections') }}</strong><span class="dtd__badge">{{ m.sections?.length ?? 0 }}</span></div>
                <div class="dtd__fields">{{ m.sections?.length ? m.sections.join(' · ') : i18n.t('dataTools.none') }}</div>
              </div>
              <div class="dtd__card">
                <div class="dtd__card-head"><strong>{{ i18n.t('dataTools.integrators') }}</strong><span class="dtd__badge">{{ m.integrators?.length ?? 0 }}</span></div>
                <div class="dtd__fields">{{ m.integrators?.length ? m.integrators.join(' · ') : i18n.t('dataTools.nonePlural') }}</div>
              </div>
              <div class="dtd__card">
                <div class="dtd__row"><span>Mock</span><strong>{{ hasMock(m) ? '✓' : '—' }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.real') }}</span><strong>{{ m.endpoints.length ? '✓' : '—' }}</strong></div>
              </div>
            }
            @case ('models') {
              @for (model of m.models; track model.name) {
                <div class="dtd__card">
                  <div class="dtd__card-head"><strong>{{ model.name }}</strong><span class="dtd__badge dtd__badge--{{ model.source }}">{{ model.source }}</span></div>
                  <div class="dtd__fields">{{ model.fields.join(' · ') }}</div>
                </div>
              } @empty { <p class="dtd__muted">{{ i18n.t('dataTools.noModels') }}</p> }
            }
            @case ('endpoints') {
              @for (e of m.endpoints; track e.path) {
                <div class="dtd__card">
                  <div class="dtd__card-head"><strong>{{ e.method }} {{ e.path }}</strong><span class="dtd__badge">{{ e.service }}</span></div>
                  <div class="dtd__muted">{{ e.purpose }}</div>
                </div>
              } @empty { <p class="dtd__muted">{{ i18n.t('dataTools.noEndpoints') }}</p> }
            }
            @case ('memory') {
              <div class="dtd__card">
                <div class="dtd__row"><span>{{ i18n.t('dataTools.initialLoad') }}</span><strong>{{ m.workingMemory.initialLoad }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.workingData') }}</span><strong>{{ m.workingMemory.workingData }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.separated') }}</span><strong>{{ m.workingMemory.separated ? '✓' : '—' }}</strong></div>
                <div class="dtd__row"><span>{{ i18n.t('dataTools.interactive') }}</span><strong>{{ m.workingMemory.interactive ? '✓' : '—' }}</strong></div>
                @if (m.workingMemory.notes) { <div class="dtd__muted">{{ m.workingMemory.notes }}</div> }
              </div>
            }
            @case ('flow') {
              <div class="dtd__flow">
                @for (s of m.flow; track $index) {
                  <div class="dtd__flow-step">
                    <span class="dtd__node">{{ s.from }}</span>
                    <span class="dtd__arrow">→</span>
                    <span class="dtd__node">{{ s.to }}</span>
                    @if (s.label) { <span class="dtd__muted">{{ s.label }}</span> }
                  </div>
                } @empty { <p class="dtd__muted">Sin flujo.</p> }
              </div>
            }
          }
        } @else {
          <p class="dtd__muted">Sin manifestación de datos.</p>
        }
      </div>
    </div>
  `,
  styles: `
    .dtd__backdrop { position: fixed; inset: 0; z-index: calc(var(--ds-z-fab) + 1); background: color-mix(in oklab, var(--ds-color-black) 50%, transparent); }
    .dtd__window {
      position: fixed; inset: 6vh 6vw; z-index: calc(var(--ds-z-fab) + 2);
      display: flex; flex-direction: column;
      background: var(--ds-designmode-inspector-bg); color: var(--ds-designmode-inspector-on);
      border: 1px solid var(--ds-designmode-inspector-border); border-radius: var(--ds-designmode-inspector-radius);
      box-shadow: var(--ds-shadow-lg); overflow: hidden;
    }
    .dtd__head { display: flex; align-items: center; gap: 8px; padding: 14px 18px; border-bottom: 1px solid var(--ds-designmode-inspector-border); }
    .dtd__title { font-size: 14px; font-weight: 700; }
    .dtd__page-tag { margin-left: auto; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6; }
    .dtd__page { font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
    .dtd__module { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 6px; border-radius: 6px; background: var(--ds-designmode-control-border); }
    .dtd__sep { opacity: 0.5; }
    .dtd__page-id { font: 10px/1 monospace; opacity: 0.6; }
    .dtd__select { font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--ds-designmode-control-border); background: var(--ds-designmode-control-bg); color: inherit; }
    .dtd__close { margin-left: 4px; background: none; border: none; color: inherit; font-size: 14px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
    .dtd__close:hover { background: var(--ds-designmode-control-bg); }
    .dtd__tabs { display: flex; gap: 6px; padding: 10px 18px 0; }
    .dtd__tabs button { padding: 6px 12px; border: none; border-radius: 8px 8px 0 0; background: var(--ds-designmode-control-bg); color: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
    .dtd__tabs button.active { background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on); }
    .dtd__body { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
    .dtd__card { background: var(--ds-designmode-control-bg); border: 1px solid var(--ds-designmode-control-border); border-radius: 10px; padding: 10px 12px; }
    .dtd__card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
    .dtd__badge { font: 10px/1 monospace; padding: 3px 6px; border-radius: 9999px; background: var(--ds-designmode-control-border); }
    .dtd__badge--both { background: var(--ds-color-state-success-200); }
    .dtd__fields { font: 11px/1.5 monospace; }
    .dtd__muted { font-size: 11px; opacity: 0.7; }
    .dtd__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; padding: 3px 0; }
    .dtd__flow { display: flex; flex-direction: column; gap: 8px; }
    .dtd__flow-step { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .dtd__node { font: 11px/1 monospace; padding: 4px 8px; border-radius: 6px; background: var(--ds-designmode-control-border); }
    .dtd__arrow { color: var(--ds-designmode-muted); }
    .dtd__btn { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--ds-designmode-control-border); background: var(--ds-designmode-control-bg); color: inherit; cursor: pointer; }
    .dtd__verify { margin-top: 6px; font: 10px/1.5 monospace; }
    .dtd__verify--pass { color: var(--ds-color-state-success); }
    .dtd__verify--fail { color: var(--ds-color-state-danger); }
    .dtd__verify--error { color: var(--ds-color-state-warning); }
  `,
})
export class DsDataToolsModalComponent {
  private readonly dataTools = inject(DATA_TOOLS_SERVICE, { optional: true });
  private readonly themeSvc = inject(ThemeService);
  protected readonly i18n = inject(FabI18nService);

  readonly closed = output<void>();

  protected readonly tab = signal<DataToolsTab>('info');
  protected readonly manifests = computed(() => this.dataTools?.manifests() ?? []);
  protected readonly pairs = computed(() => this.dataTools?.pairs() ?? []);
  protected readonly selectedId = signal<string | null>(null);

  /** The page currently rendered — declared by the routed page via
   *  `ThemeService.pageMetadata` (id + route). This is HOW Data Tools knows which
   *  page it is analysing: no guessing, the page announces itself. */
  protected readonly currentPageId = computed(() => (this.themeSvc.pageMetadata() as { page?: string } | null)?.page ?? null);
  protected readonly currentPageRoute = computed(() => (this.themeSvc.pageMetadata() as { route?: string } | null)?.route ?? null);

  protected readonly manifest = computed(() => {
    const list = this.manifests();
    const id = this.selectedId() ?? this.currentPageId();
    return list.find((m) => m.id === id) ?? list[0] ?? null;
  });

  protected readonly verifyResults = signal<Record<string, DataVerifyResult>>({});

  /** True if the page carries mock data (a model with source mock|both). */
  protected hasMock(m: DataManifest): boolean {
    return m.models.some((model) => model.source === 'mock' || model.source === 'both');
  }

  protected onSelect(event: Event): void {
    this.selectedId.set((event.target as HTMLSelectElement).value);
  }

  protected async runVerify(pair: DataPair): Promise<void> {
    if (!this.dataTools) return;
    this.verifyResults.update((r) => ({
      ...r,
      [pair.id]: { id: pair.id, status: 'running', mockKeys: [], apiKeys: [], missingInMock: [], missingInApi: [] },
    }));
    const res = await this.dataTools.verify(pair.id);
    this.verifyResults.update((r) => ({ ...r, [pair.id]: res }));
  }
}