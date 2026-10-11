import type { SurveySource } from '../../../shared/contracts/index.js';

export const PUBLIC_READ_PORT = Symbol('PUBLIC_READ_PORT');

/**
 * PublicReadPort — único punto de lectura del esquema `public` (captura).
 * Los adaptadores DEVUELVEN datos; nunca escriben (regla no-write-to-public).
 */
export interface PublicReadPort {
  listSurveys(): Promise<SurveySource[]>;
}
