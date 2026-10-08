import { NextRequest, NextResponse } from "next/server";
import { getSurveyById } from "@/lib/services/survey-service";
import { generateQrSvg, generateQrPng } from "@/lib/services/deployment-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/surveys/:id/qr
 * Genera el código QR para el enlace público de la encuesta.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const survey = await getSurveyById(id);

    if (!survey) {
      return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://encuesta.intt.gob.ve";
    const publicUrl = `${baseUrl}/s/${survey.shortCode}`;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "svg";

    if (format === "png") {
      const pngBuffer = await generateQrPng(publicUrl);
      return new NextResponse(pngBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="qr-${survey.shortCode}.png"`,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }

    const svgString = await generateQrSvg(publicUrl);
    return new NextResponse(svgString, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[API Survey QR error]:", error);
    return NextResponse.json({ error: "Error al generar código QR" }, { status: 500 });
  }
}
