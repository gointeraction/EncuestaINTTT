import { Injectable, computed, inject, signal } from '@angular/core';
import { PanelDataService } from '../data/panel.data.service';
import type { PanelStateContract } from '../contracts/panel.state.contract';
import type {
  FilterDimension,
  QuestionAnalytics,
  SurveyPayload,
  SurveySource,
  TimelinePoint,
} from '../models/panel.model';

@Injectable()
export class PanelStateService implements PanelStateContract {
  private readonly data = inject(PanelDataService);

  readonly sources = signal<SurveySource[]>([]);
  readonly dashboard = signal<SurveyPayload | null>(null);
  readonly dimensions = signal<FilterDimension[]>([]);
  readonly timeline = signal<TimelinePoint[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly typeFilter = signal('');
  readonly dimensionId = signal('');
  readonly dimensionValue = signal('');

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
    this.dimensionId.set('');
    this.dimensionValue.set('');
    if (!id) {
      this.dashboard.set(null);
      this.dimensions.set([]);
      this.timeline.set([]);
      return;
    }
    this.loading.set(true);
    try {
      const [dashboard, dimensions, timeline] = await Promise.all([
        this.data.loadSurvey(id),
        this.data.loadDimensions(id),
        this.data.loadTimeline(id),
      ]);
      this.dashboard.set(dashboard);
      this.dimensions.set(dimensions);
      this.timeline.set(timeline);
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

  /** Aplica (o quita) un segmento: recarga el panel acotado por `dimension = value`. */
  async setDimension(dimensionId: string, value: string): Promise<void> {
    if (dimensionId === this.dimensionId() && value === this.dimensionValue()) return;
    this.dimensionId.set(dimensionId);
    this.dimensionValue.set(value);
    this._questionId.set('');
    const surveyId = this._surveyId();
    if (!surveyId) return;
    this.loading.set(true);
    try {
      this.dashboard.set(
        dimensionId && value
          ? await this.data.loadSurvey(surveyId, { dimension: dimensionId, value })
          : await this.data.loadSurvey(surveyId),
      );
    } finally {
      this.loading.set(false);
    }
  }
}
