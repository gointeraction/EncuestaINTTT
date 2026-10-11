export type Cell = string | number | boolean | null | undefined;

/** Serializa una fila a una línea CSV (FORMAT csv de PostgreSQL). */
export function csvLine(cells: readonly Cell[]): string {
  return cells.map(encode).join(',');
}

function encode(c: Cell): string {
  if (c === null || c === undefined) return '';
  if (typeof c === 'number') return String(c);
  if (typeof c === 'boolean') return c ? 't' : 'f';
  const s = String(c);
  if (s === '') return '""';
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
