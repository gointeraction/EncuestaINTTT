import { InjectionToken, type Signal } from '@angular/core';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const EXPORT_STATE = new InjectionToken<ExportStateContract>('EXPORT_STATE');

export interface ExportStateContract {
  readonly surveyId: Signal<string>;
  questionnaireUrl(): string;
  collectedUrl(): string;
}
