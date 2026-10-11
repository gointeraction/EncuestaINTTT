import { InjectionToken, type Signal } from '@angular/core';
import type { AdminUser, PasswordResetRow } from '../models/admin-users.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const ADMIN_USERS_STATE = new InjectionToken<AdminUsersStateContract>('ADMIN_USERS_STATE');

export interface AdminUsersStateContract {
  readonly loading: Signal<boolean>;
  readonly users: Signal<AdminUser[]>;
  readonly requests: Signal<PasswordResetRow[]>;
  load(): Promise<void>;
  setStatus(id: string, status: string): Promise<void>;
  setRole(id: string, roleName: string): Promise<void>;
  resolveRequest(id: string, status: 'approved' | 'rejected'): Promise<void>;
}
