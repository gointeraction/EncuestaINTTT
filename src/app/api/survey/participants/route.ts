import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";

// GET /api/survey/participants — lista de participantes del sorteo (admin)
// Devuelve cédula, nombre, teléfono y código (para ejecutar el sorteo).
export async function GET() {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const rows = await db.surveyResponse.findMany({
      where: { participaSorteo: true },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        nombre: true,
        cedula: true,
        telefono: true,
        codigoSorteo: true,
        driverType: true,
        completedAt: true,
      },
    });
    return NextResponse.json({
      total: rows.length,
      participants: rows.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        cedula: r.cedula,
        telefono: r.telefono,
        codigo: r.codigoSorteo,
        driverType: r.driverType,
        completedAt: r.completedAt,
      })),
    });
  } catch (e) {
    console.error("[survey/participants] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
