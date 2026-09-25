import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SURVEY, DRIVER_TYPES, type DriverTypeId } from "@/lib/survey-data";
import { isAdminAuthed } from "@/lib/admin-auth";

// GET /api/survey/stats — agregaciones para el dashboard (requiere admin)
export async function GET() {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const rows = await db.surveyResponse.findMany();
    const total = rows.length;

    // Parse answers
    const parsed = rows.map((r) => ({
      driverType: r.driverType as DriverTypeId,
      answers: JSON.parse(r.answers) as Record<string, string | string[] | number>,
      completedAt: r.completedAt,
      participaSorteo: r.participaSorteo,
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

    // --- Señalización vial (escala) ---
    const senalizacion = countScale(parsed, "senalizacion");

    // --- Velocidad: respeto al límite (escala) ---
    const velocidadOpinion = countScale(parsed, "velocidad_opinion");

    // --- Respeto a peatones (escala) ---
    const rebasesPeatones = countScale(parsed, "rebases_peatones");

    // --- Promedios de escalas ---
    const avgPercepcionSeguridad = avgScale(parsed, "percepcion_seguridad");
    const avgEfectividadControl = avgScale(parsed, "efectividad_control");
    const avgEstadoVias = avgScale(parsed, "estado_vias");
    const avgSenalizacion = avgScale(parsed, "senalizacion");
    const avgVelocidadOpinion = avgScale(parsed, "velocidad_opinion");
    const avgRebasesPeatones = avgScale(parsed, "rebases_peatones");

    // --- Promedio de edad ---
    const ages = parsed
      .map((p) => {
        const a = p.answers["edad"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
      })
      .filter((n): n is number => n !== null);
    const avgEdad = ages.length ? ages.reduce((s, n) => s + n, 0) / ages.length : 0;

    // --- Promedio de años conduciendo ---
    const anosCond = parsed
      .map((p) => {
        const a = p.answers["anos_conduciendo"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
      })
      .filter((n): n is number => n !== null);
    const avgAnosConduciendo = anosCond.length ? anosCond.reduce((s, n) => s + n, 0) / anosCond.length : 0;

    // --- Promedio de km diarios ---
    const kmArr = parsed
      .map((p) => {
        const a = p.answers["km_diarios"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
      })
      .filter((n): n is number => n !== null);
    const avgKmDiarios = kmArr.length ? kmArr.reduce((s, n) => s + n, 0) / kmArr.length : 0;

    // --- Promedio de horas diarias ---
    const horasArr = parsed
      .map((p) => {
        const a = p.answers["horas_diarias"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
      })
      .filter((n): n is number => n !== null);
    const avgHorasDiarias = horasArr.length ? horasArr.reduce((s, n) => s + n, 0) / horasArr.length : 0;

    // ====================================================================
    // NUEVOS INDICADORES
    // ====================================================================

    // --- Distribución por estado ---
    const byEstado = countValues(parsed, "estado").slice(0, 12);

    // --- Nivel educativo ---
    const nivelEducativo = countValues(parsed, "nivel_educativo");

    // --- Frecuencia de conducción ---
    const frecuenciaConduccion = countValues(parsed, "frecuencia_conduccion");

    // --- Categoría de licencia ---
    const categoriaLicencia = countValues(parsed, "categoria_licencia");

    // --- Uso principal de la moto ---
    const usoPrincipal = countValues(parsed, "uso_principal");

    // --- Conducción nocturna ---
    const conduccionNocturna = countValues(parsed, "conduccion_nocturna");

    // --- Conducción con lluvia ---
    const climaLluvia = countValues(parsed, "clima_lluvia");

    // --- Tipo de casco ---
    const cascoTipo = countValues(parsed, "casco_tipo");

    // --- Casco certificado ---
    const cascoCertificado = countValues(parsed, "casco_certificado");

    // --- Equipamiento adicional (checkbox) ---
    const equipamientoAdicional = countCheckbox(parsed, "equipamiento_adicional");

    // --- Elementos de seguridad de la moto (checkbox) ---
    const elementosMoto = countCheckbox(parsed, "elementos_moto");

    // --- Pasajeros extra (triples) ---
    const pasajerosExtra = countValues(parsed, "pasajeros_extra");

    // --- Presión por tiempo (delivery/mototaxi) ---
    const presionTiempo = countValues(parsed, "presion_tiempo");

    // --- Fatiga ---
    const fatiga = countValues(parsed, "fatiga");

    // --- Año del siniestro (distribución) ---
    const siniestroAno = countValues(parsed, "siniestro_ano");

    // --- Causas del siniestro (checkbox, distinto de causas_principales) ---
    const siniestroCausas = countCheckbox(parsed, "siniestro_causas");

    // --- Atención médica post-siniestro ---
    const siniestroAtencion = countValues(parsed, "siniestro_atencion");

    // --- Iluminación vial ---
    const iluminacion = countValues(parsed, "iluminacion");

    // --- Problemas de infraestructura (checkbox) ---
    const problemasVia = countCheckbox(parsed, "problemas_via");

    // --- Conocimiento de límites de velocidad ---
    const conoceLimitesVelocidad = countValues(parsed, "conoce_limites_velocidad");

    // --- Conocimiento de alcoholemia ---
    const conoceAlcoholemia = countValues(parsed, "conoce_alcoholemia");

    // --- Conocimiento de sanciones ---
    const conoceSanciones = countValues(parsed, "conoce_sanciones");

    // --- Recibió capacitación ---
    const recibioCapacitacion = countValues(parsed, "recibio_capacitacion");

    // --- Apoyo a Visión Cero ---
    const apoyoVisionCero = countValues(parsed, "apoyo_vision_cero");

    // --- Disposición a participar ---
    const disposicionParticipar = countValues(parsed, "disposicion_participar");

    // --- Sorteo: conteo de participantes ---
    const sorteoParticipantes = parsed.filter((p) => p.participaSorteo).length;

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
      // Nuevos
      byEstado,
      nivelEducativo,
      frecuenciaConduccion,
      categoriaLicencia,
      usoPrincipal,
      conduccionNocturna,
      climaLluvia,
      cascoTipo,
      cascoCertificado,
      equipamientoAdicional,
      elementosMoto,
      pasajerosExtra,
      presionTiempo,
      fatiga,
      siniestroAno,
      siniestroCausas,
      siniestroAtencion,
      senalizacion,
      velocidadOpinion,
      rebasesPeatones,
      iluminacion,
      problemasVia,
      conoceLimitesVelocidad,
      conoceAlcoholemia,
      conoceSanciones,
      recibioCapacitacion,
      apoyoVisionCero,
      disposicionParticipar,
      avg: {
        percepcionSeguridad: avgPercepcionSeguridad,
        efectividadControl: avgEfectividadControl,
        estadoVias: avgEstadoVias,
        senalizacion: avgSenalizacion,
        velocidadOpinion: avgVelocidadOpinion,
        rebasesPeatones: avgRebasesPeatones,
        edad: avgEdad,
        anosConduciendo: avgAnosConduciendo,
        kmDiarios: avgKmDiarios,
        horasDiarias: avgHorasDiarias,
      },
      sorteo: {
        participantes: sorteoParticipantes,
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
  participaSorteo: boolean;
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
