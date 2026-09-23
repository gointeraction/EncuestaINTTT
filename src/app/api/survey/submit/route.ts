import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/survey/submit — guardar una respuesta de encuesta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverType, answers } = body ?? {};

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

    const saved = await db.surveyResponse.create({
      data: {
        driverType,
        answers: JSON.stringify(answers),
      },
    });

    return NextResponse.json({ id: saved.id, ok: true });
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
      })),
    });
  } catch (e) {
    console.error("[survey/responses] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
