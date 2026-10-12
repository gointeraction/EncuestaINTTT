import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class RecoverDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  /** Crea (o reutiliza) la solicitud de cambio de contraseña. */
  async request(email: string): Promise<void> {
    await firstValueFrom(this.api.identityControllerPasswordRequest({ email }));
  }

  /** Estado de la solicitud del correo: none | pending | approved | rejected | used. */
  async status(email: string): Promise<string> {
    const res = await firstValueFrom(this.api.identityControllerPasswordStatus({ email }));
    return (res as unknown as { status?: string })?.status ?? 'none';
  }

  async reset(email: string, newPassword: string): Promise<void> {
    await firstValueFrom(this.api.identityControllerPasswordReset({ email, newPassword }));
  }
}
