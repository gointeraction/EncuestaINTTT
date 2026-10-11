import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsTableComponent, DsTableColumn, DsTableRow } from './table.component';
import { DsPaginationComponent } from '../../navigation/pagination/pagination.component';
import { DsEmptyStateComponent } from '../empty-state/empty-state.component';
import { DsSkeletonComponent } from '../skeleton/skeleton.component';

/**
 * ds-data-table-card — dashboard table widget.
 * Card shell (title + [header] actions slot) wrapping ds-table with optional
 * ds-pagination footer. Presentational: receives columns + rows; the consumer
 * owns the data source and page state. `totalPages` is the PAGE COUNT (it is
 * forwarded to ds-pagination's `total`, which means "number of pages", not a
 * data-row total). Emits rowClick / pageChange. Loading renders a table
 * skeleton; empty renders ds-empty-state.
 */
@Component({
  selector: 'ds-data-table-card',
  standalone: true,
  imports: [DsTableComponent, DsPaginationComponent, DsEmptyStateComponent, DsSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-dtc' },
  template: `
    <header class="ds-dtc__header">
      <div class="ds-dtc__titles">
        <h3 class="ds-dtc__title">{{ title() }}</h3>
        @if (subtitle()) { <p class="ds-dtc__subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="ds-dtc__actions">
        <ng-content select="[header]"/>
      </div>
    </header>
    <div class="ds-dtc__body">
      @if (loading()) {
        <ds-skeleton type="table" [rows]="[1, 2, 3, 4, 5]"/>
      } @else if (rows().length === 0) {
        <ds-empty-state [title]="emptyTitle()" [body]="emptyBody()"/>
      } @else {
        <ds-table [columns]="columns()" [rows]="rows()" [rowsTrack]="rowsTrack()"
                  (rowClick)="onRowClick($event)"/>
      }
    </div>
    @if (paged() && !loading()) {
      <footer class="ds-dtc__footer">
        <ds-pagination [page]="page()" [total]="totalPages()" [size]="paginationSize()"
                       (pageChange)="pageChange.emit($event)"/>
      </footer>
    }
  `,
  styles: `
    :host {
      display: flex; flex-direction: column;
      background: var(--ds-component-card-bg); color: var(--ds-component-card-on);
      border: 1px solid var(--ds-component-card-border);
      border-radius: var(--ds-component-card-radius);
      box-shadow: var(--ds-component-card-shadow);
      font-family: var(--ds-font-sans);
    }
    .ds-dtc__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--ds-space-3); padding: var(--ds-space-4) var(--ds-space-5); flex-shrink: 0;
    }
    .ds-dtc__titles { min-width: 0; }
    .ds-dtc__title { font-size: var(--ds-text-heading-3); font-weight: var(--ds-font-weight-semibold); color: var(--ds-component-card-on); margin: 0; }
    .ds-dtc__subtitle { font-size: var(--ds-text-caption); color: var(--ds-text-muted); margin: 0; margin-top: var(--ds-space-1); }
    .ds-dtc__actions { display: flex; align-items: center; gap: var(--ds-space-2); flex-shrink: 0; }
    .ds-dtc__body { flex: 1; padding: 0 var(--ds-space-5); min-width: 0; overflow-x: auto; }
    .ds-dtc__footer {
      display: flex; align-items: center; justify-content: flex-end;
      gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-5);
      border-top: 1px solid var(--ds-border-divider); flex-shrink: 0;
    }
  `,
})
export class DsDataTableCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly columns = input.required<DsTableColumn[]>();
  readonly rows = input.required<DsTableRow[]>();
  readonly rowsTrack = input<string | null>(null);
  readonly paged = input(false);
  readonly page = input<number>(1);
  /** Number of pages (forwarded to ds-pagination's `total`). */
  readonly totalPages = input<number>(1);
  readonly paginationSize = input<'sm' | 'md' | 'lg'>('md');
  readonly loading = input(false);
  readonly emptyTitle = input('No data');
  readonly emptyBody = input('');

  readonly rowClick = output<DsTableRow>();
  readonly pageChange = output<number>();

  protected onRowClick(row: DsTableRow): void {
    this.rowClick.emit(row);
  }
}