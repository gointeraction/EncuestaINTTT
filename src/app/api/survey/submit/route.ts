import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  validatePersonalData,
  cedulaYaParticipa,
  generateSorteoCode,
} from "@/lib/sorteo";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/survey/submit — guardar una respuesta de encuesta
export async function POST(req: NextRequest) {
  try {
    // ====== 1) Rate limiting por IP (anti-spam de bots) ======
    const ip = getClientIp(req);
    const rl = rateLimit(ip, { max: 5, windowMs: 10 * 60 * 1000 }); // 5 envíos / 10 min por IP
    if (!rl.ok) {
      const mins = Math.ceil((rl.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `Has enviado demasiadas encuestas. Intenta de nuevo en ~${mins} minuto(s).`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const body = await req.json();
    const { driverType, answers, sorteo, turnstileToken, website } = body ?? {};

    // ====== 2) Honeypot: campo oculto que solo los bots rellenan ======
    if (website && typeof website === "string" && website.trim() !== "") {
      // Silenciosamente rechazado como si fuera exitoso (para no alertar al bot)
      return NextResponse.json({ id: "hp-blocked", ok: true });
    }

    // ====== 3) Cloudflare Turnstile: verifica que sea humano ======
    const ts = await verifyTurnstileToken(turnstileToken, ip);
    if (!ts.ok) {
      return NextResponse.json(
        { error: ts.error ?? "Verificación de seguridad fallida." },
        { status: 403 }
      );
    }

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
