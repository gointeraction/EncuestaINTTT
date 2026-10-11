import { Inject, Injectable, Logger } from '@nestjs/common';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { PgService } from '../core/pg.service.js';
import { RESET_TABLES } from '../core/dataset.js';
import { assertDevDatabase } from '../core/guards.js';

/** reset — borra SOLO las tablas sembradas (acotado), en orden de dependencias. */
@Injectable()
export class ResetCommand {
  private readonly log = new Logger('reset');

  constructor(
    private readonly pg: PgService,
    @Inject(SEED_CONFIG) private readonly config: SeedConfig,
  ) {}

  async run(): Promise<void> {
    await assertDevDatabase(this.pg, this.config);
    this.log.warn(`reset en "${this.config.databaseName}" (${RESET_TABLES.length} tablas)`);
    await this.pg.truncate(RESET_TABLES);
    this.log.log('reset completado');
  }
}
