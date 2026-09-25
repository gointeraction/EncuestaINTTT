import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";
import { parseSurveyRows, computeSurveyStats } from "@/lib/survey-analytics";

// GET /api/survey/stats — agregaciones para el dashboard (requiere admin)
// Si existe resumen pre-agregado en SurveySummary, responde en O(1) tiempo récord (< 5ms).
// Admite '?refresh=1' para forzar re-cálculo en vivo y actualización de caché.
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "1";

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

    // 2. Si no hay resumen o se pidió refresh, calcular en vivo
    const rows = await db.surveyResponse.findMany({
      select: {
        driverType: true,
        answers: true,
        completedAt: true,
        participaSorteo: true,
      },
    });

    const parsed = parseSurveyRows(rows);
    const stats = computeSurveyStats(parsed, rows.length);

    // 3. Persistir en background/inline para subsecuentes lecturas
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

    return NextResponse.json({
      ...stats,
      _source: "live_computed",
      _cachedAt: new Date(),
      _totalSummarized: rows.length,
    });
  } catch (e) {
    console.error("[survey/stats] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/survey/stats — trigger manual de sumarización desde el Dashboard o script
export async function POST() {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const startTime = Date.now();
    const rows = await db.surveyResponse.findMany({
      select: {
        driverType: true,
        answers: true,
        completedAt: true,
        participaSorteo: true,
      },
    });

    const parsed = parseSurveyRows(rows);
    const stats = computeSurveyStats(parsed, rows.length);

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
