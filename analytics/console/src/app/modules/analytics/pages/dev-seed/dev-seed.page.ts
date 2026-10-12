import { Component, inject, signal } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { DEV_SEED_STATE, type DevSeedStateContract } from './business/contracts/dev-seed.state.contract';
import { DevSeedStateService } from './business/state/dev-seed.state.service';

const PROFILES = ['small', 'medium', 'large', 'xl'] as const;

/**
 * @akuri-page
 * page: dev-seed
 * route: /seed
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-dev-seed-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [DevSeedStateService, { provide: DEV_SEED_STATE, useExisting: DevSeedStateService }],
  template: `
    <ds-container kind="page" name="dev-seed" class="page-max">
      <ds-container
        kind="area"
        name="header"
        style="padding: var(--ds-space-2) var(--ds-space-4)"
      >
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Datos de prueba" subtitle="Seeder · solo desarrollo" [showBack]="false" />
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
        <ds-container kind="section" name="controls" class="seed">
          <div class="seed__grid">
            <label class="seed__field">Perfil
              <select [value]="profile()" (change)="setProfile($any($event.target).value)">
                @for (p of profiles; track p) { <option [value]="p">{{ p }}</option> }
              </select>
            </label>
            <label class="seed__field">Cuestionarios (Visión Cero)
              <input type="number" min="0" [value]="responses()" (input)="responses.set(num($any($event.target).value))" />
            </label>
          </div>

          <div class="seed__actions">
            <ds-button [loading]="state.busy()" (click)="load()">Cargar (y sumarizar)</ds-button>
            <ds-button variant="secondary" [loading]="state.busy()" (click)="summarize()">Sumarizar</ds-button>
            <ds-button variant="secondary" [loading]="state.busy()" (click)="makeFixtures()">Generar CSV (31–88/tipo)</ds-button>
            <ds-button variant="secondary" [loading]="state.busy()" (click)="loadFixtures()">Cargar CSV</ds-button>
            <ds-button variant="destructive" [loading]="state.busy()" (click)="reset()">Borrar todo</ds-button>
          </div>

          @if (state.error(); as e) { <p role="alert" class="seed__error">{{ e }}</p> }

          @if (state.status(); as s) {
            <p class="seed__meta">
              Entorno <b>{{ s.environment }}</b> · base <b>{{ s.database }}</b>
            </p>
            <ul class="seed__counts">
              <li>Encuestas <b>{{ s.counts.encuestas }}</b></li>
              <li>Participantes (sorteo) <b>{{ s.counts.participantes }}</b></li>
              <li>Dispositivos <b>{{ s.counts.dispositivos }}</b></li>
            </ul>
          }
        </ds-container>

        <ds-container kind="section" name="fixtures" style="margin-top: var(--ds-space-6)">
          <h3 class="seed__h">Fixtures · CSV en <code>data/fixtures</code></h3>
          <p class="seed__meta">
            {{ state.fixtures().length }} archivo(s) · <b>{{ state.fixtureTotal() }}</b> encuestas en total.
            Son la fuente que carga «Cargar CSV» (→ <code>legacy_survey_responses</code> + <code>capture_devices</code>).
          </p>

          @if (state.fixtures().length) {
            <table class="seed__table">
              <thead>
                <tr><th>Archivo</th><th>Filas</th><th>Tamaño</th><th>Modificado</th><th></th></tr>
              </thead>
              <tbody>
                @for (f of state.fixtures(); track f.name) {
                  <tr>
                    <td>{{ f.name }}</td>
                    <td>{{ f.rows }}</td>
                    <td>{{ fmtBytes(f.bytes) }}</td>
                    <td>{{ fmtDate(f.modifiedAt) }}</td>
                    <td class="seed__row-actions">
                      <ds-button size="sm" variant="danger" [loading]="state.busy()" (click)="deleteFixture(f.name)">
                        Eliminar
                      </ds-button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            <div class="seed__actions" style="margin-top: var(--ds-space-3)">
              <ds-button variant="destructive" [loading]="state.busy()" (click)="deleteAllFixtures()">
                Eliminar todos los CSV
              </ds-button>
              <ds-button variant="secondary" [loading]="state.busy()" (click)="loadFixtures()">
                Cargar CSV a la base
              </ds-button>
            </div>
          } @else {
            <p class="seed__meta">No hay fixtures. Usa «Generar CSV» para crearlos.</p>
          }
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .seed { max-width: 900px; display: flex; flex-direction: column; gap: var(--ds-space-5); }
    .seed__grid { display: grid; gap: var(--ds-space-4); grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .seed__field { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); }
    .seed__field input, .seed__field select {
      padding: var(--ds-space-2); border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-md); font-size: var(--ds-text-input);
    }
    .seed__actions { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
    .seed__error { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
    .seed__meta { margin: 0; font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .seed__counts { display: flex; flex-wrap: wrap; gap: var(--ds-space-5); list-style: none; margin: 0; padding: 0; }
    .seed__counts b { color: var(--ds-color-brand-primary); font-size: var(--ds-text-large); }
    .seed__h { margin: 0 0 var(--ds-space-2); font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .seed__h code, .seed__meta code { font-family: ui-monospace, monospace; font-size: 0.9em; }
    .seed__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .seed__table th, .seed__table td { text-align: left; padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-subtle); }
    .seed__table th { color: var(--ds-text-muted); font-weight: 600; }
    .seed__row-actions { display: flex; gap: var(--ds-space-2); }
  `,
})
export class DevSeedPage {
  readonly state: DevSeedStateContract = inject(DEV_SEED_STATE);
  protected readonly profiles = PROFILES;

  readonly profile = signal<string>('small');
  readonly responses = signal(9000);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'dev-seed',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Datos de prueba · INTT' },
    });
    void this.state.refresh();
  }

  protected num(v: string): number {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  setProfile(p: string): void {
    this.profile.set(p);
  }

  load(): void {
    void this.state.load({
      profile: this.profile(),
      responses: this.responses(),
    });
  }

  summarize(): void {
    void this.state.summarize();
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

  fmtBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  fmtDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }

  reset(): void {
    void this.state.reset();
  }

  refresh(): void {
    void this.state.refresh();
  }
}
