import { Injectable, computed, inject, signal } from '@angular/core';
import { PanelDataService } from '../data/panel.data.service';
import type { PanelStateContract } from '../contracts/panel.state.contract';
import type { QuestionAnalytics, SurveyPayload, SurveySource } from '../models/panel.model';

@Injectable()
export class PanelStateService implements PanelStateContract {
  private readonly data = inject(PanelDataService);

  readonly sources = signal<SurveySource[]>([]);
  readonly dashboard = signal<SurveyPayload | null>(null);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly typeFilter = signal('');

  private readonly _surveyId = signal('');
  private readonly _questionId = signal('');
  readonly surveyId = this._surveyId.asReadonly();

  /** Preguntas visibles según búsqueda (etiqueta) y tipo. */
  readonly filtered = computed<QuestionAnalytics[]>(() => {
    const questions = this.dashboard()?.questions ?? [];
    const text = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    return questions.filter(
      (q) =>
        (!text || q.label.toLowerCase().includes(text)) &&
        (!type || q.type === type),
    );
  });

  /** Pregunta enfocada (la elegida o la primera del subconjunto filtrado). */
  readonly selected = computed<QuestionAnalytics | null>(() => {
    const list = this.filtered();
    const id = this._questionId();
    return list.find((q) => q.id === id) ?? list[0] ?? null;
  });

  async loadSources(): Promise<void> {
    this.sources.set(await this.data.loadSources());
  }

  async selectSurvey(id: string): Promise<void> {
    this._surveyId.set(id);
    this._questionId.set('');
    if (!id) {
      this.dashboard.set(null);
      return;
    }
    this.loading.set(true);
    try {
      this.dashboard.set(await this.data.loadSurvey(id));
    } finally {
      this.loading.set(false);
    }
  }

  setSearch(value: string): void {
    this.search.set(value);
    this._questionId.set('');
  }

  setType(value: string): void {
    this.typeFilter.set(value);
    this._questionId.set('');
  }

  setQuestion(id: string): void {
    this._questionId.set(id);
  }
}
