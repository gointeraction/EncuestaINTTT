import { Injectable, computed, inject, signal } from '@angular/core';
import { PanelDataService } from '../data/panel.data.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import { FilterStateService } from '../../../../../../core/filter-state.service';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type { PanelStateContract } from '../contracts/panel.state.contract';
import type {
  FilterDimension,
  QuestionAnalytics,
  SurveyPayload,
  SurveySource,
} from '../models/panel.model';

@Injectable()
export class PanelStateService implements PanelStateContract {
  private readonly data = inject(PanelDataService);
  private readonly active = inject(ActiveSurveyService);
  private readonly filterState = inject(FilterStateService);

  readonly sources = signal<SurveySource[]>([]);
  readonly dashboard = signal<SurveyPayload | null>(null);
  readonly dimensions = signal<FilterDimension[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly typeFilter = signal('');
  readonly dimensionId = signal('');
  readonly dimensionValue = signal('');

  readonly filters = this.filterState.filters;
  /** Catálogo SIN filtrar (todas las opciones) para el constructor de filtros. */
  private readonly catalog = signal<QuestionAnalytics[]>([]);
  readonly filtering = signal(false);

  /** Preguntas filtrables: id/etiqueta/posición + sus opciones (por etiqueta visible). */
  readonly filterQuestions = computed<FilterQuestion[]>(() =>
    this.catalog().map((q) => ({
      id: q.id,
      label: q.label,
      position: q.position,
      options: (q.options ?? []).map((o) => ({ value: o.value, label: o.value })),
    })),
  );

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

  async loadSources(initialQuestionId = ''): Promise<void> {
    const sources = await this.data.loadSources();
    this.sources.set(sources);
    // Usa la ENCUESTA ACTIVA (selector del layout) o la primera, para no salir en blanco.
    if (sources.length > 0 && !this._surveyId()) {
      const activeId = this.active.activeId();
      const id = sources.some((s) => s.id === activeId) ? activeId : sources[0].id;
      await this.selectSurvey(id);
    }
    // Deep-link del catálogo: enfoca la pregunta indicada (`/panel?q=<id>`).
    if (initialQuestionId) this._questionId.set(initialQuestionId);
  }

  setFilters(filters: FilterSet): void {
    this.filterState.set(filters);
  }

  async applyFilters(): Promise<void> {
    const surveyId = this._surveyId();
    if (!surveyId) return;
    this.filtering.set(true);
    try {
      const f = this.filters();
      const conditions = f.conditions.filter((c) => c.questionId);
      const payload =
        conditions.length === 0
          ? await this.data.loadSurvey(surveyId)
          : await this.data.loadFiltered(surveyId, f);
      this.dashboard.set(payload);
    } finally {
      this.filtering.set(false);
    }
  }

  async selectSurvey(id: string): Promise<void> {
    this._surveyId.set(id);
    this._questionId.set('');
    this.dimensionId.set('');
    this.dimensionValue.set('');
    if (!id) {
      this.dashboard.set(null);
      this.dimensions.set([]);
      return;
    }
    this.loading.set(true);
    try {
      const [dashboard, dimensions] = await Promise.all([
        this.data.loadSurvey(id),
        this.data.loadDimensions(id),
      ]);
      this.dashboard.set(dashboard);
      this.catalog.set(dashboard?.questions ?? []);
      this.dimensions.set(dimensions);
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
