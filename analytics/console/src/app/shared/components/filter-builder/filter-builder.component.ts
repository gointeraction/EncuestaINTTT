import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export interface FilterOption {
  value: string;
  label: string;
}
export interface FilterQuestion {
  id: string;
  label: string;
  position?: number;
  options: FilterOption[];
}
export interface FilterCondition {
  id: string;
  questionId: string;
  values: string[];
}
export interface FilterSet {
  combinator: 'and' | 'or';
  conditions: FilterCondition[];
}

/**
 * Constructor de FILTROS reutilizable: filas de [pregunta (typeahead) + valores (multi)],
 * combinadas con Y/O. El usuario ve lo mismo por lo que puede filtrar (etiquetas).
 * Emite `valueChange` con el conjunto de filtros (sin valores = todas las opciones).
 */
@Component({
  selector: 'app-filter-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fb">
      @for (c of value().conditions; track c.id) {
        <div class="fb__row">
          <div class="fb__q">
            <input
              class="fb__input"
              type="text"
              placeholder="Escribe para buscar la pregunta…"
              [value]="queryFor(c.id)"
              (input)="onQuery(c.id, $any($event.target).value)"
              (focus)="open(c.id)"
              (blur)="closeSoon()"
            />
            @if (opened() === c.id) {
              <ul class="fb__list">
                @for (q of matches(c.id); track q.id) {
                  <li><button type="button" (mousedown)="pick(c.id, q.id)">{{ qLabel(q) }}</button></li>
                } @empty {
                  <li class="fb__empty">Sin coincidencias</li>
                }
              </ul>
            }
          </div>

          <div class="fb__vals">
            @if (!c.questionId) {
              <span class="fb__hint">Elige una pregunta…</span>
            } @else if (optionsOf(c.questionId).length === 0) {
              <span class="fb__hint">Esta pregunta no tiene opciones discretas.</span>
            } @else {
              <div class="fb__chips">
                @for (o of optionsOf(c.questionId); track o.value) {
                  <label class="fb__chip" [class.fb__chip--on]="isOn(c, o.value)">
                    <input type="checkbox" [checked]="isOn(c, o.value)" (change)="toggle(c.id, o.value)" />
                    {{ o.label }}
                  </label>
                }
              </div>
            }
          </div>

          <button type="button" class="fb__del" title="Quitar" (click)="remove(c.id)">×</button>
        </div>
      }

      @if (value().conditions.length === 0) {
        <p class="fb__hint">Sin filtros → se muestran TODAS las opciones.</p>
      }

      <div class="fb__bar">
        <button type="button" class="fb__add" (click)="add()">+ Añadir filtro</button>
        @if (value().conditions.length > 1) {
          <span class="fb__lbl">Combinar los filtros:</span>
          <label class="fb__radio">
            <input type="radio" name="fbcomb" [checked]="value().combinator === 'and'" (change)="setCombinator('and')" />
            Y (todas)
          </label>
          <label class="fb__radio">
            <input type="radio" name="fbcomb" [checked]="value().combinator === 'or'" (change)="setCombinator('or')" />
            O (alguna)
          </label>
        }
      </div>
    </div>
  `,
  styles: `
    .fb { display: flex; flex-direction: column; gap: var(--ds-space-3); }
    .fb__bar { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ds-space-4); font-size: var(--ds-text-small); color: var(--ds-text-muted); }
    .fb__lbl { font-weight: 600; }
    .fb__radio { display: inline-flex; align-items: center; gap: 0.35rem; }
    .fb__add { padding: 0.35rem 0.75rem; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-surface-card); color: var(--ds-surface-card-on); cursor: pointer; font-family: inherit; }
    .fb__row { display: grid; grid-template-columns: minmax(240px, 1fr) minmax(240px, 1.4fr) auto; gap: var(--ds-space-3); align-items: start; }
    .fb__q { position: relative; }
    .fb__input { width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-bg-field); color: var(--ds-surface-body-on); font-size: 0.875rem; font-family: inherit; }
    .fb__input:focus { outline: none; border-color: var(--ds-color-brand-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ds-color-brand-primary) 18%, transparent); }
    .fb__list { position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 2px); max-height: 260px; overflow: auto; margin: 0; padding: 0.25rem; list-style: none; background: var(--ds-surface-card); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-md); box-shadow: var(--ds-shadow-md); }
    .fb__list button { display: block; width: 100%; text-align: left; border: none; background: none; padding: 0.35rem 0.5rem; cursor: pointer; color: var(--ds-surface-card-on); font-size: var(--ds-text-small); font-family: inherit; border-radius: var(--ds-radius-sm); }
    .fb__list button:hover { background: var(--ds-surface-subtle); }
    .fb__empty { padding: 0.35rem 0.5rem; color: var(--ds-text-muted); font-size: var(--ds-text-small); }
    .fb__vals { border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-bg-field); min-height: 40px; }
    .fb__chips { display: flex; flex-wrap: wrap; gap: 0.35rem; padding: 0.4rem; max-height: 128px; overflow: auto; }
    .fb__chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.55rem; border: 1px solid var(--ds-border-subtle); border-radius: 999px; font-size: var(--ds-text-caption); color: var(--ds-surface-body-on); cursor: pointer; }
    .fb__chip--on { border-color: var(--ds-color-brand-primary); background: color-mix(in srgb, var(--ds-color-brand-primary) 12%, transparent); }
    .fb__chip input { margin: 0; }
    .fb__hint { display: inline-block; padding: 0.5rem 0.75rem; color: var(--ds-text-muted); font-size: var(--ds-text-small); }
    .fb__del { padding: 0.35rem 0.6rem; border: 1px solid var(--ds-border-input); border-radius: var(--ds-radius-standard); background: var(--ds-surface-card); color: var(--ds-color-state-danger); cursor: pointer; font-size: 1rem; line-height: 1; }
  `,
})
export class FilterBuilderComponent {
  readonly questions = input<FilterQuestion[]>([]);
  readonly value = input.required<FilterSet>();
  readonly valueChange = output<FilterSet>();

  private readonly queries = signal<Record<string, string>>({});
  readonly opened = signal<string>('');

  private seq = 0;

  matches(id: string): FilterQuestion[] {
    const text = (this.queries()[id] ?? '').trim().toLowerCase();
    return this.questions()
      .filter((q) => !text || this.labelOf(q).toLowerCase().includes(text))
      .slice(0, 50);
  }

  queryFor(id: string): string {
    const typed = this.queries()[id] ?? '';
    if (typed) return typed;
    const c = this.value().conditions.find((x) => x.id === id);
    const q = c?.questionId ? this.questions().find((x) => x.id === c.questionId) : undefined;
    return q ? this.qLabel(q) : '';
  }

  qLabel(q: FilterQuestion): string {
    return (q.position ? q.position + '. ' : '') + q.label;
  }

  private labelOf(q: FilterQuestion): string {
    return q.label;
  }

  optionsOf(qid: string): FilterOption[] {
    return this.questions().find((q) => q.id === qid)?.options ?? [];
  }

  isOn(c: FilterCondition, v: string): boolean {
    return c.values.includes(v);
  }

  private emit(set: FilterSet): void {
    this.valueChange.emit(set);
  }

  private update(mut: (s: FilterSet) => FilterSet): void {
    this.emit(mut(this.value()));
  }

  setCombinator(c: 'and' | 'or'): void {
    this.update((s) => ({ ...s, combinator: c }));
  }

  add(): void {
    this.seq += 1;
    const id = `f${Date.now().toString(36)}-${this.seq}`;
    this.update((s) => ({ ...s, conditions: [...s.conditions, { id, questionId: '', values: [] }] }));
  }

  remove(id: string): void {
    this.update((s) => ({ ...s, conditions: s.conditions.filter((c) => c.id !== id) }));
  }

  open(id: string): void {
    this.opened.set(id);
  }

  closeSoon(): void {
    setTimeout(() => this.opened.set(''), 150);
  }

  onQuery(id: string, text: string): void {
    this.queries.update((q) => ({ ...q, [id]: text }));
    this.opened.set(id);
  }

  pick(id: string, questionId: string): void {
    this.queries.update((q) => ({ ...q, [id]: '' }));
    this.opened.set('');
    this.update((s) => ({
      ...s,
      conditions: s.conditions.map((c) => (c.id === id ? { ...c, questionId, values: [] } : c)),
    }));
  }

  toggle(id: string, value: string): void {
    this.update((s) => ({
      ...s,
      conditions: s.conditions.map((c) =>
        c.id === id
          ? { ...c, values: c.values.includes(value) ? c.values.filter((v) => v !== value) : [...c.values, value] }
          : c,
      ),
    }));
  }
}
