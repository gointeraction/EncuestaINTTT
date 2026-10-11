import { Injectable, computed, inject, signal } from '@angular/core';
import { PreguntasDataService } from '../data/preguntas.data.service';
import type { PreguntasStateContract } from '../contracts/preguntas.state.contract';
import {
  questionBase,
  visualForm,
  type PreguntasSource,
  type QuestionAnalytics,
  type QuestionRow,
} from '../models/preguntas.model';

@Injectable()
export class PreguntasStateService implements PreguntasStateContract {
  private readonly data = inject(PreguntasDataService);

  readonly sources = signal<PreguntasSource[]>([]);
  readonly title = signal('Cuestionario');
  readonly search = signal('');
  readonly typeFilter = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly questions = signal<QuestionAnalytics[]>([]);

  readonly rows = computed<QuestionRow[]>(() => {
    const text = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    return this.questions()
      .filter(
        (q) => (!text || q.label.toLowerCase().includes(text)) && (!type || q.type === type),
      )
      .map((q, i) => ({
        id: q.id,
        position: i + 1,
        label: q.label,
        type: q.type,
        visual: visualForm(q),
        base: questionBase(q),
      }));
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const sources = await this.data.sources();
      this.sources.set(sources);
      if (sources.length === 0) return;
      const surveyId = sources[0].id;
      this.title.set(sources[0].title);
      this.questions.set(await this.data.questions(surveyId));
    } catch {
      this.error.set('No se pudo cargar el catálogo de preguntas.');
    } finally {
      this.loading.set(false);
    }
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setType(value: string): void {
    this.typeFilter.set(value);
  }
}
