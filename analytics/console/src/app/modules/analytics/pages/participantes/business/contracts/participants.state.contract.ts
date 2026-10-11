import { InjectionToken, type Signal } from '@angular/core';
import type { ParticipantsPage } from '../models/participants.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const PARTICIPANTS_STATE = new InjectionToken<ParticipantsStateContract>('PARTICIPANTS_STATE');

export interface ParticipantsStateContract {
  readonly loading: Signal<boolean>;
  readonly page: Signal<ParticipantsPage | null>;
  load(page: number): Promise<void>;
  go(page: number): Promise<void>;
}
