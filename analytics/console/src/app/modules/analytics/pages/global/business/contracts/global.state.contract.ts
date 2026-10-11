import { InjectionToken, type Signal } from '@angular/core';
import type { GlobalPayload, TimelinePoint } from '../models/global.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const GLOBAL_STATE = new InjectionToken<GlobalStateContract>('GLOBAL_STATE');

export interface GlobalStateContract {
  readonly loading: Signal<boolean>;
  readonly payload: Signal<GlobalPayload | null>;
  readonly timeline: Signal<TimelinePoint[]>;
  readonly run: Signal<string | null>;
  load(): Promise<void>;
  summarize(): Promise<void>;
}
