import { createHmac, timingSafeEqual } from "node:crypto";
import { signedPayload } from "./canonical";

/** Firma HMAC-SHA256 de un envío con la clave del dispositivo (servidor). */
export function signDevice(secret: string, payload: Record<string, unknown>): string {
  return createHmac("sha256", secret).update(signedPayload(payload)).digest("hex");
}

/** Verifica la firma del dispositivo en tiempo constante. */
export function verifyDeviceSignature(
  secret: string,
  payload: Record<string, unknown>,
  signature: unknown,
): boolean {
  if (typeof signature !== "string" || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(signDevice(secret, payload), "hex");
  const provided = Buffer.from(signature, "hex");
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
