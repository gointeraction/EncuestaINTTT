import type { SeedConfig } from '../config.js';
import type { PgService } from './pg.service.js';

/**
 * Guarda de entorno (defensa en profundidad): confirma que la base CONECTADA coincide
 * con la configurada y está en la allowlist de desarrollo. Aborta en caso contrario.
 */
export async function assertDevDatabase(pg: PgService, config: SeedConfig): Promise<void> {
  const db = await pg.currentDatabase();
  if (db !== config.databaseName) {
    throw new Error(`SEED abortado: conectado a "${db}" ≠ configurado "${config.databaseName}".`);
  }
  if (!/(^|_)dev($|_)/i.test(db)) {
    throw new Error(`SEED abortado: la base "${db}" no está en la allowlist de desarrollo (*dev*).`);
  }
}
