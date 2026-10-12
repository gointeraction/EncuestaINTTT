import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { join } from 'node:path';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { csvLine } from '../core/csv.js';
import { LEGACY_COLUMNS, legacyRowsForDriver, type DriverType } from '../core/vision-cero.js';

/** Distribución REALISTA por tipo de conductor (fracción del total de cada muestra). */
export const DRIVER_WEIGHTS: ReadonlyArray<readonly [DriverType, number]> = [
  ['motociclista_activo', 0.35],
  ['delivery', 0.22],
  ['mototaxista', 0.15],
  ['ex_motociclista', 0.12],
  ['familiar', 0.09],
  ['otro_conductor', 0.07],
];

/** Muestras por TAMAÑO: cada una es una carpeta con un CSV por tipo de conductor. */
export const SAMPLES = [
  { id: 'sample-5k', total: 5_000 },
  { id: 'sample-50k', total: 50_000 },
  { id: 'sample-250k', total: 250_000 },
  { id: 'sample-1m', total: 1_000_000 },
] as const;

export interface SampleFile {
  name: string;
  type: string;
  rows: number;
  bytes: number;
}

export interface SampleInfo {
  id: string;
  total: number;
  rows: number;
  bytes: number;
  files: SampleFile[];
}

/** Filas por tipo de una muestra (deterministas: redondeo del peso × total). */
export function countsFor(total: number): Array<{ type: DriverType; rows: number }> {
  return DRIVER_WEIGHTS.map(([type, w]) => ({ type, rows: Math.round(total * w) }));
}

/** Escribe UNA muestra (carpeta) con un CSV por tipo. */
async function writeSample(dir: string, total: number, seed: number, log: Logger): Promise<void> {
  mkdirSync(dir, { recursive: true });
  const counts = countsFor(total);
  for (let t = 0; t < counts.length; t++) {
    const { type, rows } = counts[t];
    const file = join(dir, `${type}.csv`);
    const out = createWriteStream(file);
    out.write(LEGACY_COLUMNS.join(',') + '\n');
    let n = 0;
    for (const row of legacyRowsForDriver(seed, t, type, rows)) {
      out.write(csvLine(row) + '\n');
      n++;
    }
    await new Promise<void>((res, rej) => out.end((e?: Error | null) => (e ? rej(e) : res())));
    log.log(`${file}: ${n} filas`);
  }
}

/**
 * datasets — genera MUESTRAS por tamaño (carpeta) con un CSV por tipo de conductor,
 * con cantidades PONDERADAS (distintas por tipo). Sirven para poblar/medir y para
 * VERIFICAR consistencia (los conteos esperados son deterministas).
 */
@Injectable()
export class DatasetsCommand {
  private readonly log = new Logger('datasets');

  constructor(@Inject(SEED_CONFIG) private readonly config: SeedConfig) {}

  private base(): string {
    return join(process.env.SEED_DATA_DIR ?? join(process.cwd(), 'data'), 'datasets');
  }

  /** Genera las muestras (todas, o una por `only`). */
  async generate(opts: { only?: string; seed?: number } = {}): Promise<void> {
    const base = this.base();
    mkdirSync(base, { recursive: true });
    const seed = opts.seed ?? this.config.rngSeed;
    const targets = opts.only ? SAMPLES.filter((s) => s.id === opts.only) : SAMPLES;
    if (opts.only && targets.length === 0) {
      throw new Error(`Muestra desconocida: "${opts.only}". Usa: ${SAMPLES.map((s) => s.id).join(' | ')}.`);
    }
    for (const s of targets) {
      await writeSample(join(base, s.id), s.total, seed, this.log);
    }
  }

  /** Lista las muestras presentes (carpetas con sus CSV por tipo). */
  list(): SampleInfo[] {
    const base = this.base();
    if (!existsSync(base)) return [];
    return readdirSync(base)
      .filter((id) => statSync(join(base, id)).isDirectory())
      .sort()
      .map((id) => {
        const dir = join(base, id);
        const files: SampleFile[] = readdirSync(dir)
          .filter((f) => f.endsWith('.csv'))
          .sort()
          .map((f) => {
            const path = join(dir, f);
            return { name: f, type: f.replace(/\.csv$/, ''), rows: 0, bytes: statSync(path).size };
          });
        // Las filas se derivan de la muestra (determinista) si su `total` se conoce.
        const total = SAMPLES.find((s) => s.id === id)?.total ?? 0;
        const counts = total ? countsFor(total) : [];
        for (const file of files) {
          file.rows = counts.find((c) => c.type === file.type)?.rows ?? 0;
        }
        return {
          id,
          total,
          rows: files.reduce((s, f) => s + f.rows, 0),
          bytes: files.reduce((s, f) => s + f.bytes, 0),
          files,
        };
      });
  }

  /** Carpeta de una muestra (para cargarla como directorio). */
  sampleDir(id: string): string {
    if (!/^[a-z0-9-]+$/i.test(id)) throw new Error('Nombre inválido');
    return join(this.base(), id);
  }

  exists(id: string): boolean {
    try {
      return existsSync(this.sampleDir(id));
    } catch {
      return false;
    }
  }

  /** Borra una muestra (carpeta completa, o un CSV si `name` = `<id>/<tipo>.csv`). */
  remove(opts: { name?: string } = {}): number {
    const base = this.base();
    if (!existsSync(base)) return 0;
    const name = opts.name ?? '';
    if (name.includes('/')) {
      const [id, file] = name.split('/');
      if (!/^[a-z0-9-]+$/i.test(id) || !/^[a-z_]+\.csv$/i.test(file)) return 0;
      const path = join(this.base(), id, file);
      if (existsSync(path)) {
        unlinkSync(path);
        return 1;
      }
      return 0;
    }
    const ids = name
      ? [name]
      : readdirSync(base).filter((id) => statSync(join(base, id)).isDirectory());
    let removed = 0;
    for (const id of ids) {
      const dir = join(base, id);
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) unlinkSync(join(dir, f));
      rmdirSync(dir);
      removed += 1;
    }
    return removed;
  }
}
