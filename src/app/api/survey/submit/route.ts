import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  validatePersonalData,
  cedulaYaParticipa,
  generateSorteoCode,
} from "@/lib/sorteo";

// POST /api/survey/submit — guardar una respuesta de encuesta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverType, answers, sorteo } = body ?? {};

    if (!driverType || typeof driverType !== "string") {
      return NextResponse.json(
        { error: "driverType es requerido" },
        { status: 400 }
      );
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "answers es requerido" },
        { status: 400 }
      );
    }

    // --- Datos del sorteo (opcionales) ---
    let participaSorteo = false;
    let nombre: string | null = null;
    let cedula: string | null = null;
    let telefono: string | null = null;
    let codigoSorteo: string | null = null;

    if (sorteo && sorteo.participa === true) {
      const v = validatePersonalData({
        nombre: sorteo.nombre ?? "",
        cedula: sorteo.cedula ?? "",
        telefono: sorteo.telefono ?? "",
      });
      if (!v.ok) {
        return NextResponse.json(
          { error: "Datos del sorteo inválidos", fieldErrors: v.errors },
          { status: 400 }
        );
      }
      // Verificar que la cédula no haya participado ya
      const ya = await cedulaYaParticipa(v.normalized.cedula);
      if (ya) {
        return NextResponse.json(
          {
            error:
              "Esta cédula ya está registrada en el sorteo. Solo se permite una participación por persona.",
          },
          { status: 409 }
        );
      }
      participaSorteo = true;
      nombre = v.normalized.nombre;
      cedula = v.normalized.cedula;
      telefono = v.normalized.telefono;
      codigoSorteo = generateSorteoCode();
    }

    const saved = await db.surveyResponse.create({
      data: {
        driverType,
        answers: JSON.stringify(answers),
        participaSorteo,
        nombre,
        cedula,
        telefono,
        codigoSorteo,
      },
    });

    return NextResponse.json({
      id: saved.id,
      ok: true,
      codigoSorteo,
      participaSorteo,
    });
  } catch (e) {
    console.error("[survey/submit] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// GET /api/survey/submit — listar respuestas (para administración)
export async function GET() {
  try {
    const responses = await db.surveyResponse.findMany({
      orderBy: { completedAt: "desc" },
      take: 200,
    });
    return NextResponse.json({
      responses: responses.map((r) => ({
        id: r.id,
        driverType: r.driverType,
        answers: JSON.parse(r.answers),
        completedAt: r.completedAt,
        participaSorteo: r.participaSorteo,
        nombre: r.nombre,
        cedula: r.cedula,
        telefono: r.telefono,
        codigoSorteo: r.codigoSorteo,
      })),
    });
  } catch (e) {
    console.error("[survey/responses] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
