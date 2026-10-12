import { Injectable, computed, inject, signal } from '@angular/core';
import { IndividualDataService } from '../data/individual.data.service';
import type {
  ActiveSection,
  IndividualStateContract,
} from '../contracts/individual.state.contract';
import type { AnswerValue, QuestionDef, QuestionnaireDef, SubmitResult } from '../models/individual.model';

function newId(): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `seed-${rnd}`;
}

function appliesTo(q: QuestionDef, driver: string): boolean {
  return q.appliesTo === 'all' || q.appliesTo.includes(driver);
}

function showIfOk(q: QuestionDef, answers: Record<string, AnswerValue>): boolean {
  if (!q.showIf) return true;
  const prev = answers[q.showIf.questionId];
  if (prev === undefined || prev === null || prev === '') return false;
  const req = q.showIf.value;
  const actual = String(prev);
  return Array.isArray(req) ? req.includes(actual) : actual === req;
}

@Injectable()
export class IndividualStateService implements IndividualStateContract {
  private readonly data = inject(IndividualDataService);

  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly definition = signal<QuestionnaireDef | null>(null);
  readonly driverType = signal('');
  readonly answers = signal<Record<string, AnswerValue>>({});
  readonly clientSubmissionId = signal(newId());
  readonly result = signal<SubmitResult | null>(null);

  /** Secciones/preguntas que aplican al tipo de conductor y a las respuestas actuales. */
  readonly sections = computed<ActiveSection[]>(() => {
    const def = this.definition();
    const driver = this.driverType();
    const answers = this.answers();
    if (!def || !driver) return [];
    return def.sections
      .filter((s) => s.appliesTo === 'all' || (Array.isArray(s.appliesTo) && s.appliesTo.includes(driver)))
      .map((s) => ({
        id: s.id,
        title: s.title,
        questions: s.questions.filter((q) => appliesTo(q, driver) && showIfOk(q, answers)),
      }))
      .filter((s) => s.questions.length > 0);
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const def = await this.data.questionnaire();
      this.definition.set(def);
      if (def?.driverTypes?.length) this.setDriverType(def.driverTypes[0].id);
    } catch {
      this.error.set('No se pudo cargar la definición del cuestionario.');
    } finally {
      this.loading.set(false);
    }
  }

  setDriverType(id: string): void {
    this.driverType.set(id);
    this.answers.set({});
    this.clientSubmissionId.set(newId());
    this.result.set(null);
  }

  setAnswer(id: string, value: AnswerValue): void {
    this.answers.update((a) => ({ ...a, [id]: value }));
  }

  toggleAnswer(id: string, option: string): void {
    this.answers.update((a) => {
      const cur = Array.isArray(a[id]) ? (a[id] as string[]) : [];
      const next = cur.includes(option) ? cur.filter((x) => x !== option) : [...cur, option];
      return { ...a, [id]: next };
    });
  }

  async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      this.result.set(
        await this.data.create({
          driverType: this.driverType(),
          answers: this.answers(),
          clientSubmissionId: this.clientSubmissionId(),
        }),
      );
    } finally {
      this.busy.set(false);
    }
  }

  newSession(): void {
    this.clientSubmissionId.set(newId());
    this.answers.set({});
    this.result.set(null);
  }

  async remove(): Promise<void> {
    this.busy.set(true);
    try {
      await this.data.remove(this.clientSubmissionId());
      this.result.set(null);
    } finally {
      this.busy.set(false);
    }
  }
}
