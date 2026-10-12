export interface QuestionDef {
  id: string;
  label: string;
  type: string;
  options: string[] | null;
  appliesTo: string[] | 'all';
  showIf: { questionId: string; value: string | string[] } | null;
  scaleMin: number | null;
  scaleMax: number | null;
}

export interface SectionDef {
  id: string;
  title: string;
  appliesTo: string[] | 'all';
  questions: QuestionDef[];
}

export interface DriverTypeDef {
  id: string;
  label: string;
}

export interface QuestionnaireDef {
  title: string;
  subtitle: string;
  driverTypes: DriverTypeDef[];
  sections: SectionDef[];
}

export type AnswerValue = string | number | string[];

export interface SubmitResult {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
}
