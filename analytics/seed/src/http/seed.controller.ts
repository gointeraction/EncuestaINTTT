import { Body, Controller, Delete, Get, Inject, Post, Query } from '@nestjs/common';
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { PgService } from '../core/pg.service.js';
import { SeedCommand, type SeedOptions } from '../commands/seed.command.js';
import { ResetCommand } from '../commands/reset.command.js';
import { SummarizeCommand } from '../commands/summarize.command.js';
import { FixturesCommand } from '../commands/fixtures.command.js';
import { LoadCommand } from '../commands/load.command.js';

interface StatusRow {
  surveys: number;
  responses: number;
  answers: number;
  legacy: number;
}

/** Superficie HTTP del seeder (SOLO dev). La consola la consume; guardas del módulo aplican. */
@Controller()
export class SeedController {
  constructor(
    private readonly pg: PgService,
    private readonly seed: SeedCommand,
    private readonly reset: ResetCommand,
    private readonly summarize: SummarizeCommand,
    private readonly fixtures: FixturesCommand,
    private readonly load: LoadCommand,
    @Inject(SEED_CONFIG) private readonly config: SeedConfig,
  ) {}

  @Get('status')
  async status() {
    const [row] = await this.pg.query<StatusRow>(
      `select
         (select count(*) from public.surveys)::int as surveys,
         (select count(*) from public.responses)::int as responses,
         (select count(*) from public.answers)::int as answers,
         (select count(*) from public.legacy_survey_responses)::int as legacy`,
    );
    return {
      environment: this.config.appEnv,
      database: this.config.databaseName,
      counts: row ?? { surveys: 0, responses: 0, answers: 0, legacy: 0 },
    };
  }

  @Post('seed')
  async runSeed(@Body() body: SeedOptions) {
    await this.seed.run(body ?? {});
    await this.summarize.run(); // deja los KPI listos
    return this.status();
  }

  @Post('reset')
  async runReset() {
    await this.reset.run();
    return this.status();
  }

  @Post('summarize')
  async runSummarize() {
    await this.summarize.run();
    return this.status();
  }

  /** Genera los CSV (uno por tipo de conductor). */
  @Post('fixtures')
  async runFixtures(@Body() body: { perType?: number } = {}) {
    await this.fixtures.run({ perType: body?.perType });
    return this.status();
  }

  /** Lista los CSV de fixtures (nombre, filas, bytes, fecha). */
  @Get('fixtures')
  async listFixtures() {
    const fixtures = this.fixtures.list();
    return { fixtures, total: fixtures.reduce((s, f) => s + f.rows, 0) };
  }

  /** Borra los CSV de fixtures (todos, o uno por `?name=`). */
  @Delete('fixtures')
  async deleteFixtures(@Query('name') name?: string) {
    const removed = this.fixtures.remove({ name });
    return { removed };
  }

  /** Carga los CSV de fixtures a la tabla real (misma estrategia que la captura). */
  @Post('load')
  async runLoad() {
    await this.load.run({});
    await this.summarize.run();
    return this.status();
  }
}
