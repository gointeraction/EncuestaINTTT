import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

/**
 * AccessAuditService — auditoría de acceso persistida (esquema `analytics`,
 * modelo `AccessAudit`). Registra cada lectura sensible del personal.
 */
@Injectable()
export class AccessAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarLectura(recurso: string, actorId?: string): Promise<void> {
    await this.prisma.accessAudit.create({
      data: { recurso, accion: 'lectura', actorId: actorId ?? null },
    });
  }
}
