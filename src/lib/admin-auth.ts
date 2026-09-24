// ============================================================================
// Autenticación para el panel de administración (dashboard privado)
// ============================================================================
// Sistema simple de sesión con cookie httpOnly firmada (HMAC-SHA256).
// La URL privada es /?admin=1 — muestra el login; tras autenticarse, el dashboard.
// ============================================================================

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "intt_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  return (
    process.env.ADMIN_SECRET ||
    "9f3c1a7e4b2d8f6a5c9e1b3d7f4a2e8c6b9d3f1a7e5c4b2d8a6f9e3c1b7d4a2e"
  );
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || "VisionCero2026!";
}

/** Crea un token firmado: payload.expires HMAC */
function signToken(payload: string, expires: number): string {
  const data = `${payload}.${expires}`;
  const sig = createHmac("sha256", getSecret()).update(data).digest("hex");
  return `${data}.${sig}`;
}

/** Verifica un token firmado. */
function verifyToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [payload, expiresStr, sig] = parts;
    const expires = Number(expiresStr);
    if (isNaN(expires) || Date.now() > expires) return false;

    const data = `${payload}.${expires}`;
    const expectedSig = createHmac("sha256", getSecret()).update(data).digest("hex");

    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Valida la contraseña de administrador (comparación en tiempo constante). */
export function verifyAdminPassword(password: string): boolean {
  const expected = getPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Crea la sesión de admin: setea la cookie httpOnly firmada. */
export async function createAdminSession(): Promise<void> {
  const expires = Date.now() + COOKIE_MAX_AGE * 1000;
  const token = signToken("admin", expires);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Cierra la sesión de admin: elimina la cookie. */
export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Verifica si la petición actual está autenticada como admin. */
export async function isAdminAuthed(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyToken(token);
  } catch {
    return false;
  }
}
