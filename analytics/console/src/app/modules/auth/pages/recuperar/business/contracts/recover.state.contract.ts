import { InjectionToken, type Signal } from '@angular/core';
import type { PasswordResetStep } from '../models/recover.model';

/** Token de inyección del contrato de estado de la página. */
export const RECOVER_STATE = new InjectionToken<RecoverStateContract>('RECOVER_STATE');

export interface RecoverStateContract {
  readonly step: Signal<PasswordResetStep>;
  readonly busy: Signal<boolean>;
  readonly error: Signal<string | null>;
  /** Consulta el estado del correo y actúa: aprobado→formulario, pendiente→aviso, ninguno→crea solicitud. */
  lookup(email: string): Promise<void>;
  /** Vuelve a consultar el estado (por si el admin ya autorizó). */
  recheck(email: string): Promise<void>;
  submitReset(email: string, newPassword: string): Promise<boolean>;
}
