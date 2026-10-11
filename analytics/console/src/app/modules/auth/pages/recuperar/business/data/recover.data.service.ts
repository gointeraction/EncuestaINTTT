import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class RecoverDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async request(email: string): Promise<void> {
    await firstValueFrom(this.api.identityControllerPasswordRequest({ email }));
  }

  async isApproved(email: string): Promise<boolean> {
    const res = await firstValueFrom(this.api.identityControllerPasswordStatus({ email }));
    return !!(res as unknown as { approved?: boolean })?.approved;
  }

  async reset(email: string, newPassword: string): Promise<void> {
    await firstValueFrom(this.api.identityControllerPasswordReset({ email, newPassword }));
  }
}
