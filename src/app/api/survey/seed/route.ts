import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DRIVER_TYPES,
  SURVEY,
  getActiveQuestions,
  type DriverTypeId,
  type Question,
} from "@/lib/survey-data";
import { generateSorteoCode } from "@/lib/sorteo";

// POST /api/survey/seed?count=60 — genera datos de demostración
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const count = Math.min(200, Math.max(1, Number(url.searchParams.get("count") ?? 60)));

    // Limpiar existentes
    await db.surveyResponse.deleteMany({});

    const usedCedulas = new Set<string>();
    const created = [];
    for (let i = 0; i < count; i++) {
      const driverType = pick(DRIVER_TYPES).id;
      const answers = generateAnswers(driverType);

      // ~65% de los registros participan en el sorteo
      const participa = Math.random() < 0.65;
      const data: Parameters<typeof db.surveyResponse.create>[0]["data"] = {
        driverType,
        answers: JSON.stringify(answers),
        participaSorteo: participa,
        nombre: null,
        cedula: null,
        telefono: null,
        codigoSorteo: null,
      };
      if (participa) {
        let cedula = genCedula();
        let attempts = 0;
        while (usedCedulas.has(cedula) && attempts < 10) {
          cedula = genCedula();
          attempts++;
        }
        usedCedulas.add(cedula);
        data.nombre = genNombre();
        data.cedula = cedula;
        data.telefono = genTelefono();
        data.codigoSorteo = generateSorteoCode();
      }

      const saved = await db.surveyResponse.create({ data });
      created.push(saved.id);
    }

    return NextResponse.json({ ok: true, seeded: created.length });
  } catch (e) {
    console.error("[survey/seed] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Generador de respuestas plausibles
// ---------------------------------------------------------------------------

function generateAnswers(driverType: DriverTypeId): Record<string, string | string[] | number> {
  const answers: Record<string, string | string[] | number> = {};

  // Recorrer secciones aplicables y, dentro de cada una, las preguntas activas
  // (respetando showIf) para llenar respuestas coherentes.
  const sections = SURVEY.sections.filter(
    (s) => s.appliesTo === "all" || s.appliesTo.includes(driverType)
  );

  for (const section of sections) {
    // Iteramos varias veces para resolver dependencias showIf
    for (let pass = 0; pass < 3; pass++) {
      const active = getActiveQuestions(section, driverType, answers);
      for (const q of active) {
        if (answers[q.id] !== undefined) continue;
        const v = fakeAnswer(q, driverType);
        if (v !== null) answers[q.id] = v;
      }
    }
  }

  return answers;
}

function fakeAnswer(
  q: Question,
  driverType: DriverTypeId
): string | string[] | number | null {
  switch (q.id) {
    case "edad":
      return randInt(17, 62);
    case "sexo":
      return weighted([
        ["Masculino", 0.7],
        ["Femenino", 0.28],
        ["Otro / Prefiero no decir", 0.02],
      ]);
    case "ciudad":
      return pick(["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Pereira", "Cartagena"]);
    case "ocupacion":
      return pick(["Estudiante", "Comerciante", "Delivery", "Mototaxista", "Empleado", "Independiente"]);
    case "nivel_educativo":
      return pick(q.options ?? []);
    case "anos_conduciendo":
      return randInt(1, 25);
    case "licencia":
      return weighted([
        ["Sí, vigente", 0.45],
        ["Sí, vencida", 0.1],
        ["No tengo licencia", 0.35],
        ["Estoy en trámite", 0.1],
      ]);
    case "categoria_licencia":
      return pick(["A1", "A2", "B1", "C1", "No estoy seguro"]);
    case "motivo_no_licencia":
      return pick(["Es muy cara", "No tengo tiempo", "No sé cómo tramitarla", "No la considero necesaria"]);
    case "frecuencia_conduccion":
      return weighted([
        ["Todos los días", 0.55],
        ["Varias veces por semana", 0.25],
        ["Una vez por semana", 0.1],
        ["Ocasionalmente", 0.08],
        ["Ya no conduzco", 0.02],
      ]);
    case "dejo_conducir_razon":
      return pick(["Tuve un accidente", "Por seguridad", "Compré carro", "Cambio de ciudad"]);
    case "uso_principal":
      if (driverType === "delivery") return "Trabajo (delivery / mensajería)";
      if (driverType === "mototaxista") return "Transporte de pasajeros (mototaxi)";
      return weighted([
        ["Transporte al trabajo / estudio", 0.6],
        ["Recreativo / paseo", 0.2],
        ["Otro", 0.2],
      ]);
    case "uso_otro":
      return "Trámites personales";
    case "km_diarios":
      return randInt(5, 120);
    case "horas_diarias":
      return randInt(4, 12);
    case "plataforma_delivery":
      return pick(["Uber Eats", "Rappi", "PedidosYa", "iFood", "Propia"]);
    case "pasajeros_dia":
      return randInt(5, 40);
    case "conduccion_nocturna":
      return weighted([
        ["Sí, frecuentemente", 0.25],
        ["A veces", 0.4],
        ["Rara vez", 0.25],
        ["Nunca", 0.1],
      ]);
    case "clima_lluvia":
      return weighted([
        ["Sí, siempre", 0.3],
        ["A veces, si es necesario", 0.5],
        ["No, evito conducir", 0.2],
      ]);
    case "casco_usa":
      return weighted([
        ["Siempre", 0.6],
        ["Casi siempre", 0.2],
        ["A veces", 0.1],
        ["Rara vez", 0.05],
        ["Nunca", 0.05],
      ]);
    case "casco_tipo":
      return pick(["Integral", "Modular", "Jet / abierto", "Cross / motocross", "Bicicleta / no certificado"]);
    case "casco_certificado":
      return weighted([
        ["Sí", 0.3],
        ["No", 0.4],
        ["No lo sé", 0.3],
      ]);
    case "motivo_no_casco":
      return pick(["Incomodidad", "Calor", "No lo considero necesario", "No tengo dinero", "Se me olvida"]);
    case "equipamiento_adicional":
      return pickSome(q.options ?? [], 1, 4);
    case "elementos_moto":
      return pickSome(q.options ?? [], 2, 5);
    case "velocidad_opinion":
      return randInt(2, 5);
    case "uso_celular":
      return weighted([
        ["Sí, frecuentemente", 0.15],
        ["A veces", 0.3],
        ["Solo GPS", 0.4],
        ["Nunca", 0.15],
      ]);
    case "alcohol_conduccion":
      return weighted([
        ["Sí, varias veces", 0.05],
        ["Sí, alguna vez", 0.2],
        ["Nunca", 0.75],
      ]);
    case "pasajeros_extra":
      return weighted([
        ["Frecuentemente", 0.1],
        ["A veces", 0.3],
        ["Nunca", 0.6],
      ]);
    case "rebases_peatones":
      return randInt(2, 5);
    case "presion_tiempo":
      return weighted([
        ["Siempre", 0.25],
        ["Frecuentemente", 0.35],
        ["A veces", 0.3],
        ["Rara vez", 0.08],
        ["Nunca", 0.02],
      ]);
    case "fatiga":
      return weighted([
        ["Frecuentemente", 0.2],
        ["A veces", 0.4],
        ["Rara vez", 0.3],
        ["Nunca", 0.1],
      ]);
    case "ha_tenido_siniestro":
      return weighted([
        ["Sí, como conductor de moto", 0.35],
        ["Sí, como pasajero de moto", 0.1],
        ["Sí, como peatón/otro vehículo", 0.1],
        ["No, nunca", 0.45],
      ]);
    case "siniestro_gravedad":
      return weighted([
        ["Solo daños materiales", 0.45],
        ["Lesiones leves", 0.3],
        ["Lesiones graves", 0.15],
        ["Fallecimiento", 0.04],
        ["Fallecimiento de otra persona", 0.06],
      ]);
    case "siniestro_ano":
      return randInt(2018, 2025);
    case "siniestro_causas":
      return pickSome(q.options ?? [], 1, 3);
    case "siniestro_atencion":
      return weighted([
        ["Sí, inmediata", 0.4],
        ["Sí, pero tardía", 0.2],
        ["No recibí atención", 0.25],
        ["No la necesité", 0.15],
      ]);
    case "familiar_relacion":
      return pick(["Padre / Madre", "Hijo/a", "Esposo/a / Pareja", "Hermano/a", "Otro familiar", "Amigo/a cercano"]);
    case "familiar_siniestro_tipo":
      return weighted([
        ["Lesiones leves", 0.25],
        ["Lesiones graves / discapacidad", 0.35],
        ["Fallecimiento", 0.4],
      ]);
    case "causas_principales":
      return pickSome(q.options ?? [], 2, 4);
    case "medidas_efectivas":
      return pickSome(q.options ?? [], 2, 4);
    case "efectividad_control":
      return randInt(1, 4);
    case "percepcion_seguridad":
      return randInt(1, 4);
    case "estado_vias":
      return randInt(1, 4);
    case "senalizacion":
      return randInt(1, 4);
    case "iluminacion":
      return weighted([
        ["Sí, en la mayoría", 0.2],
        ["Solo en algunas", 0.45],
        ["No, es deficiente", 0.3],
        ["No conduzco de noche", 0.05],
      ]);
    case "problemas_via":
      return pickSome(q.options ?? [], 2, 4);
    case "conoce_limites_velocidad":
      return weighted([
        ["Sí, claramente", 0.4],
        ["Más o menos", 0.4],
        ["No los conozco", 0.2],
      ]);
    case "conoce_alcoholemia":
      return weighted([
        ["Sí, claramente", 0.35],
        ["Más o menos", 0.4],
        ["No las conozco", 0.25],
      ]);
    case "conoce_sanciones":
      return weighted([
        ["Sí, claramente", 0.3],
        ["Más o menos", 0.4],
        ["No las conozco", 0.3],
      ]);
    case "recibio_capacitacion":
      return weighted([
        ["Sí, en academia", 0.2],
        ["Sí, por la empresa / app", 0.15],
        ["Sí, informalmente", 0.25],
        ["No", 0.4],
      ]);
    case "propuesta_principal":
      return pick([
        "Más educación vial desde la escuela",
        "Controles de alcoholemia más frecuentes",
        "Mejorar el estado de las vías y señalización",
        "Capacitación obligatoria para motociclistas",
        "Regulación de las apps de delivery",
        "Más ciclorrutas y separadores",
        "Endurecer sanciones por no usar casco",
      ]);
    case "apoyo_vision_cero":
      return weighted([
        ["Sí, totalmente", 0.7],
        ["Sí, en parte", 0.2],
        ["No estoy seguro", 0.08],
        ["No", 0.02],
      ]);
    case "disposicion_participar":
      return weighted([
        ["Sí, seguro", 0.6],
        ["Tal vez", 0.3],
        ["No", 0.1],
      ]);
    case "comentario_final":
      return "";
    default:
      // fallback genérico
      if (q.options) return pick(q.options);
      return "";
  }
}

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Generadores de datos personales para el sorteo ---
const NOMBRES = [
  "José Rodríguez", "María González", "Carlos Pérez", "Ana Hernández",
  "Luis Martínez", "Carolina García", "Miguel Sánchez", "Andrea Ramírez",
  "Javier Torres", "Daniela Morales", "Fernando Castro", "Patricia Jiménez",
  "Roberto Díaz", "Sofía Romero", "Eduardo Vargas", "Valentina Mendoza",
  "Ricardo Aguilar", "Natalia Cordero", "Jorge Rivas", "Gabriela Peña",
  "Manuel Lara", "Teresa Bravo", "Antonio Medina", "Lucía Ortega",
];

function genNombre(): string {
  return pick(NOMBRES);
}

function genCedula(): string {
  const letra = Math.random() < 0.85 ? "V" : "E";
  const num = randInt(1_000_000, 29_999_999);
  return `${letra}-${num}`;
}

function genTelefono(): string {
  const prefix = pick(["412", "414", "424", "416", "426"]);
  const rest = String(randInt(0, 9_999_999)).padStart(7, "0");
  return `+58-${prefix}-${rest}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSome<T>(arr: T[], min: number, max: number): T[] {
  const n = randInt(min, Math.min(max, arr.length));
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function weighted<T>(pairs: [T, number][]): T {
  const r = Math.random();
  let acc = 0;
  for (const [v, w] of pairs) {
    acc += w;
    if (r <= acc) return v;
  }
  return pairs[pairs.length - 1][0];
}
