export interface Participant {
  id: string;
  driverType?: string;
  channel?: string;
  captured?: string | null;
  momento: string | null;
  participaSorteo?: boolean;
  nombre: string | null;
  cedula: string | null;
  telefono: string | null;
  codigo: string | null;
}

export interface FilterQuestionLite {
  id: string;
  label: string;
  position?: number;
  options?: Array<{ value: string }>;
}

/** Página de participantes del sorteo. */
export interface ParticipantsPage {
  items: Participant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
