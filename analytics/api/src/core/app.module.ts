import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { AccessAuditModule } from '../modules/platform/access-audit/access-audit.module.js';
import { IdentityModule } from '../modules/platform/identity/identity.module.js';
import { HealthModule } from '../modules/platform/health/health.module.js';
import { PublicReadModule } from '../modules/integration/public-read/public-read.module.js';
import { SchedulerModule } from '../modules/integration/scheduler/scheduler.module.js';
import { ReadModelModule } from '../modules/analytics/read-model/read-model.module.js';
import { ReportingModule } from '../modules/analytics/reporting/reporting.module.js';
import { ExportModule } from '../modules/analytics/export/export.module.js';

/**
 * AppModule — raíz del back-office analítico (layout core/modules/shared).
 * `platform`: salud, identidad (sesión local de staff), auditoría de acceso.
 * `integration`: acceso de solo lectura a public + scheduler del job.
 * `analytics`: read models (sumarización) + reportería + exportación.
 */
@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AccessAuditModule,
    IdentityModule,
    HealthModule,
    PublicReadModule,
    ReadModelModule,
    ReportingModule,
    ExportModule,
    SchedulerModule,
  ],
})
export class AppModule {}
