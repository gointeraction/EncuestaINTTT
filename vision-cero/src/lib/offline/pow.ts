/**
 * Prueba de trabajo (hashcash) en el CLIENTE — se computa al terminar una entrevista OFFLINE
 * (sin red no hay Turnstile). El resultado se envía como `botProof` y el servidor lo verifica.
 */
export async function computePow(challenge: string, difficulty = 4): Promise<number> {
  const data = new TextEncoder();
  const prefix = "0".repeat(difficulty);
  for (let nonce = 0; nonce < 50_000_000; nonce++) {
    const buf = await crypto.subtle.digest("SHA-256", data.encode(`${challenge}:${nonce}`));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (hex.startsWith(prefix)) return nonce;
  }
  throw new Error("No se pudo calcular la prueba de trabajo.");
}
