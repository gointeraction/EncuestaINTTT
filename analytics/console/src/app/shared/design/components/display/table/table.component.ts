import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface DsTableColumn {
  key: string;
  label: string;
  /** Optional cell renderer: a raw value or a formatter (e.g. cents -> $). */
  format?: (value: unknown) => string;
  width?: string;
}

export type DsTableRow = object;

/**
 * ds-table — universal data table (standalone + OnPush).
 * Presentational: receives columns + rows, renders token-styled header/body.
 * Cards/pages feed it; it owns no data source. Emits (rowClick) when a row is
 * clicked and a track-by field is provided (rowsTrack).
 */
@Component({
  selector: 'ds-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%;' },
  template: `
    <div class="ds-table__wrap">
      <table class="ds-table">
        @if (caption(); as cap) {
          <caption class="ds-table__caption">{{ cap }}</caption>
        }
        <thead class="ds-table__head">
          <tr>
            @for (col of columns(); track col.key) {
              <th [style.width]="col.width" scope="col" class="ds-table__th">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track trackKey(row)) {
            <tr class="ds-table__row" [class.ds-table__row--clickable]="clickable()"
                [attr.tabindex]="clickable() ? 0 : null"
                [attr.aria-label]="clickable() ? rowLabel(row) : null"
                (click)="clickable() && onRowClick(row)"
                (keydown)="clickable() && onRowKeydown($event, row)">
              @for (col of columns(); track col.key) {
                <td class="ds-table__td">{{ cell(col, row) }}</td>
              }
            </tr>
          } @empty {
            <tr class="ds-table__empty"><td [attr.colspan]="columns().length">—</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .ds-table__wrap {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--ds-component-table-border);
      border-radius: var(--ds-component-table-radius);
      background: var(--ds-surface-card);
    }
    .ds-table__caption {
      padding: var(--ds-component-table-padding-y) var(--ds-component-table-padding-x);
      font-family: var(--ds-font-sans);
      font-size: var(--ds-text-caption);
      font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-component-table-header-on);
      text-align: left;
    }
    .ds-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--ds-font-sans);
      font-size: var(--ds-text-body);
    }
    .ds-table__th {
      text-align: left;
      padding: var(--ds-component-table-padding-y) var(--ds-component-table-padding-x);
      background: var(--ds-component-table-header-bg);
      color: var(--ds-component-table-header-on);
      font-weight: var(--ds-font-weight-semibold);
      letter-spacing: var(--ds-letter-spacing-caps);
      text-transform: uppercase;
      font-size: var(--ds-text-caption);
      border-bottom: 1px solid var(--ds-component-table-border);
      white-space: nowrap;
    }
    .ds-table__td {
      padding: var(--ds-component-table-padding-y) var(--ds-component-table-padding-x);
      border-bottom: 1px solid var(--ds-border-divider);
      color: var(--ds-surface-card-on);
    }
    .ds-table__row:last-child .ds-table__td { border-bottom: none; }
    .ds-table__row:hover { background: var(--ds-component-table-row-hover-bg); }
    .ds-table__row--clickable { cursor: pointer; }
    /* R6: visible keyboard focus on clickable rows — ring via box-shadow, never a bare outline:none. */
    .ds-table__row--clickable:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 2px var(--ds-color-brand-primary);
      background: var(--ds-component-table-row-hover-bg);
    }
    .ds-table__empty td {
      padding: var(--ds-component-table-padding-y) var(--ds-component-table-padding-x);
      text-align: center;
      color: var(--ds-text-muted);
    }
  `,
})
export class DsTableComponent {
  readonly columns = input<DsTableColumn[]>([]);
  readonly rows = input<DsTableRow[]>([]);
  /** Optional accessible caption (announced by screen readers, rendered above the table). */
  readonly caption = input('');
  /** Field used to track rows (e.g. 'id'); when set, rows are clickable + emit. */
  readonly rowsTrack = input<string | null>(null);
  readonly rowClick = output<DsTableRow>();

  protected clickable(): boolean {
    return !!this.rowsTrack();
  }

  protected trackKey(row: DsTableRow): unknown {
    const k = this.rowsTrack();
    return k ? (row as Record<string, unknown>)[k] : row;
  }

  protected onRowClick(row: DsTableRow): void {
    this.rowClick.emit(row);
  }

  /** Readable row label for screen readers (row track value + first cell). */
  protected rowLabel(row: DsTableRow): string {
    const k = this.rowsTrack();
    const id = k ? (row as Record<string, unknown>)[k] : '';
    const first = this.cell(this.columns()[0], row);
    return [first, id].filter(Boolean).join(' · ');
  }

  /** R6: clickable rows are keyboard-operable (Enter/Space trigger rowClick). */
  protected onRowKeydown(event: KeyboardEvent, row: DsTableRow): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowClick(row);
    }
  }

  protected cell(col: DsTableColumn, row: DsTableRow): string {
    const v = (row as Record<string, unknown>)[col.key];
    if (col.format) return col.format(v);
    return v === null || v === undefined ? '' : String(v);
  }
}