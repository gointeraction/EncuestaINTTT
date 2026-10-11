import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DsFormGridCols = 1 | 2 | 4 | 6;

/**
 * ds-form-grid — retícula de columnas del formulario (standalone + OnPush).
 * Form family (`components/form/`). DS-FORMS-001 §2: los elementos del form se
 * despliegan en 1, 2, 4 o 6 columnas, separados por gap horizontal y vertical.
 * `cols` ∈ {1,2,4,6}; por debajo de 640px colapsa a 1 columna. Los gaps usan
 * tokens (--ds-gap-*), nunca magic numbers.
 */
@Component({
  selector: 'ds-form-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style]': 'gridStyle()' },
  template: `<ng-content/>`,
  styles: `
    :host { display: grid; align-items: start; }
    /* = var(--ds-breakpoint-mobile) (strict <640) */
    @media (max-width: 639.98px) { :host { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; } }
  `,
})
export class DsFormGridComponent {
  /** Columnas de la retícula: 1 | 2 | 4 | 6 (DS-FORMS-001 §2). */
  readonly cols = input<DsFormGridCols>(1);
  /** Gap vertical entre filas (token por defecto: --ds-gap-lg). */
  readonly gapV = input('var(--ds-gap-lg)');
  /** Gap horizontal entre columnas (token por defecto: --ds-gap-xl). */
  readonly gapH = input('var(--ds-gap-xl)');

  protected readonly gridStyle = computed(() => ({
    'grid-template-columns': `repeat(${this.cols()}, minmax(0, 1fr))`,
    gap: `${this.gapV()} ${this.gapH()}`,
  }));
}