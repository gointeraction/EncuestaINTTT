// ============================================================================
// Rate limiting en memoria (por IP)
// ============================================================================
// Simple limitador de peticiones por IP usando una ventana deslizante.
// Suficiente para una sola instancia de servidor. Para producción multi-instancia
// conviene migrar a Redis, pero para esta app basta.
// ============================================================================

interface RateBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateBucket>();

interface RateLimitOptions {
  /** Número máximo de peticiones permitidas en la ventana. */
  max: number;
  /** Ventana de tiempo en milisegundos. */
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Verifica si una IP puede hacer una petición más. Registra el intento.
 * @returns { ok: true } si permitido; { ok: false } si excedido.
 */
export function rateLimit(
  ip: string,
  opts: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(ip, bucket);
  }

  // Filtrar timestamps dentro de la ventana actual
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= opts.max) {
    const oldest = bucket.timestamps[0];
    return {
      ok: false,
      remaining: 0,
      resetAt: oldest + opts.windowMs,
    };
  }

  bucket.timestamps.push(now);
  return {
    ok: true,
    remaining: opts.max - bucket.timestamps.length,
    resetAt: now + opts.windowMs,
  };
}

/** Extrae la IP del cliente de los headers comunes de proxy. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Limpia periódicamente buckets vacíos para evitar fugas de memoria. */
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of buckets.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > now - 3600_000);
    if (bucket.timestamps.length === 0) {
      buckets.delete(ip);
    }
  }
}, 600_000); // cada 10 min
