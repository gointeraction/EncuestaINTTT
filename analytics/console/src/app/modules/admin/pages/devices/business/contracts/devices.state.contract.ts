import { InjectionToken, type Signal } from '@angular/core';
import type { AdminDevice, NewDeviceSecret } from '../models/devices.model';

export const DEVICES_STATE = new InjectionToken<DevicesStateContract>('DEVICES_STATE');

export interface DevicesStateContract {
  readonly loading: Signal<boolean>;
  readonly devices: Signal<AdminDevice[]>;
  readonly secret: Signal<NewDeviceSecret | null>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  create(name: string, channel: 'kiosk' | 'surveyor', quota: number): Promise<void>;
  setActive(id: string, active: boolean): Promise<void>;
  setQuota(id: string, quota: number): Promise<void>;
  regenerate(id: string): Promise<void>;
  clearSecret(): void;
}
