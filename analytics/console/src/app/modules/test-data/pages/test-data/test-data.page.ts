import { Component, inject, signal } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { TEST_DATA_STATE, type TestDataStateContract } from './business/contracts/test-data.state.contract';
import { TestDataStateService } from './business/state/test-data.state.service';

const PROFILES = ['small', 'medium', 'large', 'xl'] as const;

/**
 * @akuri-page
 * page: test-data
 * route: /test-data
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-test-data-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [TestDataStateService, { provide: TEST_DATA_STATE, useExisting: TestDataStateService }],
  template: `
    <ds-container kind="page" name="test-data" class="page-max">
      <ds-container kind="area" name="header" style="padding: var(--ds-space-2) var(--ds-space-4)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Gestión de datos de prueba"
                subtitle="Seeder · solo development"
                [showBack]="false"
              />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <ds-button size="sm" variant="secondary" [loading]="state.busy()" (click)="refresh()">
                Refrescar
              </ds-button>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <!-- ESTADO -->
        <ds-container kind="section" name="estado" class="td">
          @if (state.status(); as s) {
            <p class="td__meta">Entorno <b>{{ s.environment }}</b> · base <b>{{ s.database }}</b>
              @if (s.elapsedMs != null) { · última operación <b>{{ s.elapsedMs }} ms</b> }
            </p>
            <ul class="td__counts">
              <li>Encuestas <b>{{ s.counts.encuestas }}</b></li>
              <li>Participantes (sorteo) <b>{{ s.counts.participantes }}</b></li>
              <li>Dispositivos <b>{{ s.counts.dispositivos }}</b></li>
            </ul>
          }
          <div class="td__actions">
            <ds-button variant="secondary" [loading]="state.busy()" (click)="summarize()">Sumarizar</ds-button>
            <ds-button variant="destructive" [loading]="state.busy()" (click)="reset()">Borrar todo</ds-button>
          </div>
          @if (state.error(); as e) { <p role="alert" class="td__error">{{ e }}</p> }
        </ds-container>

        <!-- DATASETS POR VOLUMEN -->
        <ds-container kind="section" name="datasets" class="td">
          <h3 class="td__h">Datasets por volumen · responsividad</h3>
          <p class="td__meta">
            CSV de <b>10K · 100K · 500K · 1M</b> filas (generados a demanda; el de 1M pesa ~1 GB).
            «Cargar» los copia a la base y sumariza; mide el tiempo (responsividad).
          </p>
          <div class="td__actions">
            <ds-button [loading]="state.busy()" (click)="generateDatasets()">Generar 10K/100K/500K/1M</ds-button>
            @if (state.datasets().length) {
              <ds-button variant="destructive" [loading]="state.busy()" (click)="deleteAllDatasets()">
                Eliminar todos
              </ds-button>
            }
          </div>

          @if (state.datasets().length) {
            <table class="td__table">
              <thead><tr><th>Archivo</th><th>Filas</th><th>Tamaño</th><th>Modificado</th><th></th></tr></thead>
              <tbody>
                @for (d of state.datasets(); track d.name) {
                  <tr>
                    <td>{{ d.name }}</td>
                    <td>{{ d.rows }}</td>
                    <td>{{ fmtBytes(d.bytes) }}</td>
                    <td>{{ fmtDate(d.modifiedAt) }}</td>
                    <td class="td__row-actions">
                      <ds-button size="sm" [loading]="state.busy()" (click)="loadDataset(d.name)">Cargar</ds-button>
                      <ds-button size="sm" variant="danger" [loading]="state.busy()" (click)="deleteDataset(d.name)">Eliminar</ds-button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="td__meta">No hay datasets. Genera uno para medir responsividad.</p>
          }
        </ds-container>

        <!-- FIXTURES POR TIPO -->
        <ds-container kind="section" name="fixtures" class="td">
          <h3 class="td__h">Fixtures por tipo de conductor · realistas</h3>
          <p class="td__meta">
            {{ state.fixtures().length }} archivo(s) · <b>{{ state.fixtureTotal() }}</b> encuestas.
            «Cargar CSV» los copia a <code>legacy_survey_responses</code> + <code>capture_devices</code>.
          </p>
          <div class="td__actions">
            <ds-button variant="secondary" [loading]="state.busy()" (click)="makeFixtures()">Generar CSV (31–88/tipo)</ds-button>
            <ds-button variant="secondary" [loading]="state.busy()" (click)="loadFixtures()">Cargar CSV</ds-button>
            @if (state.fixtures().length) {
              <ds-button variant="destructive" [loading]="state.busy()" (click)="deleteAllFixtures()">Eliminar todos</ds-button>
            }
          </div>

          @if (state.fixtures().length) {
            <table class="td__table">
              <thead><tr><th>Archivo</th><th>Filas</th><th>Tamaño</th><th>Modificado</th><th></th></tr></thead>
              <tbody>
                @for (f of state.fixtures(); track f.name) {
                  <tr>
                    <td>{{ f.name }}</td>
                    <td>{{ f.rows }}</td>
                    <td>{{ fmtBytes(f.bytes) }}</td>
                    <td>{{ fmtDate(f.modifiedAt) }}</td>
                    <td class="td__row-actions">
                      <ds-button size="sm" variant="danger" [loading]="state.busy()" (click)="deleteFixture(f.name)">Eliminar</ds-button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="td__meta">No hay fixtures. Usa «Generar CSV» para crearlos.</p>
          }
        </ds-container>

        <!-- GENERACIÓN SINTÉTICA -->
        <ds-container kind="section" name="sintetico" class="td">
          <h3 class="td__h">Generación sintética (N)</h3>
          <div class="td__grid">
            <label class="td__field">Perfil
              <select [value]="profile()" (change)="profile.set($any($event.target).value)">
                @for (p of profiles; track p) { <option [value]="p">{{ p }}</option> }
              </select>
            </label>
            <label class="td__field">Encuestas a generar (Visión Cero)
              <input type="number" min="0" [value]="responses()" (input)="responses.set(num($any($event.target).value))" />
            </label>
          </div>
          <div class="td__actions">
            <ds-button [loading]="state.busy()" (click)="generateSynthetic()">Generar y cargar</ds-button>
          </div>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .td { max-width: 1000px; display: flex; flex-direction: column; gap: var(--ds-space-3); margin-top: var(--ds-space-5); }
    .td:first-child { margin-top: 0; }
    .td__h { margin: 0; font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .td__meta { margin: 0; font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .td__meta code { font-family: ui-monospace, monospace; font-size: 0.9em; }
    .td__counts { display: flex; flex-wrap: wrap; gap: var(--ds-space-5); list-style: none; margin: 0; padding: 0; }
    .td__counts b { color: var(--ds-color-brand-primary); font-size: var(--ds-text-large); }
    .td__actions { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
    .td__grid { display: grid; gap: var(--ds-space-4); grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .td__field { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); }
    .td__field input, .td__field select {
      padding: var(--ds-space-2); border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-md); font-size: var(--ds-text-input);
    }
    .td__error { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
    .td__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .td__table th, .td__table td { text-align: left; padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-subtle); }
    .td__table th { color: var(--ds-text-muted); font-weight: 600; }
    .td__row-actions { display: flex; gap: var(--ds-space-2); }
  `,
})
export class TestDataPage {
  readonly state: TestDataStateContract = inject(TEST_DATA_STATE);
  protected readonly profiles = PROFILES;

  readonly profile = signal<string>('small');
  readonly responses = signal(9000);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'test-data',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Datos de prueba · INTT' },
    });
    void this.state.refresh();
  }

  num(v: string): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  fmtBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  fmtDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }

  refresh(): void {
    void this.state.refresh();
  }
  summarize(): void {
    void this.state.summarize();
  }
  reset(): void {
    void this.state.reset();
  }
  generateSynthetic(): void {
    void this.state.load({ profile: this.profile(), responses: this.responses() });
  }

  generateDatasets(): void {
    void this.state.generateDatasets();
  }
  loadDataset(name: string): void {
    void this.state.loadDataset(name);
  }
  deleteDataset(name: string): void {
    void this.state.deleteDatasets(name);
  }
  deleteAllDatasets(): void {
    void this.state.deleteDatasets();
  }

  makeFixtures(): void {
    void this.state.generateFixtures();
  }
  loadFixtures(): void {
    void this.state.loadFixtures();
  }
  deleteFixture(name: string): void {
    void this.state.deleteFixtures(name);
  }
  deleteAllFixtures(): void {
    void this.state.deleteFixtures();
  }
}
