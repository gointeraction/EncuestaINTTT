import { Inject, Injectable, Logger } from '@nestjs/common';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { PgService } from '../core/pg.service.js';
import { RESET_TABLES, SEED_USER_COLUMNS, seedUserRow, tables } from '../core/dataset.js';
import { assertDevDatabase } from '../core/guards.js';

/** seed — TRUNCATE acotado + carga masiva (COPY) del dataset simulado. */
@Injectable()
export class SeedCommand {
  private readonly log = new Logger('seed');

  constructor(
    private readonly pg: PgService,
    @Inject(SEED_CONFIG) private readonly config: SeedConfig,
  ) {}

  async run(): Promise<void> {
    await assertDevDatabase(this.pg, this.config);
    this.log.warn(
      `seed en "${this.config.databaseName}" · perfil=${this.config.profileName} · semilla=${this.config.rngSeed}`,
    );

    const t0 = Date.now();
    await this.pg.truncate(RESET_TABLES);

    const cols = SEED_USER_COLUMNS;
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    await this.pg.run(
      `INSERT INTO public.users (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
      seedUserRow(this.config.rngSeed),
    );

    for (const table of tables(this.config.rngSeed, this.config.profile)) {
      await this.pg.copy(table.name, table.columns, table.rows());
    }

    this.log.log(`seed completado en ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
