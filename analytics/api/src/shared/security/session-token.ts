import { createHash, randomBytes } from 'node:crypto';

/** Token de sesión opaco (se envía en cookie); en BD solo se guarda su hash. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
