import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../shared/api-sdk';

interface SurveySource {
  id: string;
  title: string;
}
interface Question {
  id: string;
  label: string;
}
interface CrossTab {
  categoriesA: string[];
  categoriesB: string[];
  cells: Array<{ v1: string; v2: string; n: number }>;
}

@Component({
  selector: 'app-reportes-cruzados',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Reportes cruzados</h1>
    <label>Encuesta
      <select [(ngModel)]="surveyId" (ngModelChange)="onSurvey()">
        <option value="">Seleccione…</option>
        @for (s of fuentes(); track s.id) { <option [value]="s.id">{{ s.title }}</option> }
      </select>
    </label>

    @if (questions().length) {
      <p>
        <label>Pregunta A
          <select [(ngModel)]="q1">
            @for (q of questions(); track q.id) { <option [value]="q.id">{{ q.label }}</option> }
          </select>
        </label>
        <label>Pregunta B
          <select [(ngModel)]="q2">
            @for (q of questions(); track q.id) { <option [value]="q.id">{{ q.label }}</option> }
          </select>
        </label>
        <button type="button" (click)="run()">Cruzar</button>
      </p>
    }

    @if (result(); as r) {
      <table>
        <thead>
          <tr><th></th>@for (c of r.categoriesB; track c) { <th>{{ c }}</th> }</tr>
        </thead>
        <tbody>
          @for (ra of r.categoriesA; track ra) {
            <tr>
              <th>{{ ra }}</th>
              @for (cb of r.categoriesB; track cb) { <td>{{ cell(ra, cb) }}</td> }
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class ReportesCruzadosComponent {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);
  readonly fuentes = signal<SurveySource[]>([]);
  readonly questions = signal<Question[]>([]);
  readonly result = signal<CrossTab | null>(null);
  surveyId = '';
  q1 = '';
  q2 = '';

  constructor() {
    void this.loadSources();
  }

  async loadSources(): Promise<void> {
    const r = await firstValueFrom(this.api.publicReadControllerListSurveys());
    this.fuentes.set((r as unknown as SurveySource[]) ?? []);
  }

  async onSurvey(): Promise<void> {
    this.result.set(null);
    this.questions.set([]);
    if (!this.surveyId) return;
    const d = (await firstValueFrom(
      this.api.reportingControllerSurvey(this.surveyId),
    )) as unknown as { questions?: Question[] };
    this.questions.set(d?.questions ?? []);
  }

  async run(): Promise<void> {
    if (!this.surveyId || !this.q1 || !this.q2) return;
    const r = await firstValueFrom(
      this.api.reportingControllerCrossTab(this.surveyId, { q1: this.q1, q2: this.q2 }),
    );
    this.result.set((r as unknown as CrossTab) ?? null);
  }

  cell(a: string, b: string): number {
    return this.result()?.cells.find((c) => c.v1 === a && c.v2 === b)?.n ?? 0;
  }
}
