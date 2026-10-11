import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { QUESTIONNAIRES, PRIMARY_QUESTIONNAIRE, type Questionnaire } from './questionnaires.js';

interface QuestionAgg {
  id: string;
  label: string;
  kind: 'choice' | 'numeric' | 'text';
  options: Array<{ value: string; count: number }>;
  average: number | null;
}

/**
 * ReadModelService — calcula y persiste los read models (esquema `analytics`) a partir de la
 * CAPTURA REAL, según el REGISTRO de cuestionarios (A2: questionnaires-registry.md). Hoy hay un
 * cuestionario (Visión Cero); con N, se itera QUESTIONNAIRES. No escribe en public.
 */
@Injectable()
export class ReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  listSurveys(): Promise<Array<{ id: string; title: string }>> {
    return Promise.resolve(QUESTIONNAIRES.map((q) => ({ id: q.id, title: q.title })));
  }

  async summarizeGlobal(): Promise<number> {
    const q = PRIMARY_QUESTIONNAIRE;
    const total = await this.summarizeGlobalOf(q);
    return total;
  }

  private async summarizeGlobalOf(q: Questionnaire): Promise<number> {
    const src = q.source;
    const [tot] = await this.prisma.$queryRawUnsafe<Array<{ total: number; sorteo: number }>>(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE "${src.sorteoField}")::int AS sorteo
       FROM ${src.table}`,
    );
    const bySeg = await this.prisma.$queryRawUnsafe<Array<{ id: string; responses: number }>>(
      `SELECT "${src.segmentsField}" AS id, COUNT(*)::int AS responses
       FROM ${src.table} GROUP BY 1 ORDER BY 2 DESC`,
    );
    const byChannel = await this.prisma.$queryRawUnsafe<Array<{ id: string; responses: number }>>(
      `SELECT COALESCE("${src.channelField}", 'public') AS id, COUNT(*)::int AS responses
       FROM ${src.table} GROUP BY 1 ORDER BY 2 DESC`,
    );
    const total = tot?.total ?? 0;
    const payload = {
      totalSurveys: 1,
      totalResponses: total,
      completed: total,
      abandoned: 0,
      sorteo: tot?.sorteo ?? 0,
      bySurvey: [{ id: q.id, title: q.title, responses: total }],
      byDriverType: bySeg.map((d) => ({ ...d, label: q.segments[d.id] ?? d.id })),
      byChannel: byChannel.map((c) => ({ ...c, label: q.channels[c.id] ?? c.id })),
      questionnaire: q.id,
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
    const q = QUESTIONNAIRES.find((x) => x.id === surveyId) ?? PRIMARY_QUESTIONNAIRE;
    const rows = await this.prisma.$queryRawUnsafe<Array<{ answers: string; seg: string }>>(
      `SELECT "${q.source.answersField}" AS answers, "${q.source.segmentsField}" AS seg
       FROM ${q.source.table} LIMIT 200000`,
    );
    const { questions, total } = aggregate(q, rows);
    const payload = {
      surveyId: q.id,
      title: q.title,
      totals: { responses: total },
      byDriverType: bySegment(rows),
      questions,
      generatedAt: new Date().toISOString(),
    };
    await this.prisma.surveySummaryReport.upsert({
      where: { surveyId: q.id },
      create: { surveyId: q.id, totalCount: total, summaryData: JSON.stringify(payload) },
      update: { totalCount: total, summaryData: JSON.stringify(payload), calculatedAt: new Date() },
    });
    return total;
  }
}

function bySegment(rows: Array<{ seg: string }>): Array<{ id: string; responses: number }> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.seg, (m.get(r.seg) ?? 0) + 1);
  return [...m.entries()]
    .map(([id, responses]) => ({ id, responses }))
    .sort((a, b) => b.responses - a.responses);
}

/** Agrega el JSON de respuestas (categóricas y numéricas) del cuestionario. */
function aggregate(
  q: Questionnaire,
  rows: Array<{ answers: string }>,
): { questions: QuestionAgg[]; total: number } {
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
      label: q.labels[k] ?? k,
      kind: 'choice',
      options: [...m.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30),
      average: null,
    });
  }
  for (const [k, n] of nums) {
    questions.push({
      id: k,
      label: q.labels[k] ?? k,
      kind: 'numeric',
      options: [],
      average: n.count ? n.sum / n.count : null,
    });
  }
  questions.sort((a, b) => a.id.localeCompare(b.id));
  return { questions, total };
}
