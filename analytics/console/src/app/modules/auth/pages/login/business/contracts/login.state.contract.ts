import { InjectionToken, type Signal } from '@angular/core';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const LOGIN_STATE = new InjectionToken<LoginStateContract>('LOGIN_STATE');

export interface LoginStateContract {
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  login(email: string, password: string): Promise<boolean>;
}
