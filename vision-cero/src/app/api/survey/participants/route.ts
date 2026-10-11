import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

// GET /api/survey/participants — lista de participantes del sorteo (admin)
export async function GET() {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
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
    } catch (dbErr) {
      console.warn("[survey/participants] Fallback a sqlite_backup.json:", dbErr);
      const backupPath = path.join(process.cwd(), "db", "sqlite_backup.json");
      if (fs.existsSync(backupPath)) {
        const content = fs.readFileSync(backupPath, "utf-8");
        const list = JSON.parse(content);
        const filtered = Array.isArray(list)
          ? list.filter((item: any) => Boolean(item.participaSorteo))
          : [];

        return NextResponse.json({
          total: filtered.length,
          participants: filtered.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            cedula: item.cedula,
            telefono: item.telefono,
            codigo: item.codigoSorteo,
            driverType: item.driverType,
            completedAt: new Date(item.completedAt || Date.now()).toISOString(),
          })),
        });
      }

      return NextResponse.json({ total: 0, participants: [] });
    }
  } catch (e) {
    console.error("[survey/participants] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
