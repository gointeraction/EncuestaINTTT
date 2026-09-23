// ============================================================================
// Validadores para datos personales del sorteo (Venezuela)
// ============================================================================

export interface PersonalData {
  nombre: string;
  cedula: string;
  telefono: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof PersonalData, string>>;
  normalized: PersonalData;
}

/**
 * Valida y normaliza una cédula venezolana.
 * Acepta formatos: V-12345678, E-12345678, V12345678, 12345678
 * Devuelve formato canónico: V-12345678 (o E-...)
 */
export function normalizeCedula(input: string): { ok: boolean; value?: string; error?: string } {
  const clean = (input ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (!clean) return { ok: false, error: "La cédula es obligatoria." };

  // Separar letra inicial y número
  const match = clean.match(/^([VE])?-?0*(\d{6,8})$/);
  if (!match) {
    return {
      ok: false,
      error: "Formato inválido. Usa V-12345678 o E-12345678 (6 a 8 dígitos).",
    };
  }
  const letra = match[1] ?? "V";
  const numero = match[2];
  return { ok: true, value: `${letra}-${numero}` };
}

/**
 * Valida y normaliza un número de teléfono venezolano.
 * Acepta: 0412-1234567, +58 412 1234567, 584121234567, 04141234567, etc.
 * Devuelve formato canónico: +58-412-1234567
 */
export function normalizeTelefono(input: string): { ok: boolean; value?: string; error?: string } {
  const clean = (input ?? "").trim().replace(/[\s\-().]/g, "");
  if (!clean) return { ok: false, error: "El teléfono es obligatorio." };

  // Quitar prefijo internacional
  let digits = clean;
  if (digits.startsWith("+58")) digits = digits.slice(3);
  else if (digits.startsWith("58")) digits = digits.slice(2);
  // Quitar cero inicial de móvil (0412 → 412)
  if (digits.startsWith("0")) digits = digits.slice(1);

  // Móvil venezolano: 4XX + 7 dígitos = 10 dígitos total
  const mobileMatch = digits.match(/^(412|414|424|416|426)\d{7}$/);
  if (mobileMatch) {
    const prefix = digits.slice(0, 3);
    const rest = digits.slice(3);
    return { ok: true, value: `+58-${prefix}-${rest}` };
  }

  return {
    ok: false,
    error: "Número inválido. Debe ser un móvil venezolano (0412, 0414, 0424, 0416 o 0426).",
  };
}

export function validatePersonalData(data: Partial<PersonalData>): ValidationResult {
  const errors: ValidationResult["errors"] = {};
  const normalized: PersonalData = { nombre: "", cedula: "", telefono: "" };

  // Nombre
  const nombre = (data.nombre ?? "").trim();
  if (nombre.length < 3) {
    errors.nombre = "Ingresa tu nombre completo (mínimo 3 caracteres).";
  } else {
    normalized.nombre = nombre;
  }

  // Cédula
  const ced = normalizeCedula(data.cedula ?? "");
  if (!ced.ok) {
    errors.cedula = ced.error;
  } else {
    normalized.cedula = ced.value!;
  }

  // Teléfono
  const tel = normalizeTelefono(data.telefono ?? "");
  if (!tel.ok) {
    errors.telefono = tel.error;
  } else {
    normalized.telefono = tel.value!;
  }

  return { ok: Object.keys(errors).length === 0, errors, normalized };
}

/**
 * Verifica duplicados de cédula en el sorteo (una participación por persona).
 */
export async function cedulaYaParticipa(cedula: string, excludeId?: string): Promise<boolean> {
  const { db } = await import("@/lib/db");
  const existing = await db.surveyResponse.findFirst({
    where: {
      cedula,
      participaSorteo: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!existing;
}

/** Genera un código de confirmación para el sorteo (8 caracteres). */
export function generateSorteoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** Códigos móviles venezolanos válidos (para mostrar en UI). */
export const VE_MOBILE_PREFIXES = ["0412", "0414", "0424", "0416", "0426"];
