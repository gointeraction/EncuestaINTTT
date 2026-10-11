import { InjectionToken, type Signal } from '@angular/core';
import type { RegisterInput } from '../models/register.model';

export type RegisterStatus = 'idle' | 'sending' | 'sent' | 'error';

/** Token de inyección del contrato de estado de la página. */
export const REGISTER_STATE = new InjectionToken<RegisterStateContract>('REGISTER_STATE');

export interface RegisterStateContract {
  readonly status: Signal<RegisterStatus>;
  readonly error: Signal<string | null>;
  send(input: RegisterInput): Promise<boolean>;
  reset(): void;
}
