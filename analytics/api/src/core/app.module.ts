import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { AccessAuditModule } from '../modules/platform/access-audit/access-audit.module.js';
import { IdentityModule } from '../modules/platform/identity/identity.module.js';
import { HealthModule } from '../modules/platform/health/health.module.js';
import { PublicReadModule } from '../modules/integration/public-read/public-read.module.js';

/**
 * AppModule — raíz del back-office analítico (layout core/modules/shared).
 * `platform`: salud, identidad (sesión local de staff), auditoría de acceso.
 * `integration`: acceso de solo lectura al esquema public.
 */
@Module({
  imports: [PrismaModule, AccessAuditModule, IdentityModule, HealthModule, PublicReadModule],
})
export class AppModule {}
