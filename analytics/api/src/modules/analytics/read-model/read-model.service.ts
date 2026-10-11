import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

/** Etiquetas de las preguntas de Visión Cero (ids reales; fuente: src/lib/survey-data.ts). */
const LABELS: Record<string, string> = {
  estado: 'Estado',
  municipio: 'Municipio',
  edad: '¿Cuál es tu edad?',
  sexo: 'Sexo',
  ubicacion: '¿En qué estado y municipio resides?',
  ocupacion: 'Ocupación principal',
  nivel_educativo: 'Nivel educativo alcanzado',
  anos_conduciendo: '¿Cuántos años llevas conduciendo motocicleta?',
  licencia: '¿Posees licencia de conducción vigente?',
  categoria_licencia: '¿Qué categoría de licencia tienes?',
  motivo_no_licencia: '¿Por qué no tienes licencia?',
  frecuencia_conduccion: '¿Con qué frecuencia conduces la motocicleta?',
  dejo_conducir_razon: '¿Por qué dejaste de conducir motocicleta?',
  uso_principal: '¿Cuál es el uso principal de tu motocicleta?',
  uso_otro: 'Especifica otro uso',
  km_diarios: '¿Cuántos kilómetros recorres al día?',
  horas_diarias: '¿Cuántas horas al día conduces?',
  plataforma_delivery: '¿Para qué plataforma(s) trabajas?',
  pasajeros_dia: '¿Cuántos pasajeros transportas al día?',
  conduccion_nocturna: '¿Conduces de noche (después de las 9 pm)?',
  clima_lluvia: '¿Conduces con lluvia o condiciones adversas?',
  casco_usa: '¿Usas casco al conducir?',
  casco_tipo: '¿Qué tipo de casco usas?',
  casco_certificado: '¿Tu casco está certificado (DOT, ECE, SNELL)?',
  motivo_no_casco: '¿Por qué no usas casco?',
  equipamiento_adicional: '¿Qué otros elementos de protección usas?',
  elementos_moto: '¿Qué elementos de seguridad tiene tu motocicleta?',
  velocidad_opinion: '¿Conduces a una velocidad adecuada al límite? (1-5)',
  uso_celular: '¿Usas el celular mientras conduces?',
  alcohol_conduccion: '¿Has conducido tras consumir alcohol?',
  pasajeros_extra: '¿Transportas a más de un pasajero?',
  rebases_peatones: '¿Respetas el paso de peatones? (1-5)',
  presion_tiempo: '¿Sientes presión por el tiempo al conducir?',
  fatiga: '¿Conduces aunque sientas fatiga o sueño?',
  ha_tenido_siniestro: '¿Has tenido un siniestro con motocicleta?',
  siniestro_gravedad: 'Gravedad del siniestro más reciente',
  siniestro_ano: 'Año del siniestro más reciente',
  siniestro_causas: 'Factores que causaron el siniestro',
  siniestro_atencion: '¿Recibiste atención médica tras el siniestro?',
  familiar_relacion: 'Parentesco con la víctima',
  familiar_siniestro_tipo: 'Resultado del siniestro del familiar',
  causas_principales: 'Causas principales de siniestros',
  medidas_efectivas: 'Medidas más efectivas',
  efectividad_control: 'Efectividad del control de tránsito (1-5)',
  percepcion_seguridad: 'Percepción de seguridad al conducir (1-5)',
  estado_vias: 'Estado general de las vías (1-5)',
  senalizacion: 'Claridad de la señalización (1-5)',
  iluminacion: 'Iluminación de vías nocturnas',
  problemas_via: 'Problemas de infraestructura frecuentes',
  conoce_limites_velocidad: '¿Conoces los límites de velocidad?',
  conoce_alcoholemia: '¿Conoces las normas de alcoholemia?',
  conoce_sanciones: '¿Conoces las sanciones de tránsito?',
  recibio_capacitacion: '¿Recibiste capacitación formal?',
  propuesta_principal: 'Acción más urgente para reducir siniestros',
  apoyo_vision_cero: '¿Apoyas la política Visión Cero?',
  disposicion_participar: '¿Dispuesto a participar en campañas?',
  comentario_final: 'Comentario final',
};

interface QuestionAgg {
  id: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  options: Array<{ value: string; count: number }>;
  average: number | null;
}

const VISION_CERO = { id: 'vision-cero', title: 'Visión Cero — Motocicletas' };

/** Etiquetas de los tipos de conductor (fuente: src/lib/survey-data.ts). */
const DRIVER_LABELS: Record<string, string> = {
  motociclista_activo: 'Motociclista activo',
  delivery: 'Delivery / Mensajero',
  mototaxista: 'Mototaxista',
  ex_motociclista: 'Ex motociclista',
  familiar: 'Familiar de víctima',
  otro_conductor: 'Otro conductor / peatón',
};

/**
 * ReadModelService — calcula y persiste los read models (esquema `analytics`) a partir de
 * la CAPTURA REAL (`public.legacy_survey_responses`, SOLO LECTURA). Visión Cero = UNA encuesta
 * con `driverType` + `answers` (JSON). No escribe en public.
 */
@Injectable()
export class ReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  listSurveys(): Promise<Array<{ id: string; title: string }>> {
    return Promise.resolve([VISION_CERO]);
  }

  async summarizeGlobal(): Promise<number> {
    const [tot] = await this.prisma.$queryRaw<Array<{ total: number; sorteo: number }>>`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE "participaSorteo")::int AS sorteo
      FROM public.legacy_survey_responses
    `;
    const byDriverType = await this.prisma.$queryRaw<Array<{ id: string; responses: number }>>`
      SELECT "driverType" AS id, COUNT(*)::int AS responses
      FROM public.legacy_survey_responses
      GROUP BY 1
      ORDER BY 2 DESC
    `;
    const byChannel = await this.prisma.$queryRaw<Array<{ id: string; responses: number }>>`
      SELECT COALESCE(channel, 'public') AS id, COUNT(*)::int AS responses
      FROM public.legacy_survey_responses
      GROUP BY 1
      ORDER BY 2 DESC
    `;
    const total = tot?.total ?? 0;
    const payload = {
      totalSurveys: 1,
      totalResponses: total,
      completed: total,
      abandoned: 0,
      sorteo: tot?.sorteo ?? 0,
      bySurvey: [{ ...VISION_CERO, responses: total }],
      byDriverType: byDriverType.map((d) => ({ ...d, label: DRIVER_LABELS[d.id] ?? d.id })),
      byChannel,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.globalDashboard.upsert({
      where: { id: 'latest' },
      create: { id: 'latest', payload: JSON.stringify(payload) },
      update: { payload: JSON.stringify(payload) },
    });
    return total;
  }

  async summarizeSurvey(surveyId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ answers: string; driverType: string }>>`
      SELECT answers, "driverType" AS "driverType" FROM public.legacy_survey_responses LIMIT 200000
    `;
    const { questions, total } = aggregate(rows);
    const payload = {
      surveyId,
      title: VISION_CERO.title,
      totals: { responses: total },
      byDriverType: byDriver(rows),
      questions,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.surveySummaryReport.upsert({
      where: { surveyId },
      create: { surveyId, totalCount: total, summaryData: JSON.stringify(payload) },
      update: { totalCount: total, summaryData: JSON.stringify(payload), calculatedAt: new Date() },
    });
    return total;
  }
}

function byDriver(rows: Array<{ driverType: string }>): Array<{ id: string; responses: number }> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.driverType, (m.get(r.driverType) ?? 0) + 1);
  return [...m.entries()].map(([id, responses]) => ({ id, responses })).sort((a, b) => b.responses - a.responses);
}

/** Agrega el JSON `answers` de todas las filas (categóricas y numéricas). */
function aggregate(rows: Array<{ answers: string }>): { questions: QuestionAgg[]; total: number } {
  const cats = new Map<string, Map<string, number>>();
  const nums = new Map<string, { sum: number; count: number }>();
  let total = 0;
  for (const row of rows) {
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(row.answers) as Record<string, unknown>;
    } catch {
      continue;
    }
    total++;
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        const m = cats.get(k) ?? new Map<string, number>();
        for (const x of v) m.set(String(x), (m.get(String(x)) ?? 0) + 1);
        cats.set(k, m);
      } else if (typeof v === 'number') {
        const n = nums.get(k) ?? { sum: 0, count: 0 };
        n.sum += v;
        n.count++;
        nums.set(k, n);
      } else if (v !== null && v !== undefined && v !== '') {
        const m = cats.get(k) ?? new Map<string, number>();
        m.set(String(v), (m.get(String(v)) ?? 0) + 1);
        cats.set(k, m);
      }
    }
  }
  const questions: QuestionAgg[] = [];
  for (const [k, m] of cats) {
    questions.push({
      id: k,
      label: LABELS[k] ?? k,
      kind: 'choice',
      options: [...m.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 30),
      average: null,
    });
  }
  for (const [k, n] of nums) {
    questions.push({ id: k, label: LABELS[k] ?? k, kind: 'numeric', options: [], average: n.count ? n.sum / n.count : null });
  }
  questions.sort((a, b) => a.id.localeCompare(b.id));
  return { questions, total };
}
