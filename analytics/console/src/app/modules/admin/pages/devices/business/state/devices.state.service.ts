import { Injectable, inject, signal } from '@angular/core';
import { DevicesDataService } from '../data/devices.data.service';
import type { DevicesStateContract } from '../contracts/devices.state.contract';
import type { AdminDevice, NewDeviceSecret } from '../models/devices.model';

@Injectable()
export class DevicesStateService implements DevicesStateContract {
  private readonly data = inject(DevicesDataService);

  readonly loading = signal(false);
  readonly devices = signal<AdminDevice[]>([]);
  readonly secret = signal<NewDeviceSecret | null>(null);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.devices.set(await this.data.list());
    } catch {
      this.error.set('No se pudieron cargar los dispositivos.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(name: string, channel: 'kiosk' | 'surveyor', quota: number): Promise<void> {
    try {
      this.secret.set(await this.data.create(name, channel, quota));
      await this.load();
    } catch {
      this.error.set('No se pudo crear el dispositivo (¿nombre/canal válidos?).');
    }
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.data.update(id, { active });
    await this.load();
  }

  async setQuota(id: string, quota: number): Promise<void> {
    await this.data.update(id, { dailyQuota: quota });
    await this.load();
  }

  async regenerate(id: string): Promise<void> {
    this.secret.set(await this.data.regenerate(id));
  }

  clearSecret(): void {
    this.secret.set(null);
  }
}
