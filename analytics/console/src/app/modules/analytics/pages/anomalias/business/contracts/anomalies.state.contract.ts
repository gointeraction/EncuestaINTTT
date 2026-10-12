import { InjectionToken, type Signal } from '@angular/core';
import type { AnomaliesPayload } from '../models/anomalies.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const ANOMALIES_STATE = new InjectionToken<AnomaliesStateContract>('ANOMALIES_STATE');

export interface AnomaliesStateContract {
  readonly loading: Signal<boolean>;
  readonly payload: Signal<AnomaliesPayload | null>;
  readonly day: Signal<string>;
  load(day?: string): Promise<void>;
}
