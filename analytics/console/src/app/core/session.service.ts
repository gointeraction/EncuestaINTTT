import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../shared/api-sdk';
import type { IdentityControllerLogin200User } from '../shared/api-sdk/model';

export interface StaffUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  readonly user = signal<StaffUser | null>(null);
  readonly loaded = signal(false);

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(this.api.identityControllerLogin({ email, password }));
    this.user.set(mapUser(res?.user));
    this.loaded.set(true);
  }

  async refresh(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.identityControllerSession());
      this.user.set(mapUser(res?.user));
    } catch {
      this.user.set(null);
    } finally {
      this.loaded.set(true);
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.identityControllerLogout());
    } catch {
      /* ignore */
    }
    this.user.set(null);
  }
}

function mapUser(u: IdentityControllerLogin200User | undefined): StaffUser | null {
  if (!u || !u.id) return null;
  return { id: u.id, email: u.email ?? '', role: u.role ?? '', permissions: u.permissions ?? [] };
}
