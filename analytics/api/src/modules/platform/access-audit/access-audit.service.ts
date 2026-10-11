import { Injectable } from '@nestjs/common';

/**
 * AccessAuditService — registro de lecturas sensibles del personal (F1: en memoria;
 * en F2 persiste en el esquema `analytics`, modelo `AccessAudit`). Único punto para
 * la auditoría de acceso.
 */
@Injectable()
export class AccessAuditService {
  private readonly events: Array<Record<string, unknown>> = [];

  registrarLectura(recurso: string, actor = 'anonymous'): void {
    this.events.push({ recurso, actor, momento: new Date().toISOString() });
  }

  listar(): ReadonlyArray<Record<string, unknown>> {
    return this.events;
  }
}
