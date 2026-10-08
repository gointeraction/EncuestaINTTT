import { NextRequest, NextResponse } from "next/server";
import { createProblemResponse } from "@/lib/auth";
import { submitSurveyResponse } from "@/lib/services/response-service";
import { extractClientIp } from "@/lib/services/ip-hash";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/v1/public/surveys/:slug/responses
 * Endpoint de ingesta transaccional de respuestas (US-4.1).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await params; // Consumir params
    const clientIp = extractClientIp(request);

    // 1. Rate limiting por IP: máximo 30 envíos por minuto
    const rateCheck = rateLimit(clientIp, { max: 30, windowMs: 60 * 1000 });
    if (!rateCheck.ok) {
      return createProblemResponse({
        type: "https://httpstatuses.com/429",
        title: "Demasiadas Peticiones",
        status: 429,
        detail: "Has superado el límite de envíos por minuto. Intenta más tarde.",
      });
    }

    // 2. Extraer token de sesión
    const sessionToken =
      request.headers.get("x-session-token") ||
      request.headers.get("authorization")?.replace(/^bearer\s+/i, "");

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return createProblemResponse({
        type: "https://httpstatuses.com/400",
        title: "Cuerpo Inválido",
        status: 400,
        detail: "La petición debe incluir un cuerpo JSON válido.",
      });
    }

    const token = sessionToken || body.session_token;
    if (!token) {
      return createProblemResponse({
        type: "https://httpstatuses.com/401",
        title: "Sesión Requerida",
        status: 401,
        detail: "Se requiere un encabezado 'X-Session-Token' válido emitido previamente.",
      });
    }

    // 3. Verificación anti-bot Cloudflare Turnstile si se envía el token
    if (body.turnstile_token) {
      const turnstileCheck = await verifyTurnstileToken(body.turnstile_token, clientIp);
      if (!turnstileCheck.ok) {
        return createProblemResponse({
          type: "https://httpstatuses.com/400",
          title: "Desafío de Seguridad Fallido",
          status: 400,
          detail: turnstileCheck.error || "Fallo en la validación anti-bot.",
        });
      }
    }

    // 4. Ejecutar el submit transaccional y validación server-side
    const result = await submitSurveyResponse({
      sessionToken: token,
      turnstileToken: body.turnstile_token,
      answers: Array.isArray(body.answers) ? body.answers : [],
      meta: body.meta,
      clientIp,
    });

    if (result.statusHttp !== 201) {
      return createProblemResponse({
        type: `https://httpstatuses.com/${result.statusHttp}`,
        title: result.title || "Error al Enviar Respuestas",
        status: result.statusHttp,
        detail: result.detail || "No fue posible procesar la respuesta.",
      });
    }

    return NextResponse.json(
      {
        response_id: result.responseId,
        status: "completed",
        submitted_at: result.submittedAt,
        auto_closed: result.autoClosed,
        message: "Encuesta registrada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Public Response POST error]:", error);
    return createProblemResponse({
      type: "https://httpstatuses.com/500",
      title: "Error Interno",
      status: 500,
      detail: "Ocurrió un error inesperado al procesar el envío de la encuesta.",
    });
  }
}
