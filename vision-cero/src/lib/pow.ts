import { createHash } from "node:crypto";

/**
 * Prueba de trabajo (hashcash) — control anti-bot para envíos OFFLINE (sin red no hay Turnstile).
 * El cliente busca un nonce tal que sha256(`challenge:nonce`) empiece con `difficulty` ceros hex.
 * Verificar aquí es O(1); generarlo cuesta ~16^difficulty intentos (caro para un bot en volumen).
 */
export const POW_DIFFICULTY = 4;

export function verifyPow(challenge: string, nonce: unknown, difficulty: number): boolean {
  if (typeof nonce !== "number" || !Number.isInteger(nonce) || nonce < 0) return false;
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 6) return false;
  const hash = createHash("sha256").update(`${challenge}:${nonce}`).digest("hex");
  return hash.startsWith("0".repeat(difficulty));
}
