import { Component, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { ADMIN_USERS_STATE, type AdminUsersStateContract } from './business/contracts/admin-users.state.contract';
import { AdminUsersStateService } from './business/state/admin-users.state.service';

/**
 * @akuri-page
 * page: usuarios
 * route: /usuarios
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [AdminUsersStateService, { provide: ADMIN_USERS_STATE, useExisting: AdminUsersStateService }],
  template: `
    <ds-container kind="page" name="usuarios">
      <ds-container kind="area" name="header" style="padding: var(--ds-space-2) var(--ds-space-4)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Usuarios y solicitudes"
                subtitle="Administración de accesos · INTT"
                [showBack]="false"
              />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <ds-button size="sm" [loading]="state.loading()" (click)="reload()">Actualizar</ds-button>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" style="padding: var(--ds-space-4)">
        <ds-container kind="section" name="registro-requests">
          <h3 class="adm__title">Solicitudes de registro</h3>
          @if (registroPending().length) {
            <table class="adm__table">
              <thead><tr><th>Correo</th><th>Nombre</th><th>Creado</th><th></th></tr></thead>
              <tbody>
                @for (u of registroPending(); track u.id) {
                  <tr>
                    <td>{{ u.email }}</td>
                    <td>{{ u.name }}</td>
                    <td>{{ u.createdAt }}</td>
                    <td class="adm__actions">
                      <ds-button size="sm" variant="success" (click)="approveRegistro(u.id)">Autorizar</ds-button>
                      <ds-button size="sm" variant="danger" (click)="rejectRegistro(u.id)">Rechazar</ds-button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="adm__empty">Sin solicitudes de registro.</p>
          }
        </ds-container>

        <ds-container kind="section" name="password-requests" style="margin-top: var(--ds-space-6)">
          <h3 class="adm__title">Solicitudes de cambio de contraseña</h3>
          @if (requestsPending().length) {
            <table class="adm__table">
              <thead><tr><th>Correo</th><th>Creado</th><th></th></tr></thead>
              <tbody>
                @for (r of requestsPending(); track r.id) {
                  <tr>
                    <td>{{ r.email }}</td>
                    <td>{{ r.createdAt }}</td>
                    <td class="adm__actions">
                      <ds-button size="sm" variant="success" (click)="approveRequest(r.id)">Autorizar</ds-button>
                      <ds-button size="sm" variant="danger" (click)="rejectRequest(r.id)">Rechazar</ds-button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="adm__empty">Sin solicitudes de cambio de contraseña.</p>
          }
        </ds-container>

        <ds-container kind="section" name="users" style="margin-top: var(--ds-space-6)">
          <h3 class="adm__title">Usuarios</h3>
          <table class="adm__table">
            <thead><tr><th>Correo</th><th>Nombre</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              @for (u of state.users(); track u.id) {
                <tr>
                  <td>{{ u.email }}</td>
                  <td>{{ u.name }}</td>
                  <td>
                    <select class="adm__select" [value]="u.role" (change)="changeRole(u.id, $any($event.target).value)">
                      <option value="analista">analista</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td><span class="adm__status adm__status--{{ u.status }}">{{ u.status }}</span></td>
                  <td class="adm__actions">
                    @if (u.status === 'blocked') {
                      <ds-button size="sm" variant="success" (click)="unblock(u.id)">Desbloquear</ds-button>
                    } @else {
                      <ds-button size="sm" variant="warning" (click)="block(u.id)">Bloquear</ds-button>
                    }
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
    .adm__title { margin: 0 0 var(--ds-space-3); font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .adm__empty { color: var(--ds-text-muted); font-size: var(--ds-text-small); }
    .adm__table { width: 100%; border-collapse: collapse; font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .adm__table th, .adm__table td { text-align: left; padding: var(--ds-space-2) var(--ds-space-3); border-bottom: 1px solid var(--ds-border-subtle); }
    .adm__table th { color: var(--ds-text-muted); font-weight: 600; }
    .adm__actions { display: flex; gap: var(--ds-space-2); }
    .adm__select {
      border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-sm);
      padding: 4px 8px;
      background: var(--ds-surface-card);
      color: var(--ds-surface-card-on);
      font-family: inherit;
      font-size: var(--ds-text-small);
    }
    .adm__status { text-transform: capitalize; font-weight: 600; }
    .adm__status--active { color: var(--ds-color-state-success); }
    .adm__status--pending { color: var(--ds-color-state-warning); }
    .adm__status--blocked { color: var(--ds-color-state-danger); }
    .adm__status--rejected { color: var(--ds-color-state-danger); }
  `,
})
export class UsuariosPage {
  readonly state: AdminUsersStateContract = inject(ADMIN_USERS_STATE);

  readonly registroPending = () => this.state.users().filter((u) => u.status === 'pending');
  readonly requestsPending = () => this.state.requests().filter((r) => r.status === 'pending');

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'usuarios',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Usuarios · INTT' },
    });
    void this.state.load();
  }

  reload(): void {
    void this.state.load();
  }
  approveRegistro(id: string): void {
    void this.state.setStatus(id, 'active');
  }
  rejectRegistro(id: string): void {
    void this.state.setStatus(id, 'rejected');
  }
  block(id: string): void {
    void this.state.setStatus(id, 'blocked');
  }
  unblock(id: string): void {
    void this.state.setStatus(id, 'active');
  }
  changeRole(id: string, roleName: string): void {
    void this.state.setRole(id, roleName);
  }
  approveRequest(id: string): void {
    void this.state.resolveRequest(id, 'approved');
  }
  rejectRequest(id: string): void {
    void this.state.resolveRequest(id, 'rejected');
  }
}
