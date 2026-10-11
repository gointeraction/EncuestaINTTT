import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { ReadModelService } from './read-model.service.js';

/**
 * SummarizationService — dispara la sumarización como un proceso PROPIO del
 * back-office (registro en `summarization_runs`), sin tocar la captura.
 */
@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly readModel: ReadModelService,
  ) {}

  async run(scope: 'all' | 'global' = 'all') {
    const run = await this.prisma.summarizationRun.create({ data: { scope, status: 'running' } });
    try {
      let records = 0;
      if (scope === 'all') {
        const surveys = await this.readModel.listSurveys();
        for (const s of surveys) {
          records += await this.readModel.summarizeSurvey(s.id);
        }
      }
      await this.readModel.summarizeGlobal();
      records += 1;
      await this.prisma.summarizationRun.update({
        where: { id: run.id },
        data: { status: 'done', finishedAt: new Date(), records },
      });
      this.logger.log(`summarize(${scope}) done: ${records} records`);
      return { runId: run.id, scope, status: 'done', records };
    } catch (err) {
      await this.prisma.summarizationRun.update({
        where: { id: run.id },
        data: { status: 'failed', finishedAt: new Date() },
      });
      this.logger.error(`summarize(${scope}) failed`, err as Error);
      throw err;
    }
  }

  status() {
    return this.prisma.summarizationRun.findFirst({ orderBy: { startedAt: 'desc' } });
  }
}
