import type { Request } from 'express';

export const STAFF_SESSION_COOKIE = 'staff_session';

/** Lee la cookie de sesión de staff sin depender de cookie-parser. */
export function readStaffSession(req: Request): string | null {
  const header = req.headers?.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === STAFF_SESSION_COOKIE) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
