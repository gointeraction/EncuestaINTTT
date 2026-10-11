import { InjectionToken, type Signal } from '@angular/core';
import type { PreguntasSource, QuestionRow } from '../models/preguntas.model';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const PREGUNTAS_STATE = new InjectionToken<PreguntasStateContract>('PREGUNTAS_STATE');

export interface PreguntasStateContract {
  readonly sources: Signal<PreguntasSource[]>;
  readonly rows: Signal<QuestionRow[]>;
  readonly derivedRows: Signal<QuestionRow[]>;
  readonly title: Signal<string>;
  readonly search: Signal<string>;
  readonly typeFilter: Signal<string>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  setSearch(value: string): void;
  setType(value: string): void;
}
