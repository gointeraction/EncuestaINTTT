import {
  DRIVER_TYPES,
  getActiveQuestions,
  getSectionsForDriverType,
  type DriverTypeId,
  type Question,
  type Section,
} from "@/lib/survey-data";

type Answers = Record<string, unknown>;

export interface VisionCeroValidation {
  ok: boolean;
  errors: string[];
}

/** ¿El valor es un tipo de conductor del catálogo? */
export function isDriverTypeId(value: unknown): value is DriverTypeId {
  return typeof value === "string" && DRIVER_TYPES.some((d) => d.id === value);
}

/** ¿La pregunta está respondida? (maneja la compuesta estado-municipio). */
function isAnswered(q: Question, answers: Answers): boolean {
  if (q.type === "estado-municipio") {
    const e = answers["estado"];
    const m = answers["municipio"];
    return !!e && !!m && e !== "" && m !== "";
  }
  const v = answers[q.id];
  return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
}

/**
 * Valida que el cuestionario Visión Cero esté COMPLETO y sea VÁLIDO, según la definición real
 * (appliesTo/showIf): los requeridos aplicables deben estar respondidos y los valores deben
 * respetar el tipo/opciones. Espeja la validación del cliente y es la AUTORIDAD del servidor.
 */
export function validateVisionCeroAnswers(
  driverType: DriverTypeId,
  answers: Answers,
): VisionCeroValidation {
  const errors: string[] = [];
  for (const section of getSectionsForDriverType(driverType) as Section[]) {
    for (const q of getActiveQuestions(section, driverType, answers as never)) {
      if (q.required && !isAnswered(q, answers)) {
        errors.push(`Falta responder: ${q.text}`);
      }
      const v = answers[q.id];
      if (v === undefined || v === null || v === "") continue;
      switch (q.type) {
        case "scale":
        case "number": {
          const n = typeof v === "number" ? v : Number(v);
          if (Number.isNaN(n)) {
            errors.push(`Valor numérico inválido en: ${q.text}`);
          } else if (q.type === "scale") {
            const min = q.scaleMin ?? 1;
            const max = q.scaleMax ?? 5;
            if (n < min || n > max) errors.push(`Fuera de rango en: ${q.text}`);
          }
          break;
        }
        case "radio":
        case "select": {
          if (q.options && !q.options.includes(String(v))) {
            errors.push(`Opción inválida en: ${q.text}`);
          }
          break;
        }
        case "checkbox": {
          const arr = Array.isArray(v) ? v : [v];
          if (q.options && arr.some((x) => !q.options!.includes(String(x)))) {
            errors.push(`Opción inválida en: ${q.text}`);
          }
          break;
        }
        default:
          break;
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Tamaño máximo del documento de respuestas (anti-abuso). */
export const MAX_ANSWERS_BYTES = 256 * 1024;
