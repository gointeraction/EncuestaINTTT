import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { AdminUser, PasswordResetRow } from '../models/admin-users.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class AdminUsersDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async users(): Promise<AdminUser[]> {
    const res = await firstValueFrom(this.api.adminUsersControllerUsers({ status: '' }));
    return ((res as unknown as { users?: AdminUser[] })?.users ?? []) as AdminUser[];
  }

  async requests(): Promise<PasswordResetRow[]> {
    const res = await firstValueFrom(this.api.adminUsersControllerPasswordRequests({ status: '' }));
    return ((res as unknown as { requests?: PasswordResetRow[] })?.requests ?? []) as PasswordResetRow[];
  }

  async patchUser(id: string, body: { status?: string; roleName?: string }): Promise<void> {
    await firstValueFrom(this.api.adminUsersControllerPatchUser(id, body));
  }

  async patchRequest(id: string, status: 'approved' | 'rejected'): Promise<void> {
    await firstValueFrom(this.api.adminUsersControllerPatchRequest(id, { status }));
  }
}
