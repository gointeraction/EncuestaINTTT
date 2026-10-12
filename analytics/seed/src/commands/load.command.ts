import { Inject, Injectable, Logger } from '@nestjs/common';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { PgService } from '../core/pg.service.js';
import { RESET_TABLES } from '../core/dataset.js';
import { LEGACY_COLUMNS, DEVICE_COLUMNS, deviceRows } from '../core/vision-cero.js';
import { assertDevDatabase } from '../core/guards.js';

/**
 * load — TRUNCATE acotado + COPY de los CSV (uno por tipo de conductor) a la tabla real
 * `public.legacy_survey_responses`, incluyendo el canal. Misma estrategia que la captura.
 */
@Injectable()
export class LoadCommand {
  private readonly log = new Logger('load');

  constructor(
    private readonly pg: PgService,
    @Inject(SEED_CONFIG) private readonly config: SeedConfig,
  ) {}

  async run(opts: { dir?: string } = {}): Promise<void> {
    await assertDevDatabase(this.pg, this.config);
    const dir = opts.dir ?? join(process.cwd(), 'data', 'fixtures');
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.csv'))
      .sort();
    if (files.length === 0) {
      throw new Error(`No hay CSV en ${dir}. Ejecuta \`fixtures\` primero.`);
    }

    await this.pg.truncate(RESET_TABLES);
    let total = 0;
    for (const f of files) {
      total += await this.pg.copyFromFile(
        'public.legacy_survey_responses',
        LEGACY_COLUMNS,
        join(dir, f),
        true,
      );
    }
    const devices = await this.pg.copy('public.capture_devices', DEVICE_COLUMNS, deviceRows());
    this.log.log(`load: ${total} filas desde ${files.length} CSV · ${devices} dispositivos en ${dir}`);
  }
}
