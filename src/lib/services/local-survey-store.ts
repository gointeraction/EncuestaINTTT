import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface LocalOption {
  id: string;
  label: string;
  value: string;
  position: number;
}

export interface LocalQuestion {
  id: string;
  surveyId: string;
  type: string;
  label: string;
  required: boolean;
  position: number;
  options: LocalOption[];
}

export interface LocalSurvey {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  slug: string;
  shortCode: string;
  status: string;
  accessMode: string;
  allowPartial: boolean;
  maxResponses: number | null;
  startsAt: string | null;
  endsAt: string | null;
  consentText: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    questions: number;
    responses: number;
  };
  questions: LocalQuestion[];
}

function storePath(): string {
  return join(process.cwd(), "db", "local_surveys.json");
}

export function loadLocalSurveys(): LocalSurvey[] {
  try {
    const path = storePath();
    if (!existsSync(path)) {
      return [];
    }
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[local-survey-store] No se pudo leer el almacén local:", err);
    return [];
  }
}

export function getLocalSurveyById(id: string): LocalSurvey | null {
  const surveys = loadLocalSurveys();
  return surveys.find((s) => s.id === id) ?? null;
}

export function saveLocalSurvey(survey: LocalSurvey): LocalSurvey {
  const surveys = loadLocalSurveys();
  const idx = surveys.findIndex((s) => s.id === survey.id);
  if (idx >= 0) {
    surveys[idx] = survey;
  } else {
    surveys.push(survey);
  }
  writeLocalSurveys(surveys);
  return survey;
}

export function deleteLocalSurvey(id: string): boolean {
  const surveys = loadLocalSurveys();
  const filtered = surveys.filter((s) => s.id !== id);
  if (filtered.length === surveys.length) {
    return false;
  }
  writeLocalSurveys(filtered);
  return true;
}

function writeLocalSurveys(surveys: LocalSurvey[]): void {
  try {
    const path = storePath();
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(surveys, null, 2), "utf-8");
    renameSync(tmp, path);
  } catch (err) {
    console.warn("[local-survey-store] No se pudo escribir el almacén local:", err);
    throw err;
  }
}