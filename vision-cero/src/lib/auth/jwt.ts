import { createHmac, timingSafeEqual } from "crypto";
import { AuthTokenPayload, UserRole } from "./types";

const DEFAULT_SECRET = "intt_default_secret_key_sdd_auth_2026_super_secure_random";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || process.env.ADMIN_SECRET || DEFAULT_SECRET;
}

function base64UrlEncode(data: string | Buffer): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Emite un token JWT firmado con HMAC-SHA256 para un usuario autenticado.
 */
export function signAuthToken(user: { id: string; email: string; role: UserRole }, ttlSeconds = TOKEN_TTL_SECONDS): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + ttlSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", getAuthSecret())
    .update(signingInput)
    .digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verifica un token JWT, valida su firma y comprueba que no haya expirado.
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = createHmac("sha256", getAuthSecret())
      .update(signingInput)
      .digest();
    const actualSignature = Buffer.from(
      encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    if (expectedSignature.length !== actualSignature.length) return null;
    if (!timingSafeEqual(expectedSignature, actualSignature)) return null;

    const payload: AuthTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expirado
    }

    return payload;
  } catch {
    return null;
  }
}
