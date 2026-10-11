export interface GlobalBreakdownItem {
  id: string;
  label?: string;
  responses: number;
}

export interface TimelinePoint {
  day: string;
  total: number;
  completed: number;
}

/** Payload de la vista global (dashboard de KPIs). */
export interface GlobalPayload {
  totalSurveys: number;
  totalResponses: number;
  completed: number;
  abandoned: number;
  sorteo: number;
  questionnaire?: string;
  bySurvey: Array<{ id: string; title: string; responses: number }>;
  byDriverType: GlobalBreakdownItem[];
  byChannel: GlobalBreakdownItem[];
}
