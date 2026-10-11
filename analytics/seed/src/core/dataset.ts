import type { Cell } from './csv.js';
import { LEGACY_COLUMNS, legacyRows } from './vision-cero.js';
import type { Profile } from '../profiles.js';

export type Table = {
  name: string;
  columns: string[];
  rows: () => Iterable<Cell[]> | AsyncIterable<Cell[]>;
};

/**
 * Dataset = Visión Cero REAL. La encuesta real guarda en `public.legacy_survey_responses`
 * (una sola encuesta: `driverType` + `answers` JSON + sorteo). El seeder emula ESA forma.
 * `profile.responses` = número de respuestas a generar.
 */
export function tables(seed: number, p: Profile): Table[] {
  return [
    {
      name: 'public.legacy_survey_responses',
      columns: LEGACY_COLUMNS,
      rows: () => legacyRows(seed, p.responses),
    },
  ];
}

/** Tablas del reset (solo la encuesta real). */
export const RESET_TABLES = ['public.legacy_survey_responses'];
