import { closeSync, openSync, readSync } from 'node:fs';

/** Cuenta las líneas de un archivo SIN cargarlo en memoria (lectura por bloques). */
export function countLines(path: string): number {
  const fd = openSync(path, 'r');
  try {
    const buf = Buffer.alloc(1 << 20); // 1 MB
    let lines = 0;
    let read = 0;
    while ((read = readSync(fd, buf, 0, buf.length, null)) > 0) {
      for (let i = 0; i < read; i++) if (buf[i] === 10) lines++;
    }
    return lines;
  } finally {
    closeSync(fd);
  }
}
