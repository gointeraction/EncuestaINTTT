export interface ResponseRow {
  id: string;
  driverType: string;
  channel: string;
  captured: string | null;
  momento: string | null;
  participaSorteo: boolean;
  cedula: string | null;
}

export interface ResponsesPage {
  items: ResponseRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterQuestionLite {
  id: string;
  label: string;
  position?: number;
  options?: Array<{ value: string }>;
}
