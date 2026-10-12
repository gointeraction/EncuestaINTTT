import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { join } from 'node:path';
import { countLines } from '../core/fs.util.js';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { csvLine } from '../core/csv.js';
import { rowRng } from '../core/rng.js';
import { DRIVER_TYPE_IDS, LEGACY_COLUMNS, legacyRowsForDriver } from '../core/vision-cero.js';

const HEADER = LEGACY_COLUMNS.map((c) => c.replace(/"/g, '')).join(',');

export interface FixtureFile {
  name: string;
  rows: number;
  bytes: number;
  modifiedAt: string;
}

/**
 * fixtures — escribe un CSV por tipo de conductor, con la MISMA forma que una entrevista
 * hecha a mano (answers aplicables + canal + captura/recepción). El nº por tipo VARÍA
 * (por defecto 25–70). Sirven para `load`.
 */
@Injectable()
export class FixturesCommand {
  private readonly log = new Logger('fixtures');

  constructor(@Inject(SEED_CONFIG) private readonly config: SeedConfig) {}

  async run(
    opts: { perType?: number; minPerType?: number; maxPerType?: number; seed?: number; dir?: string } = {},
  ): Promise<void> {
    const dir = opts.dir ?? join(process.cwd(), 'data', 'fixtures');
    const seed = opts.seed ?? this.config.rngSeed;
    const min = opts.minPerType ?? 31;
    const max = opts.maxPerType ?? 88;
    mkdirSync(dir, { recursive: true });

    for (let t = 0; t < DRIVER_TYPE_IDS.length; t++) {
      const driverType = DRIVER_TYPE_IDS[t];
      const n = opts.perType ?? rowRng(seed, 900, t).int(min, max);
      const file = join(dir, `${driverType}.csv`);
      const out = createWriteStream(file);
      out.write(HEADER + '\n');
      let written = 0;
      for (const row of legacyRowsForDriver(seed, t, driverType, n)) {
        out.write(csvLine(row) + '\n');
        written++;
      }
      await new Promise<void>((res, rej) => out.end((e?: Error | null) => (e ? rej(e) : res())));
      this.log.log(`${file}: ${written} filas`);
    }
  }

  private dirOf(dir?: string): string {
    return dir ?? join(process.cwd(), 'data', 'fixtures');
  }

  /** Lista los CSV de fixtures (nombre, filas, bytes, fecha de modificación). */
  list(opts: { dir?: string } = {}): FixtureFile[] {
    const dir = this.dirOf(opts.dir);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.csv'))
      .sort()
      .map((name) => {
        const path = join(dir, name);
        const st = statSync(path);
        return {
          name,
          rows: Math.max(0, countLines(path) - 1), // menos la cabecera
          bytes: st.size,
          modifiedAt: st.mtime.toISOString(),
        };
      });
  }

  /** Borra los CSV de fixtures (todos, o uno por nombre). Devuelve cuántos borró. */
  remove(opts: { dir?: string; name?: string } = {}): number {
    const dir = this.dirOf(opts.dir);
    if (!existsSync(dir)) return 0;
    if (opts.name && (!opts.name.endsWith('.csv') || /[/\\]|\.\./.test(opts.name))) return 0;
    const names = opts.name ? [opts.name] : readdirSync(dir).filter((f) => f.endsWith('.csv'));
    let removed = 0;
    for (const name of names) {
      const path = join(dir, name);
      if (existsSync(path)) {
        unlinkSync(path);
        removed++;
      }
    }
    return removed;
  }
}

