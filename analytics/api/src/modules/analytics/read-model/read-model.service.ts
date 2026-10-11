import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

/** Etiquetas de las preguntas de Visión Cero (ids reales de la captura). */
const LABELS: Record<string, string> = {
  edad: 'Edad',
  sexo: 'Sexo',
  estado: 'Estado',
  nivel_educativo: 'Nivel educativo',
  anos_conduciendo: 'Años conduciendo',
  licencia: 'Licencia vigente',
  frecuencia_conduccion: 'Frecuencia de conducción',
  uso_principal: 'Uso principal',
  km_diarios: 'Km diarios',
  horas_diarias: 'Horas diarias',
  conduccion_nocturna: 'Conducción nocturna',
  clima_lluvia: 'Conduce con lluvia',
  casco_usa: 'Uso del casco',
  casco_certificado: 'Casco certificado',
  ha_tenido_siniestro: '¿Ha tenido siniestro?',
  siniestro_gravedad: 'Gravedad del siniestro',
  causas_principales: 'Causas principales',
  medidas_efectivas: 'Medidas efectivas',
  percepcion_seguridad: 'Percepción de seguridad',
  efectividad_control: 'Efectividad del control',
  uso_celular: 'Uso del celular',
  alcohol_conduccion: 'Alcohol y conducción',
  estado_vias: 'Estado de las vías',
  senalizacion: 'Señalización vial',
  velocidad_opinion: 'Respeto al límite de velocidad',
  rebases_peatones: 'Respeto a peatones',
  apoyo_vision_cero: 'Apoyo a Visión Cero',
  disposicion_participar: 'Disposición a participar',
};

interface QuestionAgg {
  id: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  options: Array<{ value: string; count: number }>;
  average: number | null;
}

const VISION_CERO = { id: 'vision-cero', title: 'Visión Cero — Motocicletas' };

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
    const [tot] = await this.prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total FROM public.legacy_survey_responses
    `;
    const byDriverType = await this.prisma.$queryRaw<Array<{ id: string; responses: number }>>`
      SELECT "driverType" AS id, COUNT(*)::int AS responses
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
      bySurvey: [{ ...VISION_CERO, responses: total }],
      byDriverType,
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
