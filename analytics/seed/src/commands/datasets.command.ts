import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { join } from 'node:path';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { csvLine } from '../core/csv.js';
import { LEGACY_COLUMNS, legacyRows } from '../core/vision-cero.js';

/** Volúmenes disponibles para pruebas de responsividad. */
export const VOLUMES = [
  { name: 'scale-10k', rows: 10_000 },
  { name: 'scale-100k', rows: 100_000 },
  { name: 'scale-500k', rows: 500_000 },
  { name: 'scale-1m', rows: 1_000_000 },
] as const;

export interface DatasetFile {
  name: string;
  rows: number;
  bytes: number;
  modifiedAt: string;
}

/**
 * datasets — genera CSV de Visión Cero por VOLUMEN (10K/100K/500K/1M) para medir
 * responsividad. Son grandes: se generan a demanda y NO se versionan.
 */
@Injectable()
export class DatasetsCommand {
  private readonly log = new Logger('datasets');

  constructor(@Inject(SEED_CONFIG) private readonly config: SeedConfig) {}

  private dir(): string {
    return join(process.env.SEED_DATA_DIR ?? join(process.cwd(), 'data'), 'datasets');
  }

  /** Genera los CSV de volumen (todos, o uno por `only`). */
  async generate(opts: { only?: string; seed?: number } = {}): Promise<void> {
    const dir = this.dir();
    mkdirSync(dir, { recursive: true });
    const seed = opts.seed ?? this.config.rngSeed;
    const targets = opts.only ? VOLUMES.filter((v) => v.name === opts.only) : VOLUMES;
    if (opts.only && targets.length === 0) {
      throw new Error(`Volumen desconocido: "${opts.only}". Usa: ${VOLUMES.map((v) => v.name).join(' | ')}.`);
    }
    for (const v of targets) {
      const file = join(dir, `${v.name}.csv`);
      const out = createWriteStream(file);
      out.write(LEGACY_COLUMNS.join(',') + '\n');
      let n = 0;
      for (const row of legacyRows(seed, v.rows)) {
        out.write(csvLine(row) + '\n');
        n++;
      }
      await new Promise<void>((res, rej) => out.end((e?: Error | null) => (e ? rej(e) : res())));
      this.log.log(`${file}: ${n} filas`);
    }
  }

  /** Lista los CSV de datasets (nombre, filas, bytes, fecha). */
  list(): DatasetFile[] {
    const dir = this.dir();
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.csv'))
      .sort()
      .map((name) => {
        const path = join(dir, name);
        const st = statSync(path);
        const text = readFileSync(path, 'utf8');
        const lines = text ? text.split('\n').filter((l) => l.length > 0).length : 0;
        return { name, rows: Math.max(0, lines - 1), bytes: st.size, modifiedAt: st.mtime.toISOString() };
      });
  }

  pathOf(name: string): string {
    const dir = this.dir();
    if (!name.endsWith('.csv') || /[/\\]|\.\./.test(name)) throw new Error('Nombre inválido');
    return join(dir, name);
  }

  exists(name: string): boolean {
    try {
      return existsSync(this.pathOf(name));
    } catch {
      return false;
    }
  }

  /** Borra los CSV de datasets (todos, o uno por nombre). */
  remove(opts: { name?: string } = {}): number {
    const dir = this.dir();
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
