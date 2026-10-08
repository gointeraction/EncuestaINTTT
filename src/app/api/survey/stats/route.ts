import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";
import { parseSurveyRows, computeSurveyStats, RawSurveyRow } from "@/lib/survey-analytics";
import fs from "fs";
import path from "path";

function getFallbackRows(): RawSurveyRow[] {
  try {
    const backupPath = path.join(process.cwd(), "db", "sqlite_backup.json");
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          driverType: item.driverType || "otro_conductor",
          answers: typeof item.answers === "string" ? item.answers : JSON.stringify(item.answers),
          completedAt: new Date(item.completedAt || Date.now()),
          participaSorteo: Boolean(item.participaSorteo),
        }));
      }
    }
  } catch (err) {
    console.warn("[survey/stats] Error reading sqlite_backup fallback", err);
  }
  return [];
}

// GET /api/survey/stats — agregaciones para el dashboard (requiere admin)
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "1";

    let rows: RawSurveyRow[] = [];
    let isFromDb = true;

    try {
      // 1. Si no se fuerza refresh, intentar servir desde la tabla de sumarización
      if (!forceRefresh) {
        const cached = await db.surveySummary.findUnique({
          where: { id: "latest" },
        });

        if (cached?.summaryData) {
          try {
            const parsedData = JSON.parse(cached.summaryData);
            return NextResponse.json({
              ...parsedData,
              _source: "precomputed_summary",
              _cachedAt: cached.calculatedAt,
              _totalSummarized: cached.totalCount,
            });
          } catch (err) {
            console.warn("[survey/stats] Error parsing cached summary, fallback to live query", err);
          }
        }
      }

      // 2. Si no hay resumen o se pidió refresh, calcular en vivo desde DB
      rows = await db.surveyResponse.findMany({
        select: {
          driverType: true,
          answers: true,
          completedAt: true,
          participaSorteo: true,
        },
      });
    } catch (dbErr) {
      console.warn("[survey/stats] Error de conexión a PostgreSQL. Usando respaldo local:", dbErr);
      isFromDb = false;
      rows = getFallbackRows();
    }

    const parsed = parseSurveyRows(rows);
    const stats = computeSurveyStats(parsed, rows.length);

    // 3. Si la base de datos está conectada, guardar resumen
    if (isFromDb) {
      try {
        await db.surveySummary.upsert({
          where: { id: "latest" },
          create: {
            id: "latest",
            calculatedAt: new Date(),
            totalCount: rows.length,
            summaryData: JSON.stringify(stats),
          },
          update: {
            calculatedAt: new Date(),
            totalCount: rows.length,
            summaryData: JSON.stringify(stats),
          },
        });
      } catch (upsertErr) {
        console.warn("[survey/stats] Fallo al guardar en surveySummary:", upsertErr);
      }
    }

    return NextResponse.json({
      ...stats,
      _source: isFromDb ? "live_computed" : "local_backup",
      _cachedAt: new Date(),
      _totalSummarized: rows.length,
    });
  } catch (e) {
    console.error("[survey/stats] error", e);
    // Retornar fallback en lugar de 500 para evitar que la UI crashee
    const fallbackRows = getFallbackRows();
    const parsed = parseSurveyRows(fallbackRows);
    const stats = computeSurveyStats(parsed, fallbackRows.length);
    return NextResponse.json({
      ...stats,
      _source: "emergency_fallback",
    });
  }
}

// POST /api/survey/stats — trigger manual de sumarización
export async function POST() {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const startTime = Date.now();
    let rows: RawSurveyRow[] = [];

    try {
      rows = await db.surveyResponse.findMany({
        select: {
          driverType: true,
          answers: true,
          completedAt: true,
          participaSorteo: true,
        },
      });
    } catch {
      rows = getFallbackRows();
    }

    const parsed = parseSurveyRows(rows);
    const stats = computeSurveyStats(parsed, rows.length);

    try {
      await db.surveySummary.upsert({
        where: { id: "latest" },
        create: {
          id: "latest",
          calculatedAt: new Date(),
          totalCount: rows.length,
          summaryData: JSON.stringify(stats),
        },
        update: {
          calculatedAt: new Date(),
          totalCount: rows.length,
          summaryData: JSON.stringify(stats),
        },
      });
    } catch (err) {
      console.warn("[survey/stats POST] Fallo al guardar en cache:", err);
    }

    return NextResponse.json({
      ok: true,
      records: rows.length,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[survey/stats POST] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
