import { NextRequest, NextResponse } from "next/server";
import { requireRoles, createProblemResponse } from "@/lib/auth";
import { generateSurveyCsv } from "@/lib/services/export-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/surveys/:id/exports
 * Descarga directa de datos crudos en formato CSV con enmascaramiento PII según rol (US-5.4).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "analyst", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Solo el rol 'admin' puede solicitar desanonimización explícita
    const requestUnmask = searchParams.get("unmask") === "true";
    const maskPii = auth.user.role === "admin" ? !requestUnmask : true;

    const exportData = await generateSurveyCsv(id, { maskPii });

    if (!exportData) {
      return createProblemResponse({
        type: "https://httpstatuses.com/404",
        title: "Encuesta No Encontrada",
        status: 404,
        detail: `No se encontró la encuesta con ID '${id}'.`,
      });
    }

    return new NextResponse(exportData.csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportData.filename}"`,
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    console.error("[API Survey Export GET error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error al generar la exportación de datos.",
    });
  }
}

/**
 * POST /api/v1/surveys/:id/exports
 * Solicita una exportación asíncrona o programada (Contrato OpenAPI).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = requireRoles(request, ["creator", "analyst", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const format = body.format || "csv";

    // Solo admin puede solicitar exportación con PII desanonimizada
    const maskPii = auth.user.role === "admin" ? body.mask_pii !== false : true;

    const exportId = `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const downloadUrl = `/api/v1/surveys/${id}/exports?unmask=${!maskPii}`;

    return NextResponse.json(
      {
        export_id: exportId,
        status: "ready",
        format,
        mask_pii: maskPii,
        download_url: downloadUrl,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("[API Survey Export POST error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error al registrar la solicitud de exportación.",
    });
  }
}
