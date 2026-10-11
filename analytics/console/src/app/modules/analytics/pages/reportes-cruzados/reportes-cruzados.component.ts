import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DsContainerComponent, DsHeaderComponent, DsPageTitleComponent } from '@cifraflow/design';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../shared/api-sdk';

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
  imports: [FormsModule, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent],
  template: `
    <ds-container kind="page" name="reportes-cruzados">
      <ds-container kind="area" name="header">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Reportes cruzados" subtitle="Analítica · INTT" [showBack]="false" />
            </div>
            <div class="ds-h__section ds-h__section--end">
              <label>Encuesta
                <select [(ngModel)]="surveyId" (ngModelChange)="onSurvey()">
                  <option value="">Seleccione…</option>
                  @for (s of fuentes(); track s.id) { <option [value]="s.id">{{ s.title }}</option> }
                </select>
              </label>
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body">
        <ds-container kind="section" name="controles">
          @if (questions().length) {
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
          }
        </ds-container>

        @if (result(); as r) {
          <ds-container kind="section" name="cruce">
            <table>
              <thead><tr><th></th>@for (c of r.categoriesB; track c) { <th>{{ c }}</th> }</tr></thead>
              <tbody>
                @for (ra of r.categoriesA; track ra) {
                  <tr><th>{{ ra }}</th>@for (cb of r.categoriesB; track cb) { <td>{{ cell(ra, cb) }}</td> }</tr>
                }
              </tbody>
            </table>
          </ds-container>
        }
      </ds-container>
    </ds-container>
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
