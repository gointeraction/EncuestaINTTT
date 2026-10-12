import { Injectable, signal } from '@angular/core';
import type { BuilderStateContract } from '../contracts/builder.state.contract';
import type { QuestionDraft, QuestionType, SurveyDraft } from '../models/builder.model';

let seq = 0;

@Injectable()
export class BuilderStateService implements BuilderStateContract {
  readonly draft = signal<SurveyDraft>({ title: '', slug: '', description: '' });
  readonly questions = signal<QuestionDraft[]>([]);
  readonly notice = signal<string | null>(null);

  setTitle(value: string): void {
    this.draft.update((d) => ({ ...d, title: value }));
  }
  setSlug(value: string): void {
    this.draft.update((d) => ({ ...d, slug: value }));
  }
  setDescription(value: string): void {
    this.draft.update((d) => ({ ...d, description: value }));
  }

  addQuestion(): void {
    const q: QuestionDraft = {
      id: `q${++seq}`,
      label: '',
      type: 'single_choice',
      options: [],
    };
    this.questions.update((list) => [...list, q]);
  }

  removeQuestion(id: string): void {
    this.questions.update((list) => list.filter((q) => q.id !== id));
  }

  private patch(id: string, patch: Partial<QuestionDraft>): void {
    this.questions.update((list) => list.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  setQuestionLabel(id: string, value: string): void {
    this.patch(id, { label: value });
  }

  setQuestionType(id: string, value: QuestionType): void {
    this.patch(id, { type: value });
  }

  setQuestionOptions(id: string, value: string): void {
    const options = value
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    this.patch(id, { options });
  }

  save(): void {
    const d = this.draft();
    if (!d.title.trim() || !d.slug.trim()) {
      this.notice.set('Completa el título y el identificador (slug) de la encuesta.');
      return;
    }
    this.notice.set(
      `Borrador listo: «${d.title}» con ${this.questions().length} pregunta(s). ` +
        'La persistencia del cuestionario es el siguiente paso.',
    );
  }
}
