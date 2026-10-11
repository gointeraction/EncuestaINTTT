import { Injectable, inject, signal } from '@angular/core';
import { ReportesDataService } from '../data/reportes.data.service';
import type { ReportesStateContract } from '../contracts/reportes.state.contract';
import type { CrossTabResult, ReportQuestion, ReportSurveySource } from '../models/reportes.model';

@Injectable()
export class ReportesStateService implements ReportesStateContract {
  private readonly data = inject(ReportesDataService);

  readonly sources = signal<ReportSurveySource[]>([]);
  readonly questions = signal<ReportQuestion[]>([]);
  readonly result = signal<CrossTabResult | null>(null);
  readonly surveyId = signal('');
  readonly q1 = signal('');
  readonly q2 = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadSources(): Promise<void> {
    try {
      this.sources.set(await this.data.sources());
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
      this.result.set(await this.data.crossTab(surveyId, q1, q2));
    } catch {
      this.error.set('No se pudo calcular el cruce.');
    } finally {
      this.loading.set(false);
    }
  }
}
