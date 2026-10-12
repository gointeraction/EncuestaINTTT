import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  DsButtonComponent,
  DsContainerComponent,
  DsHeaderComponent,
  DsPageTitleComponent,
  ThemeService,
} from '@cifraflow/design';
import { INDIVIDUAL_STATE, type IndividualStateContract } from './business/contracts/individual.state.contract';
import { IndividualStateService } from './business/state/individual.state.service';
import type { AnswerValue, QuestionDef } from './business/models/individual.model';

/**
 * @akuri-page
 * page: individual
 * route: /test-data/individual
 * view: VL1
 * function: FL3
 * spine: display > page > area(header|body) > section > content
 */
@Component({
  selector: 'app-individual-page',
  standalone: true,
  imports: [JsonPipe, DsContainerComponent, DsHeaderComponent, DsPageTitleComponent, DsButtonComponent],
  providers: [IndividualStateService, { provide: INDIVIDUAL_STATE, useExisting: IndividualStateService }],
  template: `
    <ds-container kind="page" name="individual">
      <ds-container kind="area" name="header" class="pg" style="padding-block: var(--ds-space-2)">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title
                title="Registro individual"
                subtitle="Agregar / quitar UNA encuesta · canal seed (development)"
                [showBack]="false"
              />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body" class="pg" style="padding-block: var(--ds-space-4)">
        @if (state.loading()) {
          <p>Cargando definición…</p>
        } @else if (state.definition(); as def) {
          <ds-container kind="section" name="ident" class="ind">
            <div class="ind__grid">
              <label class="ind__field">Tipo de conductor
                <select [value]="state.driverType()" (change)="state.setDriverType($any($event.target).value)">
                  @for (d of def.driverTypes; track d.id) { <option [value]="d.id">{{ d.label }}</option> }
                </select>
              </label>
              <label class="ind__field">Id de entrega (idempotencia)
                <input type="text" [value]="state.clientSubmissionId()" readonly />
              </label>
            </div>
            <div class="ind__actions">
              <ds-button size="sm" variant="secondary" (click)="state.newSession()">Nueva sesión (nuevo id)</ds-button>
            </div>
          </ds-container>

          @for (s of state.sections(); track s.id) {
            <ds-container kind="section" [name]="s.id" class="ind">
              <h3 class="ind__h">{{ s.title }}</h3>
              @for (q of s.questions; track q.id) {
                <div class="ind__q">
                  <label class="ind__label">{{ q.label }}</label>
                  @switch (q.type) {
                    @case ('radio') {
                      <select (change)="state.setAnswer(q.id, $any($event.target).value)">
                        <option value="">—</option>
                        @for (o of q.options; track o) {
                          <option [value]="o" [selected]="val(q.id) === o">{{ o }}</option>
                        }
                      </select>
                    }
                    @case ('select') {
                      <select (change)="state.setAnswer(q.id, $any($event.target).value)">
                        <option value="">—</option>
                        @for (o of q.options; track o) {
                          <option [value]="o" [selected]="val(q.id) === o">{{ o }}</option>
                        }
                      </select>
                    }
                    @case ('checkbox') {
                      <div class="ind__opts">
                        @for (o of q.options; track o) {
                          <label class="ind__opt">
                            <input type="checkbox" [checked]="hasOption(q.id, o)"
                              (change)="state.toggleAnswer(q.id, o)" /> {{ o }}
                          </label>
                        }
                      </div>
                    }
                    @case ('scale') {
                      <select (change)="state.setAnswer(q.id, +$any($event.target).value)">
                        <option value="">—</option>
                        @for (n of scale(q); track n) {
                          <option [value]="n" [selected]="val(q.id) === n">{{ n }}</option>
                        }
                      </select>
                    }
                    @case ('number') {
                      <input type="number" [value]="val(q.id) ?? ''"
                        (input)="state.setAnswer(q.id, +$any($event.target).value)" />
                    }
                    @case ('textarea') {
                      <textarea rows="2" [value]="val(q.id) ?? ''"
                        (input)="state.setAnswer(q.id, $any($event.target).value)"></textarea>
                    }
                    @case ('estado-municipio') {
                      <div class="ind__two">
                        <input type="text" placeholder="Estado" [value]="state.answers()['estado'] ?? ''"
                          (input)="state.setAnswer('estado', $any($event.target).value)" />
                        <input type="text" placeholder="Municipio" [value]="state.answers()['municipio'] ?? ''"
                          (input)="state.setAnswer('municipio', $any($event.target).value)" />
                      </div>
                    }
                    @default {
                      <input type="text" [value]="val(q.id) ?? ''"
                        (input)="state.setAnswer(q.id, $any($event.target).value)" />
                    }
                  }
                </div>
              }
            </ds-container>
          }

          <ds-container kind="section" name="acciones" class="ind">
            <div class="ind__actions">
              <ds-button [loading]="state.busy()" (click)="state.submit()">Enviar (canal seed)</ds-button>
              <ds-button variant="secondary" [loading]="state.busy()" (click)="state.submit()">
                Reenviar (mismo id)
              </ds-button>
              <ds-button variant="destructive" [loading]="state.busy()" (click)="state.remove()">
                Quitar (borrar por id)
              </ds-button>
            </div>

            @if (state.result(); as r) {
              <div class="ind__result" [class.ind__result--ok]="r.ok" role="status">
                <b>HTTP {{ r.status }}</b>
                @if (r.body['duplicate']) {
                  <span> · duplicado detectado (idempotencia); no se creó otra fila.</span>
                } @else if (r.body['id']) {
                  <span> · creada <code>{{ r.body['id'] }}</code></span>
                } @else if (r.body['error']) {
                  <span> · {{ r.body['error'] }}</span>
                }
                <pre class="ind__json">{{ r.body | json }}</pre>
              </div>
            }
            @if (state.error(); as e) { <p class="ind__err">{{ e }}</p> }
          </ds-container>
        }
      </ds-container>
    </ds-container>
  `,
  styles: `
    .ind { max-width: 900px; display: flex; flex-direction: column; gap: var(--ds-space-3); margin-top: var(--ds-space-5); }
    .ind:first-child { margin-top: 0; }
    .ind__h { margin: 0; font-size: var(--ds-text-heading-4); color: var(--ds-surface-page-on); }
    .ind__grid { display: grid; gap: var(--ds-space-4); grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .ind__field { display: flex; flex-direction: column; gap: var(--ds-space-1); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .ind__field input, .ind__field select, .ind__q input, .ind__q select, .ind__q textarea {
      padding: var(--ds-space-2); border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-md); font-size: var(--ds-text-input); font-family: inherit;
      color: var(--ds-surface-page-on); background: var(--ds-surface-card);
    }
    .ind__q { display: grid; gap: var(--ds-space-1); grid-template-columns: minmax(200px, 1fr) minmax(200px, 1fr); align-items: center; }
    .ind__label { font-size: var(--ds-text-small); color: var(--ds-surface-page-on); }
    .ind__opts { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
    .ind__opt { display: flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-text-small); }
    .ind__two { display: flex; gap: var(--ds-space-2); }
    .ind__actions { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
    .ind__err { color: var(--ds-color-state-danger); font-size: var(--ds-text-small); }
    .ind__result { padding: var(--ds-space-3); border-radius: var(--ds-radius-md); background: var(--ds-color-state-danger-100); color: var(--ds-surface-page-on); font-size: var(--ds-text-small); }
    .ind__result--ok { background: var(--ds-color-state-success-100); }
    .ind__json { margin: var(--ds-space-2) 0 0; font-size: var(--ds-text-caption); white-space: pre-wrap; word-break: break-word; }
  `,
})
export class IndividualPage {
  readonly state: IndividualStateContract = inject(INDIVIDUAL_STATE);

  constructor() {
    inject(ThemeService).pageMetadata.set({
      page: 'individual',
      ui: { view: 'VL1' },
      logic: { function: 'FL3' },
      seo: { title: 'Registro individual · INTT' },
    });
    void this.state.load();
  }

  val(id: string): AnswerValue | undefined {
    return this.state.answers()[id];
  }

  hasOption(id: string, option: string): boolean {
    const v = this.state.answers()[id];
    return Array.isArray(v) && v.includes(option);
  }

  scale(q: QuestionDef): number[] {
    const min = q.scaleMin ?? 1;
    const max = q.scaleMax ?? 5;
    const out: number[] = [];
    for (let n = min; n <= max; n++) out.push(n);
    return out;
  }
}
