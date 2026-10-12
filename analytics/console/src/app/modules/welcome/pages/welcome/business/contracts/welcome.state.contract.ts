import { InjectionToken, type Signal } from '@angular/core';
import type { Destination } from '../models/welcome.model';
import type { SurveySummary } from '../../../../../../core/active-survey.service';

/** Token de inyección del contrato de estado de la página (el seam lógica↔vista). */
export const WELCOME_STATE = new InjectionToken<WelcomeStateContract>('WELCOME_STATE');

export interface WelcomeStateContract {
  readonly destinations: Signal<Destination[]>;
  readonly surveyTitle: Signal<string>;
  readonly surveys: Signal<SurveySummary[]>;
  readonly activeSurveyId: Signal<string>;
  setSurvey(id: string): void;
}
