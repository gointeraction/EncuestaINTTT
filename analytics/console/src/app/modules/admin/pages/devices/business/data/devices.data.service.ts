import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { AdminDevice, NewDeviceSecret } from '../models/devices.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class DevicesDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async list(): Promise<AdminDevice[]> {
    const res = await firstValueFrom(this.api.devicesControllerList());
    return ((res as unknown as { devices?: AdminDevice[] })?.devices ?? []) as AdminDevice[];
  }

  async create(name: string, channel: 'kiosk' | 'surveyor', dailyQuota: number): Promise<NewDeviceSecret> {
    const res = await firstValueFrom(this.api.devicesControllerCreate({ name, channel, dailyQuota }));
    return res as unknown as NewDeviceSecret;
  }

  async update(id: string, body: { name?: string; dailyQuota?: number; active?: boolean }): Promise<void> {
    await firstValueFrom(this.api.devicesControllerUpdate(id, body));
  }

  async regenerate(id: string): Promise<NewDeviceSecret> {
    const res = await firstValueFrom(this.api.devicesControllerRegenerateSecret(id));
    return { id, secret: (res as unknown as { secret?: string })?.secret ?? '' };
  }
}
