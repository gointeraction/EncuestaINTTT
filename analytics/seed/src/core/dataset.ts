import type { Cell } from './csv.js';
import { DEVICE_COLUMNS, LEGACY_COLUMNS, deviceRows, legacyRows } from './vision-cero.js';
import type { Profile } from '../profiles.js';

export type Table = {
  name: string;
  columns: string[];
  rows: () => Iterable<Cell[]> | AsyncIterable<Cell[]>;
};

/**
 * Dataset = Visión Cero REAL. La encuesta real guarda en `public.legacy_survey_responses`
 * (una sola encuesta: `driverType` + `answers` JSON + sorteo + `device_id`). El seeder emula
 * ESA forma, y además registra los dispositivos en `public.capture_devices`.
 * `profile.responses` = número de respuestas a generar.
 */
export function tables(seed: number, p: Profile): Table[] {
  return [
    {
      name: 'public.capture_devices',
      columns: DEVICE_COLUMNS,
      rows: () => deviceRows(),
    },
    {
      name: 'public.legacy_survey_responses',
      columns: LEGACY_COLUMNS,
      rows: () => legacyRows(seed, p.responses),
    },
  ];
}

/** Tablas del reset (encuesta real + dispositivos). */
export const RESET_TABLES = ['public.legacy_survey_responses', 'public.capture_devices'];
