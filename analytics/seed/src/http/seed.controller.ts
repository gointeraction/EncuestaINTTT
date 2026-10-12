import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Query, Res } from '@nestjs/common';

/** Interfaz mínima de la respuesta (evita depender de @types/express). */
interface Res {
  status(code: number): { json(body: unknown): void };
}
import { SEED_CONFIG, type SeedConfig } from '../config.js';
import { PgService } from '../core/pg.service.js';
import { SeedCommand, type SeedOptions } from '../commands/seed.command.js';
import { ResetCommand } from '../commands/reset.command.js';
import { SummarizeCommand } from '../commands/summarize.command.js';
import { FixturesCommand } from '../commands/fixtures.command.js';
import { DatasetsCommand } from '../commands/datasets.command.js';
import { LoadCommand } from '../commands/load.command.js';
import { ResponseCommand, type CreateSurveyInput } from '../commands/response.command.js';

interface StatusRow {
  encuestas: number;
  participantes: number;
  dispositivos: number;
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
    private readonly datasets: DatasetsCommand,
    private readonly load: LoadCommand,
    private readonly response: ResponseCommand,
    @Inject(SEED_CONFIG) private readonly config: SeedConfig,
  ) {}

  @Get('status')
  async status() {
    const [row] = await this.pg.query<StatusRow>(
      `select
         (select count(*) from public.legacy_survey_responses)::int as encuestas,
         (select count(*) from public.legacy_survey_responses where "participaSorteo")::int as participantes,
         (select count(*) from public.capture_devices)::int as dispositivos`,
    );
    return {
      environment: this.config.appEnv,
      database: this.config.databaseName,
      counts: row ?? { encuestas: 0, participantes: 0, dispositivos: 0 },
    };
  }

  @Post('seed')
  async runSeed(@Body() body: SeedOptions) {
    const t = Date.now();
    await this.seed.run(body ?? {});
    await this.summarize.run();
    return { ...(await this.status()), elapsedMs: Date.now() - t };
  }

  @Post('reset')
  async runReset() {
    const t = Date.now();
    await this.reset.run();
    return { ...(await this.status()), elapsedMs: Date.now() - t };
  }

  @Post('summarize')
  async runSummarize() {
    const t = Date.now();
    await this.summarize.run();
    return { ...(await this.status()), elapsedMs: Date.now() - t };
  }

  // ─── fixtures por tipo de conductor ───────────────────────────────────────

  @Post('fixtures')
  async runFixtures(@Body() body: { perType?: number } = {}) {
    const t = Date.now();
    await this.fixtures.run({ perType: body?.perType });
    return { ...(await this.status()), elapsedMs: Date.now() - t };
  }

  @Get('fixtures')
  async listFixtures() {
    const fixtures = this.fixtures.list();
    return { fixtures, total: fixtures.reduce((s, f) => s + f.rows, 0) };
  }

  @Delete('fixtures')
  async deleteFixtures(@Query('name') name?: string) {
    return { removed: this.fixtures.remove({ name }) };
  }

  // ─── datasets por volumen (10K/100K/500K/1M) ──────────────────────────────

  @Post('datasets')
  async runDatasets(@Body() body: { only?: string; seed?: number } = {}) {
    const t = Date.now();
    await this.datasets.generate({ only: body?.only, seed: body?.seed });
    return { ...(await this.status()), elapsedMs: Date.now() - t };
  }

  @Get('datasets')
  async listDatasets() {
    const datasets = this.datasets.list();
    return { datasets, total: datasets.reduce((s, d) => s + d.rows, 0) };
  }

  @Delete('datasets')
  async deleteDatasets(@Query('name') name?: string) {
    return { removed: this.datasets.remove({ name }) };
  }

  /** Carga a la base: los fixtures (sin `dataset`) o un dataset de volumen concreto. */
  @Post('load')
  async runLoad(@Body() body: { dataset?: string } = {}) {
    const t = Date.now();
    if (body?.dataset) {
      if (!this.datasets.exists(body.dataset)) {
        throw new BadRequestException(`Dataset no encontrado: ${body.dataset}`);
      }
      await this.load.run({ file: this.datasets.pathOf(body.dataset) });
    } else {
      await this.load.run({});
    }
    await this.summarize.run();
    return { ...(await this.status()), elapsedMs: Date.now() - t };
  }

  /** Quita una encuesta creada (por `clientSubmissionId`). */
  @Delete('survey')
  async removeSurvey(@Query('clientSubmissionId') clientSubmissionId: string) {
    const removed = clientSubmissionId ? await this.response.remove(clientSubmissionId) : 0;
    return { removed };
  }

  // ─── encuesta individual (definición + alta idempotente) ──────────────────

  /** Definición del cuestionario para el formulario de la consola. */
  @Get('questionnaire')
  async getQuestionnaire() {
    return this.response.questionnaire();
  }

  /** Agrega UNA encuesta (reenviada a la captura real, canal `seed`). */
  @Post('survey')
  async createSurvey(@Body() body: CreateSurveyInput, @Res() res: Res) {
    const t = Date.now();
    const result = await this.response.create(body ?? ({} as CreateSurveyInput));
    const payload =
      result.body && typeof result.body === 'object'
        ? (result.body as Record<string, unknown>)
        : { body: result.body };
    res.status(result.status).json({ ...payload, elapsedMs: Date.now() - t });
  }
}
