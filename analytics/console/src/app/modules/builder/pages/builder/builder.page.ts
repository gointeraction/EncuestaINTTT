import { Component, inject } from '@angular/core';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { BUILDER_STATE, type BuilderStateContract } from './business/contracts/builder.state.contract';
import { BuilderStateService } from './business/state/builder.state.service';
import { QUESTION_TYPES, type QuestionType } from './business/models/builder.model';

/**
 * @akuri-page
 * page: builder
 * route: /builder
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-builder-page',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [BuilderStateService, { provide: BUILDER_STATE, useExisting: BuilderStateService }],
  template: `
    <ds-container kind="page" name="builder">
      <ds-container kind="area" name="header" class="pg" style="padding-block: var(--ds-space-2)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Constructor de encuestas"
                subtitle="Crea una encuesta y su cuestionario · INTT"
                [showBack]="false"
              />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="pg" style="padding-block: var(--ds-space-4)">
        <ds-container kind="section" name="datos" class="bl">
          <h3 class="bl__h">Datos de la encuesta</h3>
          <div class="bl__grid">
            <label class="bl__field">Título
              <input type="text" placeholder="p.ej. Visión Cero — Motocicletas"
                [value]="state.draft().title"
                (input)="state.setTitle($any($event.target).value)" />
            </label>
            <label class="bl__field">Identificador (slug)
              <input type="text" placeholder="p.ej. vision-cero"
                [value]="state.draft().slug"
                (input)="state.setSlug($any($event.target).value)" />
            </label>
          </div>
          <label class="bl__field">Descripción
            <textarea rows="2" placeholder="Objetivo de la encuesta"
              [value]="state.draft().description"
              (input)="state.setDescription($any($event.target).value)"></textarea>
          </label>
        </ds-container>

        <ds-container kind="section" name="cuestionario" class="bl">
          <div class="bl__row">
            <h3 class="bl__h">Cuestionario · {{ state.questions().length }} pregunta(s)</h3>
            <ds-button size="sm" variant="secondary" (click)="state.addQuestion()">
              Añadir pregunta
            </ds-button>
          </div>

          @if (state.questions().length === 0) {
            <p class="bl__meta">Aún no hay preguntas. Pulsa «Añadir pregunta».</p>
          } @else {
            <ol class="bl__questions">
              @for (q of state.questions(); track q.id; let i = $index) {
                <li class="bl__q">
                  <span class="bl__qnum">{{ i + 1 }}</span>
                  <div class="bl__qbody">
                    <input type="text" placeholder="Enunciado de la pregunta"
                      [value]="q.label"
                      (input)="state.setQuestionLabel(q.id, $any($event.target).value)" />
                    <div class="bl__qrow">
                      <select [value]="q.type" (change)="state.setQuestionType(q.id, $any($event.target).value)">
                        @for (t of types; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                      @if (q.type === 'single_choice' || q.type === 'multi_choice') {
                        <input type="text" placeholder="Opciones separadas por coma"
                          [value]="q.options.join(', ')"
                          (input)="state.setQuestionOptions(q.id, $any($event.target).value)" />
                      }
                      <ds-button size="sm" variant="danger" (click)="state.removeQuestion(q.id)">
                        Quitar
                      </ds-button>
                    </div>
                  </div>
                </li>
              }
            </ol>
          }

          @if (state.notice(); as n) { <p class="bl__notice" role="status">{{ n }}</p> }

          <div class="bl__actions">
            <ds-button (click)="state.save()">Guardar borrador</ds-button>
          </div>
        </ds-container>
      </ds-container>
    </ds-container>
  `,
  styles: `
    .bl { max-width: 1000px; display: flex; flex-direction: column; gap: var(--ds-space-3); margin-top: var(--ds-space-5); }
    .bl:first-child { margin-top: 0; }
    .bl__h { margin: 0; font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .bl__row { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
    .bl__grid { display: grid; gap: var(--ds-space-4); grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .bl__field { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .bl__field input, .bl__field textarea, .bl__q input, .bl__q select {
      padding: var(--ds-space-2); border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-md); font-size: var(--ds-text-input); font-family: inherit;
      color: var(--ds-surface-page-on); background: var(--ds-surface-card);
    }
    .bl__meta { margin: 0; font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .bl__questions { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-3); }
    .bl__q { display: flex; gap: var(--ds-space-3); padding: var(--ds-space-3); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-lg); }
    .bl__qnum { flex-shrink: 0; width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--ds-surface-subtle); font-size: var(--ds-text-small); font-weight: 700; }
    .bl__qbody { flex: 1; display: flex; flex-direction: column; gap: var(--ds-space-2); }
    .bl__qrow { display: flex; gap: var(--ds-space-2); align-items: center; flex-wrap: wrap; }
    .bl__qrow input { flex: 1; min-width: 160px; }
    .bl__notice { margin: 0; font-size: var(--ds-text-small); color: var(--ds-color-state-info); }
    .bl__actions { display: flex; gap: var(--ds-space-3); }
  `,
})
export class BuilderPage {
  readonly state: BuilderStateContract = inject(BUILDER_STATE);
  protected readonly types = QUESTION_TYPES;

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'builder',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Constructor de encuestas · INTT' },
    });
  }

  protected asType(v: string): QuestionType {
    return v as QuestionType;
  }
}
