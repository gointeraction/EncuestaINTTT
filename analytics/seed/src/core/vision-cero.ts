import type { Cell } from './csv.js';
import { rowRng, type Rng } from './rng.js';

/**
 * Visión Cero — forma REAL de la encuesta (tabla `public.legacy_survey_responses`).
 * Una sola encuesta; respuesta = `driverType` + `answers` (JSON) + sorteo. Los ids de
 * pregunta replican la definición de la captura (`src/lib/survey-data.ts`).
 */
export const DRIVER_TYPES = [
  'motociclista_activo',
  'delivery',
  'mototaxista',
  'ex_motociclista',
  'familiar',
  'otro_conductor',
] as const;
export type DriverType = (typeof DRIVER_TYPES)[number];

const ESTADOS = [
  'Distrito Capital', 'Miranda', 'Zulia', 'Carabobo', 'Aragua', 'Lara', 'Anzoátegui',
  'Táchira', 'Bolívar', 'Carabobo', 'Monagas', 'Sucre', 'Falcón', 'Portuguesa', 'Mérida',
  'Barinas', 'Guárico', 'Yaracuy', 'Trujillo', 'Apure', 'Nueva Esparta', 'Vargas', 'Cojedes', 'Amazonas',
];

const SEXO = ['M', 'F'];
const NIVEL = ['Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado'];
const SI_NO = ['Sí', 'No'];
const FRECUENCIA = ['Todos los días', 'Varias veces por semana', 'Ocasionalmente', 'Nunca'];
const USO = ['Trabajo / Delivery', 'Transporte de pasajeros', 'Uso personal', 'Recreación'];
const CASCO = ['Siempre', 'A veces', 'Nunca'];
const UTILIZA = ['Nunca', 'A veces', 'Frecuentemente', 'Siempre'];
const CAUSAS = ['Exceso de velocidad', 'Distracción', 'Consumo de alcohol', 'Fallas mecánicas', 'Impericia', 'Vía en mal estado'];
const MEDIDAS = ['Casco certificado', 'Capacitación vial', 'Control policial', 'Mejoras de la vía', 'Campañas'];
const SINO_NS = ['Sí', 'No', 'No sabe'];

const ISO = (i: number) => new Date(Date.UTC(2026, 0, 1) + i * 60_000).toISOString();

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

function answers(r: Rng, driverType: DriverType): Record<string, unknown> {
  const siniestro = r.pick(SI_NO);
  const a: Record<string, unknown> = {
    edad: r.int(16, 68),
    sexo: r.pick(SEXO),
    estado: r.pick(ESTADOS),
    nivel_educativo: r.pick(NIVEL),
    anos_conduciendo: r.int(0, 40),
    licencia: r.pick(SI_NO),
    frecuencia_conduccion: r.pick(FRECUENCIA),
    uso_principal: driverType === 'delivery' || driverType === 'mototaxista' ? 'Trabajo / Delivery' : r.pick(USO),
    km_diarios: r.int(5, 150),
    horas_diarias: r.int(1, 12),
    conduccion_nocturna: r.pick(UTILIZA),
    clima_lluvia: r.pick(SI_NO),
    casco_usa: r.pick(CASCO),
    casco_certificado: r.pick(SI_NO),
    ha_tenido_siniestro: siniestro,
    causas_principales: [r.pick(CAUSAS), r.pick(CAUSAS)],
    medidas_efectivas: [r.pick(MEDIDAS), r.pick(MEDIDAS)],
    percepcion_seguridad: r.int(1, 5),
    efectividad_control: r.int(1, 5),
    uso_celular: r.pick(UTILIZA),
    alcohol_conduccion: r.pick(UTILIZA),
    estado_vias: r.int(1, 5),
    senalizacion: r.int(1, 5),
    velocidad_opinion: r.int(1, 5),
    rebases_peatones: r.int(1, 5),
    apoyo_vision_cero: r.pick(SINO_NS),
    disposicion_participar: r.pick(SI_NO),
  };
  if (siniestro === 'Sí') a['siniestro_gravedad'] = r.pick(['Leve', 'Moderado', 'Grave']);
  return a;
}

/** Genera las filas de `public.legacy_survey_responses` (emula la encuesta real). */
export function* legacyRows(seed: number, n: number): Iterable<Cell[]> {
  for (let i = 0; i < n; i++) {
    const r = rowRng(seed, 11, i);
    const driverType = r.pick(DRIVER_TYPES);
    const participa = r.float() < 0.65;
    yield [
      `seedlegacy${i}`,
      driverType,
      JSON.stringify(answers(r, driverType)),
      ISO(i),
      participa,
      participa ? `Participante ${i + 1}` : null,
      participa ? `V-${10_000_000 + i}` : null,
      participa ? `+58 412-${1_000_000 + (i % 900_000)}` : null,
      participa ? `COD-${(i % 100000).toString().padStart(5, '0')}` : null,
    ];
  }
}
