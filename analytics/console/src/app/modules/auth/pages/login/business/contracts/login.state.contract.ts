import { InjectionToken, type Signal } from '@angular/core';

/** Resultado del intento de acceso. */
export type LoginStatus = 'idle' | 'submitting' | 'success' | 'error';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const LOGIN_STATE = new InjectionToken<LoginStateContract>('LOGIN_STATE');

export interface LoginStateContract {
  readonly status: Signal<LoginStatus>;
  readonly error: Signal<string | null>;
  login(email: string, password: string, turnstileToken?: string): Promise<boolean>;
}
