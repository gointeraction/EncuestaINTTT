import type { Cell } from './csv.js';
import { rowRng, type Rng } from './rng.js';
import {
  getActiveQuestions,
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
  '"participaSorteo"',
  '"nombre"',
  '"cedula"',
  '"telefono"',
  '"codigoSorteo"',
];

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

const ISO = (i: number) => new Date(Date.UTC(2026, 0, 1) + i * 60_000).toISOString();

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

/** Construye el objeto `answers` (JSON) con SOLO las preguntas aplicables al perfil. */
export function answersFor(r: Rng, driverType: DriverTypeId): Record<string, unknown> {
  const answers: Record<string, string | string[] | number> = {};
  for (const section of getSectionsForDriverType(driverType)) {
    for (const q of getActiveQuestions(section, driverType, answers)) {
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

/** Genera las filas de `public.legacy_survey_responses` (emula la encuesta real). */
export function* legacyRows(seed: number, n: number): Iterable<Cell[]> {
  const driverIds = ['motociclista_activo', 'delivery', 'mototaxista', 'ex_motociclista', 'familiar', 'otro_conductor'] as DriverTypeId[];
  for (let i = 0; i < n; i++) {
    const r = rowRng(seed, 11, i);
    const driverType = r.pick(driverIds);
    const participa = r.float() < 0.65;
    yield [
      `seedlegacy${i}`,
      driverType,
      JSON.stringify(answersFor(r, driverType)),
      ISO(i),
      participa,
      participa ? `Participante ${i + 1}` : null,
      participa ? `V-${10_000_000 + i}` : null,
      participa ? `+58 412-${1_000_000 + (i % 900_000)}` : null,
      participa ? `COD-${(i % 100000).toString().padStart(5, '0')}` : null,
    ];
  }
}
