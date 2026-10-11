import { Inject, Injectable, Logger } from '@nestjs/common';
import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { csvLine } from '../core/csv.js';
import { DRIVER_TYPE_IDS, LEGACY_COLUMNS, legacyRowsForDriver } from '../core/vision-cero.js';

const HEADER = LEGACY_COLUMNS.map((c) => c.replace(/"/g, '')).join(',');

/**
 * fixtures — escribe un CSV por tipo de conductor (30 entrevistas por defecto), con la
 * MISMA forma que una entrevista hecha a mano (answers aplicables + canal). Sirven para
 * `load`.
 */
@Injectable()
export class FixturesCommand {
  private readonly log = new Logger('fixtures');

  constructor(@Inject(SEED_CONFIG) private readonly config: SeedConfig) {}

  async run(opts: { perType?: number; seed?: number; dir?: string } = {}): Promise<void> {
    const dir = opts.dir ?? join(process.cwd(), 'data', 'fixtures');
    const perType = opts.perType ?? 30;
    const seed = opts.seed ?? this.config.rngSeed;
    mkdirSync(dir, { recursive: true });

    for (let t = 0; t < DRIVER_TYPE_IDS.length; t++) {
      const driverType = DRIVER_TYPE_IDS[t];
      const file = join(dir, `${driverType}.csv`);
      const out = createWriteStream(file);
      out.write(HEADER + '\n');
      let n = 0;
      for (const row of legacyRowsForDriver(seed, t, driverType, perType)) {
        out.write(csvLine(row) + '\n');
        n++;
      }
      await new Promise<void>((res, rej) => out.end((e?: Error | null) => (e ? rej(e) : res())));
      this.log.log(`${file}: ${n} filas`);
    }
  }
}
