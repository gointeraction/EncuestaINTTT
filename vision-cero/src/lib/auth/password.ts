import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

/**
 * Hashea una contraseña usando scrypt con salt criptográfico de 16 bytes.
 * Formato resultante: "salt:derivedKeyHex"
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica si una contraseña en texto plano coincide con el hash almacenado en tiempo constante.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    const keyBuffer = Buffer.from(key, "hex");

    if (derivedKey.length !== keyBuffer.length) return false;
    return timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}
