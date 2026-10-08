import { db } from "../db";

/**
 * Enmascara información de identificación personal (PII) según el principio de privacidad (US-5.4 / D-4).
 */
export function maskPii(text: string): string {
  if (!text) return text;

  // 1. Enmascarar correos electrónicos: j****e@example.com
  let masked = text.replace(/([a-zA-Z0-9_\-.])[a-zA-Z0-9_\-.]*@([a-zA-Z0-9_\-.]+)/g, (_match, first, domain) => {
    return `${first}****@${domain}`;
  });

  // 2. Enmascarar cédulas de identidad (V-12345678 -> V-12***78)
  masked = masked.replace(/\b([VEve]-?\d{2})\d{2,4}(\d{2})\b/g, "$1***$2");

  // 3. Enmascarar números de teléfono (+58 412 1234567 -> +58 412 ***4567)
  masked = masked.replace(/(\+?58|\b0)?[ -]?(412|414|424|416|426)[ -]?\d{3}[ -]?(\d{4})/g, "+58 $2 ***$3");

  return masked;
}

/**
 * Escapa valores para CSV conforme al estándar RFC 4180.
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

import { getLocalSurveyById } from "./local-survey-store";

/**
 * Genera exportación de datos crudos de la encuesta en formato CSV con soporte UTF-8.
 */
export async function generateSurveyCsv(
  surveyId: string,
  options: { maskPii: boolean } = { maskPii: true }
): Promise<{ filename: string; csvContent: string } | null> {
  try {
    const survey = await db.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
        responses: {
          where: { status: "completed" },
          include: {
            answers: true,
          },
          orderBy: { submittedAt: "asc" },
        },
      },
    });

    if (!survey) {
      const local = getLocalSurveyById(surveyId);
      if (local) {
        const filename = `encuesta_${local.slug}_${new Date().toISOString().slice(0, 10)}.csv`;
        const headers = ["ID Respuesta", "Fecha de Envío", ...local.questions.map((q) => q.label)];
        const csvContent = "\uFEFF" + headers.map(escapeCsvValue).join(",") + "\n";
        return { filename, csvContent };
      }
      return null;
    }

  // 1. Construir encabezados
  const baseHeaders = [
    "ID Respuesta",
    "Fecha de Inicio",
    "Fecha de Envío",
    "Canal",
    "IP Anonimizada (Hash)",
  ];

  const questionHeaders = survey.questions.map((q) => q.label);
  const allHeaders = [...baseHeaders, ...questionHeaders];

  const rows: string[] = [];
  rows.push(allHeaders.map(escapeCsvValue).join(","));

  // 2. Construir filas por cada respuesta
  for (const resp of survey.responses) {
    const rowValues: string[] = [
      resp.id,
      resp.startedAt.toISOString(),
      resp.submittedAt ? resp.submittedAt.toISOString() : "",
      resp.channel,
      resp.ipHash,
    ];

    // Mapear respuestas por questionId
    const answerMap = new Map<string, string>();
    for (const ans of resp.answers) {
      let val = "";
      if (ans.valueNumeric !== null) {
        val = String(ans.valueNumeric);
      } else if (ans.valueOptions) {
        val = Array.isArray(ans.valueOptions)
          ? ans.valueOptions.join("; ")
          : JSON.stringify(ans.valueOptions);
      } else {
        val = ans.valueText || "";
      }

      if (options.maskPii) {
        val = maskPii(val);
      }

      answerMap.set(ans.questionId, val);
    }

    for (const q of survey.questions) {
      rowValues.push(answerMap.get(q.id) || "");
    }

    rows.push(rowValues.map(escapeCsvValue).join(","));
  }

  // UTF-8 BOM (\uFEFF) para apertura nativa e inmediata en Excel con tildes y caracteres especiales
  const csvContent = "\uFEFF" + rows.join("\r\n");
  const filename = `encuesta-${survey.slug}-${Date.now()}.csv`;

  return { filename, csvContent };
  } catch (err) {
    console.warn("[export-service] Fallback a local survey para export CSV:", err);
    const local = getLocalSurveyById(surveyId);
    if (!local) return null;
    const filename = `encuesta_${local.slug}_${Date.now()}.csv`;
    const headers = ["ID Respuesta", "Fecha de Envío", ...local.questions.map((q) => q.label)];
    const csvContent = "\uFEFF" + headers.map(escapeCsvValue).join(",") + "\r\n";
    return { filename, csvContent };
  }
}
