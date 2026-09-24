// ============================================================================
// Cloudflare Turnstile — verificación server-side del token
// ============================================================================
// Turnstile es la alternativa de Cloudflare a reCAPTCHA: gratis, sin fricción
// y sin el captcha visual molesto para el usuario.
//
// Para producción, crea un sitio en https://dash.cloudflare.com → Turnstile
// y define TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY en .env con tus claves reales.
// ============================================================================

export const TURNSTILE_SITE_KEY =
  process.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // clave de test (siempre pasa)

const TURNSTILE_SECRET_KEY =
  process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"; // secret de test

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface VerifyResult {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verifica un token de Turnstile contra la API de Cloudflare.
 * @param token Token devuelto por el widget del cliente.
 * @param remoteip IP del cliente (opcional).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteip?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token) {
    return { ok: false, error: "Falta el token de verificación de seguridad." };
  }

  try {
    const body = new URLSearchParams();
    body.append("secret", TURNSTILE_SECRET_KEY);
    body.append("response", token);
    if (remoteip) body.append("remoteip", remoteip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      // Cacheo: Turnstile tokens son de un solo uso, no cachear
      cache: "no-store",
    });
    const data = (await res.json()) as VerifyResult;

    if (!data.success) {
      return {
        ok: false,
        error:
          "La verificación de seguridad falló. Completa el desafío e intenta de nuevo.",
      };
    }
    return { ok: true };
  } catch (e) {
    console.error("[turnstile] verify error", e);
    return {
      ok: false,
      error: "No se pudo verificar la seguridad. Intenta de nuevo.",
    };
  }
}
