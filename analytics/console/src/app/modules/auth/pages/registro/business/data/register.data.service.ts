import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { RegisterInput } from '../models/register.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class RegisterDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async register(input: RegisterInput): Promise<void> {
    await firstValueFrom(
      this.api.identityControllerRegister({
        email: input.email,
        password: input.password,
        name: input.name,
      }),
    );
  }
}
