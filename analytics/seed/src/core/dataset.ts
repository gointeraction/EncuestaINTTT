import type { Cell } from './csv.js';
import { detUuid } from './ids.js';
import { Rng, rowRng } from './rng.js';
import type { Profile } from '../profiles.js';

export const QUESTION_TYPES = ['single_choice', 'multi_choice', 'scale', 'short_text'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
const OPTIONS_PER_QUESTION = 4;
const BASE_MS = Date.UTC(2026, 0, 1);

export type Table = {
  name: string;
  columns: string[];
  rows: () => Iterable<Cell[]> | AsyncIterable<Cell[]>;
};

const iso = (i: number): string => new Date(BASE_MS + i * 3_600_000).toISOString();

const seedUserId = (seed: number): string => detUuid(seed, 900, 0);
const surveyId = (seed: number, k: number): string => detUuid(seed, 100, k);
const questionId = (seed: number, k: number, q: number): string => detUuid(seed, 200, k, q);
const optionId = (seed: number, k: number, q: number, o: number): string =>
  detUuid(seed, 300, k, q, o);
const responseId = (seed: number, i: number): string => detUuid(seed, 400, i);
const answerId = (seed: number, i: number, q: number): string => detUuid(seed, 500, i, q);

function typeOf(k: number, q: number, perSurvey: number): QuestionType {
  return QUESTION_TYPES[(k * perSurvey + q) % QUESTION_TYPES.length];
}

function statusOf(seed: number, i: number): 'completed' | 'in_progress' | 'abandoned' {
  return rowRng(seed, 3, i).weighted([
    ['completed', 85],
    ['in_progress', 10],
    ['abandoned', 5],
  ]);
}

function surveyIndex(seed: number, i: number, surveys: number): number {
  return i % surveys;
}

// ── Generadores (streaming, deterministas por índice) ────────────────────────

function* genUsers(seed: number): Iterable<Cell[]> {
  yield [seedUserId(seed), 'seed@intt.local', 'Datos simulados', 'x', 'creator', iso(0), iso(0)];
}

/** El usuario creador del seed se hace UPSERT (no COPY): conserva usuarios reales. */
export const SEED_USER_COLUMNS = [
  'id',
  'email',
  'name',
  'password_hash',
  'role',
  'created_at',
  'updated_at',
];
export function seedUserRow(seed: number): Cell[] {
  return [...genUsers(seed)][0];
}

function* genSurveys(seed: number, p: Profile): Iterable<Cell[]> {
  for (let k = 0; k < p.surveys; k++) {
    yield [
      surveyId(seed, k),
      seedUserId(seed),
      `Encuesta simulada ${k + 1}`,
      `seed-encuesta-${k + 1}`,
      `SEED${k + 1}`,
      'published',
      'public_anonymous',
      false,
      iso(k),
      iso(k),
    ];
  }
}

function* genQuestions(seed: number, p: Profile): Iterable<Cell[]> {
  for (let k = 0; k < p.surveys; k++) {
    for (let q = 0; q < p.questionsPerSurvey; q++) {
      yield [
        questionId(seed, k, q),
        surveyId(seed, k),
        typeOf(k, q, p.questionsPerSurvey),
        `Pregunta ${q + 1} (encuesta ${k + 1})`,
        false,
        q,
        '{}',
        iso(k),
        iso(k),
      ];
    }
  }
}

function* genOptions(seed: number, p: Profile): Iterable<Cell[]> {
  for (let k = 0; k < p.surveys; k++) {
    for (let q = 0; q < p.questionsPerSurvey; q++) {
      const t = typeOf(k, q, p.questionsPerSurvey);
      if (t !== 'single_choice' && t !== 'multi_choice') continue;
      for (let o = 0; o < OPTIONS_PER_QUESTION; o++) {
        yield [optionId(seed, k, q, o), questionId(seed, k, q), `Opción ${o + 1}`, `${o + 1}`, o];
      }
    }
  }
}

function* genResponses(seed: number, p: Profile): Iterable<Cell[]> {
  for (let i = 0; i < p.responses; i++) {
    const r = rowRng(seed, 3, i);
    const status = statusOf(seed, i);
    const k = surveyIndex(seed, i, p.surveys);
    const started = BASE_MS + (i % 8000) * 60_000;
    const submitted = status === 'completed' ? started + r.int(60_000, 900_000) : null;
    yield [
      responseId(seed, i),
      surveyId(seed, k),
      status,
      new Date(started).toISOString(),
      submitted ? new Date(submitted).toISOString() : null,
      '{}',
      'link',
      `iphash-${i % 100000}`,
      new Date(started).toISOString(),
    ];
  }
}

async function* genAnswers(seed: number, p: Profile): AsyncIterable<Cell[]> {
  for (let i = 0; i < p.responses; i++) {
    const status = statusOf(seed, i);
    if (status === 'abandoned') continue;
    const k = surveyIndex(seed, i, p.surveys);
    const limit = status === 'completed' ? p.questionsPerSurvey : Math.ceil(p.questionsPerSurvey / 2);
    for (let q = 0; q < limit; q++) {
      const r = rowRng(seed, 5, i, q);
      const t = typeOf(k, q, p.questionsPerSurvey);
      let valueText: string | null = null;
      let valueNumeric: number | null = null;
      let valueOptions: string | null = null;
      if (t === 'single_choice') valueText = `${r.int(1, OPTIONS_PER_QUESTION)}`;
      else if (t === 'multi_choice') valueOptions = JSON.stringify([`${r.int(1, OPTIONS_PER_QUESTION)}`]);
      else if (t === 'scale') valueNumeric = r.int(1, 5);
      else valueText = `Texto ${r.int(1, 1000)}`;
      yield [
        answerId(seed, i, q),
        responseId(seed, i),
        questionId(seed, k, q),
        valueText,
        valueNumeric,
        valueOptions,
        iso(i % 8000),
      ];
    }
    if (i % 50_000 === 0) await Promise.resolve(); // cede el hilo en volúmenes grandes
  }
}

function* genLegacy(seed: number, p: Profile): Iterable<Cell[]> {
  for (let i = 0; i < p.legacy; i++) {
    const r = rowRng(seed, 7, i);
    yield [
      `seedlegacy${i}`,
      r.pick(['A', 'B', 'C', 'D']),
      '{}',
      iso(i % 8000),
      true,
      `Participante ${i + 1}`,
      `V-${10_000_000 + i}`,
      `+58 412-${1_000_000 + (i % 900_000)}`,
      `COD-${(i % 100000).toString().padStart(5, '0')}`,
    ];
  }
}

/** Tablas sembradas (orden de inserción respetando FKs). */
export function tables(seed: number, p: Profile): Table[] {
  return [
    {
      name: 'public.surveys',
      columns: [
        'id',
        'creator_id',
        'title',
        'slug',
        'short_code',
        'status',
        'access_mode',
        'allow_partial',
        'created_at',
        'updated_at',
      ],
      rows: () => genSurveys(seed, p),
    },
    {
      name: 'public.questions',
      columns: [
        'id',
        'survey_id',
        'type',
        'label',
        'required',
        'position',
        'validation_rules',
        'created_at',
        'updated_at',
      ],
      rows: () => genQuestions(seed, p),
    },
    {
      name: 'public.question_options',
      columns: ['id', 'question_id', 'label', 'value', 'position'],
      rows: () => genOptions(seed, p),
    },
    {
      name: 'public.responses',
      columns: [
        'id',
        'survey_id',
        'status',
        'started_at',
        'submitted_at',
        'device',
        'channel',
        'ip_hash',
        'created_at',
      ],
      rows: () => genResponses(seed, p),
    },
    {
      name: 'public.answers',
      columns: [
        'id',
        'response_id',
        'question_id',
        'value_text',
        'value_numeric',
        'value_options',
        'created_at',
      ],
      rows: () => genAnswers(seed, p),
    },
    {
      name: 'public.legacy_survey_responses',
      columns: [
        '"id"',
        '"driverType"',
        '"answers"',
        '"completedAt"',
        '"participaSorteo"',
        '"nombre"',
        '"cedula"',
        '"telefono"',
        '"codigoSorteo"',
      ],
      rows: () => genLegacy(seed, p),
    },
  ];
}

/** Tablas para el reset (orden inverso de dependencias). El usuario seed se conserva. */
export const RESET_TABLES = [
  'public.answers',
  'public.responses',
  'public.question_options',
  'public.questions',
  'public.legacy_survey_responses',
  'public.surveys',
];

export type { Rng };
