import { Inject, Injectable, Logger } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { PgService } from '../core/pg.service.js';
import { RESET_TABLES, tables } from '../core/dataset.js';
import { assertDevDatabase } from '../core/guards.js';
import { PROFILES, withOverride, type Profile, type ProfileName } from '../profiles.js';

export interface SeedOptions {
  profile?: string;
  surveys?: number;
  questionsPerSurvey?: number;
  responses?: number;
  legacy?: number;
  seed?: number;
}

/** seed — TRUNCATE acotado + carga masiva (COPY) del dataset Visión Cero (+ CSV a disco). */
@Injectable()
export class SeedCommand {
  private readonly log = new Logger('seed');

  constructor(
    private readonly pg: PgService,
    @Inject(SEED_CONFIG) private readonly config: SeedConfig,
  ) {}

  async run(opts: SeedOptions = {}): Promise<void> {
    await assertDevDatabase(this.pg, this.config);

    const base: Profile = opts.profile
      ? PROFILES[opts.profile as ProfileName] ?? this.config.profile
      : this.config.profile;
    const profile = withOverride(base, {
      surveys: opts.surveys,
      questionsPerSurvey: opts.questionsPerSurvey,
      responses: opts.responses,
      legacy: opts.legacy,
    });
    const rngSeed = opts.seed ?? this.config.rngSeed;

    this.log.warn(
      `seed Visión Cero en "${this.config.databaseName}" · cuestionarios=${profile.responses} semilla=${rngSeed}`,
    );

    const dataDir = process.env.SEED_DATA_DIR ?? join(process.cwd(), 'data');
    mkdirSync(dataDir, { recursive: true });

    const t0 = Date.now();
    await this.pg.truncate(RESET_TABLES);

    for (const table of tables(rngSeed, profile)) {
      const csv = join(dataDir, `${table.name.split('.').pop()}.csv`);
      await this.pg.copy(table.name, table.columns, table.rows(), csv);
    }

    this.log.log(`seed completado en ${((Date.now() - t0) / 1000).toFixed(1)}s · CSV en ${dataDir}`);
  }
}
