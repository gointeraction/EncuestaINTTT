import type { Cell } from './csv.js';
import { rowRng, type Rng } from './rng.js';
import {
  getSectionsForDriverType,
  type DriverTypeId,
  type Question,
} from './survey-data.js';

/**
 * Visión Cero — forma REAL (tabla `public.legacy_survey_responses`).
 * Las respuestas se generan siguiendo la DEFINICIÓN REAL de la encuesta
 * (`survey-data.ts`, vendida desde `src/lib/survey-data.ts`): por tipo de conductor
 * (`appliesTo`) y con la lógica condicional (`showIf`). Así cada respuesta contiene
 * EXACTAMENTE las preguntas que aplican a su perfil.
 */

export const LEGACY_COLUMNS = [
  '"id"',
  '"driverType"',
  '"answers"',
  '"completedAt"',
  '"capturedAt"',
  '"participaSorteo"',
  '"nombre"',
  '"cedula"',
  '"telefono"',
  '"codigoSorteo"',
  '"channel"',
  '"device_id"',
  '"survey_id"',
];

/** Cuestionario sembrado (slug). Cada fila declara a qué cuestionario pertenece. */
export const SURVEY_ID = 'vision-cero';

export const DRIVER_TYPE_IDS = [
  'motociclista_activo',
  'delivery',
  'mototaxista',
  'ex_motociclista',
  'familiar',
  'otro_conductor',
] as const;
export type DriverType = (typeof DRIVER_TYPE_IDS)[number];

/** Canales de captura (A2: capture-offline-and-integrity.md). */
export const CHANNELS = ['public', 'kiosk', 'surveyor'] as const;
export type Channel = (typeof CHANNELS)[number];

const CHANNEL_WEIGHTS: ReadonlyArray<readonly [Channel, number]> = [
  ['public', 50],
  ['kiosk', 25],
  ['surveyor', 25],
];

/**
 * Dispositivos de captura (canales confiables). El seeder los registra en
 * `public.capture_devices` y asigna su `device_id` a los envíos kiosco/encuestador.
 * `kiosco-anomalo` tiene un peso ALTO a propósito → aparece con volumen anómalo
 * (señal detectable en el panel de anomalías). `daily_quota` acota lo que la captura
 * real aceptaría por día.
 */
export interface DeviceDef {
  id: string;
  name: string;
  channel: 'kiosk' | 'surveyor';
  secret: string;
  dailyQuota: number;
  weight: number;
}
export const DEVICES: readonly DeviceDef[] = [
  { id: 'kiosco-ccs-01', name: 'Kiosco Centro Cívico', channel: 'kiosk', secret: 'kiosco-ccs-01-secret', dailyQuota: 400, weight: 20 },
  { id: 'kiosco-ccs-02', name: 'Kiosco Plaza Bolívar', channel: 'kiosk', secret: 'kiosco-ccs-02-secret', dailyQuota: 400, weight: 15 },
  { id: 'kiosco-anomalo', name: 'Kiosco (volumen anómalo)', channel: 'kiosk', secret: 'kiosco-anomalo-secret', dailyQuota: 10000, weight: 65 },
  { id: 'encuestador-mir-01', name: 'Encuestador Miranda', channel: 'surveyor', secret: 'encuestador-mir-01-secret', dailyQuota: 300, weight: 45 },
  { id: 'encuestador-zul-01', name: 'Encuestador Zulia', channel: 'surveyor', secret: 'encuestador-zul-01-secret', dailyQuota: 300, weight: 55 },
];

export const DEVICE_COLUMNS = ['"id"', '"name"', '"channel"', '"secret"', '"daily_quota"'];

/** Filas de `public.capture_devices` (idempotente con el modelo Prisma). */
export function* deviceRows(): Iterable<Cell[]> {
  for (const d of DEVICES) yield [d.id, d.name, d.channel, d.secret, d.dailyQuota];
}

/** Dispositivo para un canal (null en `public`). Elige entre los del canal por peso. */
function deviceFor(r: Rng, channel: Channel): string | null {
  if (channel === 'public') return null;
  const pool = DEVICES.filter((d) => d.channel === channel);
  if (pool.length === 0) return null;
  return r.weighted(pool.map((d) => [d.id, d.weight] as const));
}

const ESTADOS = [
  'Distrito Capital', 'Miranda', 'Zulia', 'Carabobo', 'Aragua', 'Lara', 'Anzoátegui',
  'Táchira', 'Bolívar', 'Monagas', 'Sucre', 'Falcón', 'Portuguesa', 'Mérida', 'Barinas',
  'Guárico', 'Yaracuy', 'Trujillo', 'Apure', 'Nueva Esparta', 'La Guaira', 'Cojedes', 'Amazonas',
];
const MUNICIPIOS = ['Municipio Capital', 'Municipio Libertador', 'Municipio Girardot', 'Municipio Iribarren', 'Municipio Chacao', 'Municipio Sucre'];
const COMMENTS = [
  'La vía está en mal estado y hay poca señalización.',
  'Considero que faltan campañas de educación vial.',
  'El tráfico es muy denso en horas pico.',
  'Los conductores de carros no respetan a las motos.',
];
const NUMBER_BY_ID: Record<string, [number, number]> = {
  edad: [16, 68],
  anos_conduciendo: [0, 40],
  km_diarios: [5, 150],
  horas_diarias: [1, 12],
  pasajeros_dia: [0, 20],
};
const TEXT_BY_ID: Record<string, string[]> = {
  ocupacion: ['Comerciante', 'Obrero', 'Estudiante', 'Chofer', 'Vendedor', 'Ingeniero'],
  uso_otro: ['Reparto', 'Traslado familiar', 'Deporte'],
  plataforma_delivery: ['Rappi', 'Uber Eats', 'PedidosYa', 'Propia', 'Zummy'],
  motivo_no_licencia: ['No la he tramitado', 'Es costosa', 'Falta de tiempo'],
};

/** Ventana de captura: del 1 de octubre de 2026 hasta hoy. */
const WINDOW_FROM = Date.UTC(2026, 9, 1); // 2026-10-01
function capturedAtMs(r: Rng): number {
  const span = Math.max(1, Date.now() - WINDOW_FROM);
  return WINDOW_FROM + Math.floor(r.float() * span);
}

/** Genera el valor de una respuesta según el TIPO de la pregunta real. */
function valueFor(r: Rng, q: Question): Record<string, string> | string | string[] | number {
  switch (q.type) {
    case 'radio':
    case 'select':
      return r.pick(q.options ?? ['Sí', 'No']);
    case 'checkbox': {
      const opts = q.options ?? [];
      const n = Math.min(opts.length, r.int(1, 3));
      const picked = new Set<string>();
      while (picked.size < n) picked.add(r.pick(opts));
      return [...picked];
    }
    case 'scale':
      return r.int(q.scaleMin ?? 1, q.scaleMax ?? 5);
    case 'number': {
      const [min, max] = NUMBER_BY_ID[q.id] ?? [1, 50];
      return r.int(min, max);
    }
    case 'text':
      return r.pick(TEXT_BY_ID[q.id] ?? ['Respuesta de texto']);
    case 'textarea':
      return r.pick(COMMENTS);
    case 'estado-municipio':
      return { estado: r.pick(ESTADOS), municipio: r.pick(MUNICIPIOS) };
    default:
      return '';
  }
}

/** ¿La pregunta aplica al perfil y a las respuestas ACUMULADAS (appliesTo + showIf)? */
function questionApplies(
  q: Question,
  driverType: DriverTypeId,
  answers: Record<string, unknown>,
): boolean {
  if (q.appliesTo !== 'all' && !q.appliesTo.includes(driverType)) return false;
  if (q.showIf) {
    const prev = answers[q.showIf.questionId];
    if (prev === undefined || prev === null || prev === '') return false;
    const actual = String(prev);
    const req = q.showIf.value;
    if (Array.isArray(req) ? !req.includes(actual) : actual !== req) return false;
  }
  return true;
}

/** Construye el objeto `answers` (JSON) con SOLO las preguntas aplicables al perfil. */
export function answersFor(r: Rng, driverType: DriverTypeId): Record<string, unknown> {
  const answers: Record<string, string | string[] | number> = {};
  for (const section of getSectionsForDriverType(driverType)) {
    // Se evalúa pregunta a pregunta (no la sección de una vez) para que las dependencias
    // `showIf` DENTRO de la misma sección ya tengan la respuesta previa disponible.
    for (const q of section.questions) {
      if (!questionApplies(q, driverType, answers)) continue;
      const v = valueFor(r, q);
      if (q.type === 'estado-municipio') {
        const pair = v as Record<string, string>;
        answers['estado'] = pair.estado;
        answers['municipio'] = pair.municipio;
      } else {
        answers[q.id] = v as string | string[] | number;
      }
    }
  }
  return answers;
}

/** Una fila de `legacy_survey_responses` (emula una entrevista real). */
function legacyRow(r: Rng, id: string, driverType: DriverTypeId, seq: number, cedulaSeq: number): Cell[] {
  const channel = r.weighted(CHANNEL_WEIGHTS);
  const participa = r.float() < 0.65;
  // CAPTURA (dispositivo) y RECEPCIÓN (servidor, unos minutos después).
  const cMs = capturedAtMs(r);
  const captured = new Date(cMs).toISOString();
  const received = new Date(Math.min(cMs + r.int(0, 240) * 60_000, Date.now())).toISOString();
  return [
    id,
    driverType,
    JSON.stringify(answersFor(r, driverType)),
    received,
    captured,
    participa,
    participa ? `Participante ${seq + 1}` : null,
    participa ? `V-${10_000_000 + cedulaSeq}` : null,
    participa ? `+58 412-${1_000_000 + (cedulaSeq % 900_000)}` : null,
    participa ? `COD-${cedulaSeq.toString().padStart(6, '0')}` : null,
    channel,
    deviceFor(r, channel),
    SURVEY_ID,
  ];
}

/** Dataset aleatorio (mezcla de tipos y canales) — usado por el comando `seed`. */
export function* legacyRows(seed: number, n: number): Iterable<Cell[]> {
  for (let i = 0; i < n; i++) {
    const r = rowRng(seed, 11, i);
    yield legacyRow(r, `seedlegacy${i}`, r.pick(DRIVER_TYPE_IDS), i, i);
  }
}

/** Filas de UN tipo de conductor (para los CSV de fixtures). Cédulas únicas entre tipos. */
export function* legacyRowsForDriver(
  seed: number,
  typeIndex: number,
  driverType: DriverType,
  n: number,
): Iterable<Cell[]> {
  for (let i = 0; i < n; i++) {
    const r = rowRng(seed, 41 + typeIndex, i);
    // Secuencia de cédula GLOBALMENTE única para cualquier `n`: entrelaza tipo e índice
    // (`i * 6 + typeIndex`). Antes se usaba un rango fijo de 100k por tipo
    // (`typeIndex * 100_000 + i`), que se desbordaba cuando un tipo superaba las 100k
    // filas (muestra de 1M) y duplicaba cédulas → rompía el índice único
    // `idx_legacy_cedula_sorteo_unique` y abortaba el COPY a mitad de carga.
    const cedulaSeq = i * DRIVER_TYPE_IDS.length + typeIndex;
    yield legacyRow(r, `seed-${driverType}-${i}`, driverType, cedulaSeq, cedulaSeq);
  }
}
