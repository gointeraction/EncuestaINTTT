/**
 * Verificación de Cloudflare Turnstile para el login de staff.
 *   - Sin `TURNSTILE_SECRET_KEY` o con la clave de PRUEBA («siempre pasa», prefijo 1x)
 *     → no se exige captcha (entornos de desarrollo / automatización).
 *   - Con una clave real → se valida contra el endpoint `siteverify`.
 */
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(token: unknown, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.startsWith('1x00000000')) return true;
  if (typeof token !== 'string' || !token) return false;

  try {
    const form = new URLSearchParams({ secret, response: token });
    if (remoteIp) form.set('remoteip', remoteIp);
    const res = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
