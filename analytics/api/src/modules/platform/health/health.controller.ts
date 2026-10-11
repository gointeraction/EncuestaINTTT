import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator.js';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check(): Promise<{ status: string; service: string; db: boolean; redis: boolean }> {
    let db = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      /* db no disponible */
    }
    const redis = await this.redis.ping();
    return { status: db ? 'ok' : 'degraded', service: 'encuestaintt-analytics-api', db, redis };
  }
}
