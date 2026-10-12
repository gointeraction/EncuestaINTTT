import { Injectable, computed, inject, signal } from '@angular/core';
import { FilterStateService } from '../../../../../../core/filter-state.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import type { FilterQuestion, FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import { ReportesDataService } from '../data/reportes.data.service';
import type { ReportesStateContract } from '../contracts/reportes.state.contract';
import type { CrossTabResult, ReportQuestion, ReportSurveySource } from '../models/reportes.model';

@Injectable()
export class ReportesStateService implements ReportesStateContract {
  private readonly data = inject(ReportesDataService);
  private readonly filterState = inject(FilterStateService);
  private readonly active = inject(ActiveSurveyService);

  readonly sources = signal<ReportSurveySource[]>([]);
  readonly questions = signal<ReportQuestion[]>([]);
  readonly result = signal<CrossTabResult | null>(null);
  readonly surveyId = signal('');
  readonly q1 = signal('');
  readonly q2 = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filters = this.filterState.filters;
  readonly filterQuestions = computed<FilterQuestion[]>(() =>
    this.questions().map((q) => ({
      id: q.id, label: q.label, position: q.position,
      options: (q.options ?? []).map((o) => ({ value: o.value, label: o.value })),
    })),
  );

  /** Hay cruce cuando hay al menos 2 preguntas seleccionadas en los filtros. */
  readonly canCross = computed(() => this.filterState.filters().conditions.filter((c) => !!c.questionId).length >= 2);

  setFilters(filters: FilterSet): void {
    this.filterState.set(filters);
    // La TABLA se construye con las preguntas de los filtros (las 2 primeras = dimensiones).
    const qs = filters.conditions.map((c) => c.questionId).filter((id) => !!id);
    if (qs[0]) this.q1.set(qs[0]);
    if (qs[1]) this.q2.set(qs[1]);
    void this.run();
  }

  async loadSources(): Promise<void> {
    try {
      const sources = await this.data.sources();
      this.sources.set(sources);
      // Usa la ENCUESTA ACTIVA (selector del layout) o la primera, para no salir en blanco.
      if (sources.length > 0 && !this.surveyId()) {
        const activeId = this.active.activeId();
        const id = sources.some((s) => s.id === activeId) ? activeId : sources[0].id;
        await this.setSurvey(id);
      }
    } catch {
      this.error.set('No se pudieron cargar las encuestas.');
    }
  }

  async setSurvey(id: string): Promise<void> {
    this.surveyId.set(id);
    this.result.set(null);
    this.questions.set([]);
    if (!id) return;
    try {
      this.questions.set(await this.data.questions(id));
    } catch {
      this.error.set('No se pudieron cargar las preguntas.');
    }
  }

  setQ1(id: string): void {
    this.q1.set(id);
  }

  setQ2(id: string): void {
    this.q2.set(id);
  }

  async run(): Promise<void> {
    const surveyId = this.surveyId();
    const q1 = this.q1();
    const q2 = this.q2();
    if (!surveyId || !q1 || !q2) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const f = this.filterState.filters();
      const has = f.conditions.some((c) => c.questionId);
      this.result.set(has ? await this.data.crossTabFiltered(surveyId, q1, q2, f) : await this.data.crossTab(surveyId, q1, q2));
    } catch {
      this.error.set('No se pudo calcular el cruce.');
    } finally {
      this.loading.set(false);
    }
  }
}
