import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { LoginCredentials, LoginResult, StaffUser } from '../models/login.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class LoginDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const res = await firstValueFrom(
      this.api.identityControllerLogin({
        email: credentials.email,
        password: credentials.password,
      }),
    );
    const u = (res as unknown as { user?: Partial<StaffUser> })?.user;
    return {
      user: u && u.id
        ? { id: u.id, email: u.email ?? '', role: u.role ?? '', permissions: u.permissions ?? [] }
        : null,
    };
  }
}
