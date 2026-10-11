import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from '../modules/platform/health/health.module.js';
import { PublicReadModule } from '../modules/integration/public-read/public-read.module.js';

/**
 * AppModule — raíz del back-office analítico (layout core/modules/shared).
 * Agrupa los módulos por supradominio: `platform` (salud, identidad, auditoría)
 * e `integration` (acceso de solo lectura al esquema public).
 */
@Module({
  imports: [PrismaModule, HealthModule, PublicReadModule],
})
export class AppModule {}
