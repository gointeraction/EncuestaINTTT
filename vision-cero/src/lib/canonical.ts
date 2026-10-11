/** JSON canónico (claves ordenadas, recursivo) — firma estable cliente↔servidor. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k])).join(",") + "}";
}

/** Campos que se firman de un envío de dispositivo (kiosco/encuestador). */
export function signedPayload(payload: Record<string, unknown>): string {
  return canonicalJson({
    clientSubmissionId: payload.clientSubmissionId ?? null,
    channel: payload.channel ?? null,
    driverType: payload.driverType ?? null,
    answers: payload.answers ?? null,
  });
}
