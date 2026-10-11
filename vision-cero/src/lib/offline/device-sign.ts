import { signedPayload } from "@/lib/canonical";

/** Firma HMAC-SHA256 de un envío con la clave del dispositivo (cliente, Web Crypto). */
export async function signDevice(secret: string, payload: Record<string, unknown>): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload(payload)));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
