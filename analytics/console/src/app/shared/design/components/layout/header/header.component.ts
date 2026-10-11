import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ds-header — structural page header container.
 * Pure structure (NO content logic): it lays out rows, sections and sub-sections.
 * Any ds-* element can be placed in ANY section/sub-section — structure is
 * separated from the components, giving full composability:
 *
 *   <ds-header>
 *     <div class="ds-h__row">                              ← fila
 *       <div class="ds-h__section ds-h__section--end">     ← sección (derecha)
 *         <ds-page-title title="..." subtitle="..."/>
 *       </div>
 *       <div class="ds-h__section">                        ← sección
 *         <ds-crud-actions mode="view"/>
 *       </div>
 *     </div>
 *     <div class="ds-h__row">
 *       <div class="ds-h__section">
 *         <div class="ds-h__subsection">                   ← subsección
 *           <ds-filter-bar/>
 *         </div>
 *       </div>
 *     </div>
 *   </ds-header>
 *
 * Modifiers: .ds-h__section--end (push right), .ds-h__section--grow (fill),
 * .ds-h__subsection (tight group). Structure lives HERE (the container);
 * components are placed inside, never the reverse.
 */
@Component({
  selector: 'ds-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ds-h',
    '[class.ds-h--sticky]': 'sticky()',
  },
  template: `<ng-content/>`,
  styles: `
    :host { display: flex; flex-direction: column; width: 100%; }
    :host.ds-h--sticky {
      position: sticky; top: 0; z-index: var(--ds-z-sticky);
      background: var(--ds-surface-body); box-shadow: var(--ds-shadow-sm);
    }
    :host ::ng-deep .ds-h__row {
      display: flex; flex-wrap: wrap; align-items: center;
      gap: var(--ds-space-4); width: 100%;
    }
    :host ::ng-deep .ds-h__section {
      display: flex; flex-direction: column;
      gap: var(--ds-space-1); flex: 0 1 auto; min-width: 0;
    }
    :host ::ng-deep .ds-h__section--end { margin-left: auto; }
    :host ::ng-deep .ds-h__section--grow { flex: 1 1 0%; min-width: 0; }
    :host ::ng-deep .ds-h__subsection {
      display: flex; flex-wrap: wrap; align-items: center;
      gap: var(--ds-space-2);
    }
  `,
})
export class DsHeaderComponent {
  readonly sticky = input(false);
}