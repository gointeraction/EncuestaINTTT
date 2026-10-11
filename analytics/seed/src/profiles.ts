export interface Profile {
  /** número de encuestas */
  surveys: number;
  /** preguntas por encuesta */
  questionsPerSurvey: number;
  /** respuestas totales (repartidas entre encuestas) */
  responses: number;
  /** filas en public.legacy_survey_responses */
  legacy: number;
}

export const PROFILES: Record<string, Profile> = {
  small: { surveys: 3, questionsPerSurvey: 8, responses: 1_000, legacy: 500 },
  medium: { surveys: 8, questionsPerSurvey: 10, responses: 50_000, legacy: 5_000 },
  large: { surveys: 12, questionsPerSurvey: 12, responses: 1_000_000, legacy: 20_000 },
  xl: { surveys: 20, questionsPerSurvey: 15, responses: 10_000_000, legacy: 50_000 },
};

export type ProfileName = keyof typeof PROFILES;

/** Combina un perfil base con overrides puntuales (para la CLI y la API HTTP). */
export function withOverride(base: Profile, o: Partial<Profile>): Profile {
  return {
    surveys: o.surveys ?? base.surveys,
    questionsPerSurvey: o.questionsPerSurvey ?? base.questionsPerSurvey,
    responses: o.responses ?? base.responses,
    legacy: o.legacy ?? base.legacy,
  };
}
