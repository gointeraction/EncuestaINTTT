import { Component, inject, signal } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
  NumPipe,
} from '@cifraflow/design';
import { DEVICES_STATE, type DevicesStateContract } from './business/contracts/devices.state.contract';
import { DevicesStateService } from './business/state/devices.state.service';
import type { AdminDevice } from './business/models/devices.model';

/**
 * @akuri-page
 * page: devices
 * route: /admin/devices
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [NumPipe, DsButtonComponent, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent],
  providers: [DevicesStateService, { provide: DEVICES_STATE, useExisting: DevicesStateService }],
  template: `
    <ds-container kind="page" name="devices">
      <ds-container kind="area" name="header" class="pg" style="padding-block: var(--ds-space-2)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Dispositivos" subtitle="Kioscos y encuestadores · administración · INTT" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <ds-button size="sm" [loading]="state.loading()" (click)="state.load()">Actualizar</ds-button>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="pg" style="padding-block: var(--ds-space-4)">
        @if (state.error(); as e) { <p class="dv__err" role="alert">{{ e }}</p> }

        @if (state.secret(); as s) {
          <ds-container kind="section" name="secreto" class="dv__secret">
            <b>Clave generada (guárdala: no se vuelve a mostrar)</b>
            <p>Dispositivo: <code>{{ s.id }}</code></p>
            <p>Clave: <code>{{ s.secret }}</code></p>
            <p>Enrolamiento (en la captura): <code>/?device={{ s.id }}&amp;key={{ s.secret }}&amp;channel={{ channel() }}</code></p>
            <ds-button size="sm" (click)="state.clearSecret()">Cerrar</ds-button>
          </ds-container>
        }

        <ds-container kind="section" name="nuevo" class="dv">
          <h3 class="dv__h">Agregar dispositivo</h3>
          <div class="dv__form">
            <label class="dv__field">Nombre
              <input type="text" placeholder="p.ej. Kiosco Plaza Bolívar" [value]="name()" (input)="name.set($any($event.target).value)" />
            </label>
            <label class="dv__field">Canal
              <select [value]="channel()" (change)="channel.set($any($event.target).value)">
                <option value="kiosk">Kiosco</option>
                <option value="surveyor">Encuestador</option>
              </select>
            </label>
            <label class="dv__field">Cuota / día
              <input type="number" min="1" [value]="quota()" (input)="quota.set(+$any($event.target).value)" />
            </label>
            <ds-button [disabled]="!name().trim()" (click)="create()">Agregar</ds-button>
          </div>
        </ds-container>

        <ds-container kind="section" name="lista" class="dv">
          <h3 class="dv__h">Dispositivos registrados ({{ state.devices().length | num }})</h3>
          <table class="dv__table">
            <thead>
              <tr><th>Id</th><th>Nombre</th><th>Canal</th><th>Cuota/día</th><th>Activo</th><th>Cuestionarios</th><th>Hoy</th><th></th></tr>
            </thead>
            <tbody>
              @for (d of state.devices(); track d.id) {
                <tr>
                  <td><code>{{ d.id }}</code></td>
                  <td>{{ d.name }}</td>
                  <td>{{ channelLabel(d.channel) }}</td>
                  <td>
                    <input class="dv__q" type="number" min="1" [value]="d.dailyQuota"
                      (change)="state.setQuota(d.id, +$any($event.target).value)" />
                  </td>
                  <td>{{ d.active ? 'Sí' : 'No' }}</td>
                  <td>{{ d.total | num }}</td>
                  <td>{{ d.today | num }}</td>
                  <td class="dv__actions">
                    @if (d.active) {
                      <ds-button size="sm" variant="warning" (click)="state.setActive(d.id, false)">Desactivar</ds-button>
                    } @else {
                      <ds-button size="sm" variant="success" (click)="state.setActive(d.id, true)">Activar</ds-button>
                    }
                    <ds-button size="sm" variant="secondary" (click)="state.regenerate(d.id)">Regenerar clave</ds-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .dv { max-width: 1100px; display: flex; flex-direction: column; gap: var(--ds-space-3); margin-top: var(--ds-space-5); }
    .dv:first-child { margin-top: 0; }
    .dv__h { margin: 0; font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .dv__form { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--ds-space-4); }
    .dv__field { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .dv__field input, .dv__field select { padding: 0.5rem 0.75rem; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-bg-field); color: var(--ds-surface-body-on); font-family: inherit; }
    .dv__secret { margin-bottom: var(--ds-space-4); padding: var(--ds-space-4); border: 1px solid var(--ds-color-state-warning); border-radius: var(--ds-radius-lg); background: var(--ds-surface-card); color: var(--ds-surface-card-on); }
    .dv__secret p { margin: var(--ds-space-1) 0; font-size: var(--ds-text-small); }
    .dv__secret code { font-family: ui-monospace, monospace; word-break: break-all; }
    .dv__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .dv__table th, .dv__table td { text-align: left; padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-subtle); }
    .dv__table th { color: var(--ds-text-muted); font-weight: 600; }
    .dv__q { width: 6rem; padding: 0.25rem 0.5rem; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-sm); font-family: inherit; }
    .dv__actions { display: flex; gap: var(--ds-space-2); }
    .dv__err { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
  `,
})
export class DevicesPage {
  readonly state: DevicesStateContract = inject(DEVICES_STATE);

  readonly name = signal('');
  readonly channel = signal<'kiosk' | 'surveyor'>('kiosk');
  readonly quota = signal(500);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'devices',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Dispositivos · INTT' },
    });
    void this.state.load();
  }

  channelLabel(id: string): string {
    return id === 'kiosk' ? 'Kiosco' : id === 'surveyor' ? 'Encuestador' : id;
  }

  create(): void {
    void this.state.create(this.name().trim(), this.channel(), this.quota());
    this.name.set('');
  }
}
