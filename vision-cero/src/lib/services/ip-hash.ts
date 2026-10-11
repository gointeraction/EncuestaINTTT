import { createHash } from "crypto";
import { NextRequest } from "next/server";

/**
 * Obtiene un salt determinista diario para la anonimización de IPs (cumplimiento GDPR / NFR-7).
 */
function getDailySalt(): string {
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const baseSecret = process.env.ADMIN_SECRET || "intt_gdpr_salt_secret_2026";
  return `${dateStr}-${baseSecret}`;
}

/**
 * Hashea la dirección IP del cliente con SHA-256 y salt rotativo.
 */
export function hashClientIp(ip: string): string {
  const normalizedIp = ip.trim().toLowerCase();
  const salt = getDailySalt();
  return createHash("sha256")
    .update(`${normalizedIp}:${salt}`)
    .digest("hex");
}

/**
 * Extrae la dirección IP real de la solicitud HTTP (considerando proxies inversos Nginx/Caddy).
 */
export function extractClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((s) => s.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
