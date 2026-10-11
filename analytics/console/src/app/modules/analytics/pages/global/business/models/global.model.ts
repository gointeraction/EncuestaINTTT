/** Payload de la vista global (dashboard de KPIs). */
export interface GlobalPayload {
  totalSurveys: number;
  totalResponses: number;
  completed: number;
  abandoned: number;
  bySurvey: Array<{ id: string; title: string; responses: number }>;
}
