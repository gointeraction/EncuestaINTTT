/** Calendar grid helpers shared by ds-form-date and ds-form-date-range. */

export interface DsCalendarCell {
  key: string;
  day: number;
  iso: string;
  blank: boolean;
}

export const CALENDAR_WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Build a Monday-first month grid for a given year/month (0-based). */
export function buildCalendarGrid(year: number, month: number): DsCalendarCell[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first offset
  const cells: DsCalendarCell[] = [];
  for (let i = 0; i < lead; i++) cells.push({ key: `b${i}`, day: 0, iso: '', blank: true });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      key: `${year}-${month}-${d}`,
      day: d,
      iso: toIso(year, month, d),
      blank: false,
    });
  }
  return cells;
}

export function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Current local date as ISO YYYY-MM-DD. */
export function todayIso(): string {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Human display: e.g. 2026-09-07 -> "07 Sep 2026". */
export function formatIso(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Local ISO (UTC-less, respects local tz). */
export function toLocalIso(date: Date): string {
  return toIso(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Add `days` to an ISO date string (returns ISO). */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toLocalIso(dt);
}
