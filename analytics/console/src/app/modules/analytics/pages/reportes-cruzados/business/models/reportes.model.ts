export interface ReportSurveySource {
  id: string;
  title: string;
}

export interface ReportQuestion {
  id: string;
  label: string;
  kind?: string;
  position?: number;
}

export interface CrossTabCell {
  v1: string;
  v2: string;
  n: number;
}

export interface CrossTabResult {
  surveyId: string;
  questionA: string;
  questionB: string;
  baseA: number;
  baseB: number;
  baseBoth: number;
  categoriesA: string[];
  categoriesB: string[];
  cells: CrossTabCell[];
}
