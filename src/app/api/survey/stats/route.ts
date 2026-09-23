import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SURVEY, DRIVER_TYPES, type DriverTypeId } from "@/lib/survey-data";

// GET /api/survey/stats — agregaciones para el dashboard
export async function GET() {
  try {
    const rows = await db.surveyResponse.findMany();
    const total = rows.length;

    // Parse answers
    const parsed = rows.map((r) => ({
      driverType: r.driverType as DriverTypeId,
      answers: JSON.parse(r.answers) as Record<string, string | string[] | number>,
      completedAt: r.completedAt,
    }));

    // --- Distribución por tipo de conductor ---
    const byDriverType = DRIVER_TYPES.map((dt) => ({
      id: dt.id,
      label: dt.label,
      count: parsed.filter((p) => p.driverType === dt.id).length,
    }));

    // --- Distribución por sexo ---
    const bySex = countValues(parsed, "sexo");

    // --- Distribución por grupo de edad ---
    const ageGroups: Record<string, number> = {
      "14-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0,
      "Sin dato": 0,
    };
    for (const p of parsed) {
      const a = p.answers["edad"];
      const age = typeof a === "number" ? a : a ? Number(a) : NaN;
      if (isNaN(age)) {
        ageGroups["Sin dato"]++;
      } else if (age < 25) ageGroups["14-24"]++;
      else if (age < 35) ageGroups["25-34"]++;
      else if (age < 45) ageGroups["35-44"]++;
      else if (age < 55) ageGroups["45-54"]++;
      else ageGroups["55+"]++;
    }

    // --- Uso de casco ---
    const casco = countValues(parsed, "casco_usa");

    // --- Licencia ---
    const licencia = countValues(parsed, "licencia");

    // --- Ha tenido siniestro ---
    const siniestro = countValues(parsed, "ha_tenido_siniestro");

    // --- Gravedad del siniestro ---
    const siniestroGravedad = countValues(parsed, "siniestro_gravedad");

    // --- Causas principales (checkbox, multi-valor) ---
    const causasPrincipales = countCheckbox(parsed, "causas_principales");

    // --- Medidas efectivas (checkbox) ---
    const medidasEfectivas = countCheckbox(parsed, "medidas_efectivas");

    // --- Percepción de seguridad (escala 1-5) ---
    const percepcionSeguridad = countScale(parsed, "percepcion_seguridad");

    // --- Efectividad del control (escala 1-5) ---
    const efectividadControl = countScale(parsed, "efectividad_control");

    // --- Uso del celular ---
    const usoCelular = countValues(parsed, "uso_celular");

    // --- Alcohol y conducción ---
    const alcohol = countValues(parsed, "alcohol_conduccion");

    // --- Estado de vías (escala) ---
    const estadoVias = countScale(parsed, "estado_vias");

    // --- Promedios de escalas ---
    const avgPercepcionSeguridad = avgScale(parsed, "percepcion_seguridad");
    const avgEfectividadControl = avgScale(parsed, "efectividad_control");
    const avgEstadoVias = avgScale(parsed, "estado_vias");
    const avgSenalizacion = avgScale(parsed, "senalizacion");
    const avgVelocidadOpinion = avgScale(parsed, "velocidad_opinion");

    // --- Promedio de edad ---
    const ages = parsed
      .map((p) => {
        const a = p.answers["edad"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
      })
      .filter((n): n is number => n !== null);
    const avgEdad = ages.length ? ages.reduce((s, n) => s + n, 0) / ages.length : 0;

    return NextResponse.json({
      total,
      byDriverType,
      bySex,
      ageGroups,
      casco,
      licencia,
      siniestro,
      siniestroGravedad,
      causasPrincipales,
      medidasEfectivas,
      percepcionSeguridad,
      efectividadControl,
      usoCelular,
      alcohol,
      estadoVias,
      avg: {
        percepcionSeguridad: avgPercepcionSeguridad,
        efectividadControl: avgEfectividadControl,
        estadoVias: avgEstadoVias,
        senalizacion: avgSenalizacion,
        velocidadOpinion: avgVelocidadOpinion,
        edad: avgEdad,
      },
      meta: {
        sections: SURVEY.sections.length,
        driverTypes: DRIVER_TYPES.length,
      },
    });
  } catch (e) {
    console.error("[survey/stats] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Helpers de agregación
// ---------------------------------------------------------------------------

type Parsed = {
  driverType: DriverTypeId;
  answers: Record<string, string | string[] | number>;
  completedAt: Date;
};

function countValues(
  parsed: Parsed[],
  questionId: string
): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of parsed) {
    const v = p.answers[questionId];
    if (v === undefined || v === null || v === "") continue;
    const key = String(v);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countCheckbox(
  parsed: Parsed[],
  questionId: string
): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of parsed) {
    const v = p.answers[questionId];
    if (Array.isArray(v)) {
      for (const opt of v) {
        map.set(opt, (map.get(opt) ?? 0) + 1);
      }
    } else if (typeof v === "string" && v) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countScale(
  parsed: Parsed[],
  questionId: string
): Record<string, number> {
  const out: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const p of parsed) {
    const v = p.answers[questionId];
    const n = typeof v === "number" ? v : v ? Number(v) : NaN;
    if (!isNaN(n) && n >= 1 && n <= 5) {
      out[String(n)] = (out[String(n)] ?? 0) + 1;
    }
  }
  return out;
}

function avgScale(parsed: Parsed[], questionId: string): number {
  let sum = 0;
  let count = 0;
  for (const p of parsed) {
    const v = p.answers[questionId];
    const n = typeof v === "number" ? v : v ? Number(v) : NaN;
    if (!isNaN(n) && n >= 1 && n <= 5) {
      sum += n;
      count++;
    }
  }
  return count ? sum / count : 0;
}
