export interface Participant {
  id: string;
  nombre: string | null;
  cedula: string | null;
  telefono: string | null;
  codigo: string | null;
  momento: string | null;
}

/** Página de participantes del sorteo. */
export interface ParticipantsPage {
  items: Participant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
