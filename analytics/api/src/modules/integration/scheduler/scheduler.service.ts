import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SummarizationService } from '../../analytics/read-model/summarization.service.js';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

const INTERVAL_MS = 60 * 60 * 1000; // 1 h

/**
 * SchedulerService — jobs PROGRAMADOS del back-office (cada hora): sumarización y
 * purga de sesiones de staff expiradas. Con una primera corrida diferida.
 */
@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private timer?: NodeJS.Timeout;
  private bootTimer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly summarization: SummarizationService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.tick(), INTERVAL_MS);
    this.bootTimer = setTimeout(() => void this.tick(), 30_000);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.bootTimer) clearTimeout(this.bootTimer);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.summarization.run('all');
      const purged = await this.prisma.staffSession.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (purged.count > 0) this.logger.log(`purged ${purged.count} expired sessions`);
    } catch (err) {
      this.logger.error('scheduled job failed', err as Error);
    } finally {
      this.running = false;
    }
  }
}
