import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  validatePersonalData,
  cedulaYaParticipa,
  generateSorteoCode,
} from "@/lib/sorteo";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  isDriverTypeId,
  validateVisionCeroAnswers,
  MAX_ANSWERS_BYTES,
} from "@/lib/validation/vision-cero";
import { verifyPow, POW_DIFFICULTY } from "@/lib/pow";

const CHANNELS = ["public", "kiosk", "surveyor"] as const;

/**
 * POST /api/survey/submit — guardar una entrevista COMPLETA y VERIFICADA.
 * Orden: rate-limit → honeypot → IDEMPOTENCIA → Turnstile → validación server-side → sorteo → create.
 */
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
    const { driverType, answers, sorteo, turnstileToken, website, clientSubmissionId, channel, botProof } =
      body ?? {};

    // ====== 2) Honeypot: campo oculto que solo los bots rellenan ======
    if (website && typeof website === "string" && website.trim() !== "") {
      // Silenciosamente rechazado como si fuera exitoso (para no alertar al bot)
      return NextResponse.json({ id: "hp-blocked", ok: true });
    }

    // ====== 3) IDEMPOTENCIA: si ya se procesó este clientSubmissionId, devolver el MISMO ======
    const subId = typeof clientSubmissionId === "string" && clientSubmissionId ? clientSubmissionId : null;
    if (subId) {
      const existing = await db.surveyResponse.findUnique({ where: { clientSubmissionId: subId } });
      if (existing) {
        return NextResponse.json({
          id: existing.id,
          ok: true,
          codigoSorteo: existing.codigoSorteo,
          participaSorteo: existing.participaSorteo,
          duplicate: true,
        });
      }
    }

    // ====== 4) Anti-bot: Turnstile (online) o PoW (offline, sin red) ======
    const ts = await verifyTurnstileToken(turnstileToken, ip);
    const powOk =
      !ts.ok &&
      !!subId &&
      !!botProof &&
      typeof botProof === "object" &&
      verifyPow(
        subId,
        (botProof as { nonce?: unknown }).nonce,
        Number((botProof as { difficulty?: unknown }).difficulty ?? POW_DIFFICULTY)
      );
    if (!ts.ok && !powOk) {
      return NextResponse.json(
        { error: ts.error ?? "Verificación de seguridad fallida." },
        { status: 403 }
      );
    }

    // ====== 5) Validación server-side (AUTORIDAD: la captura no confía en el cliente) ======
    if (!isDriverTypeId(driverType)) {
      return NextResponse.json({ error: "driverType inválido." }, { status: 400 });
    }
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return NextResponse.json({ error: "answers es requerido." }, { status: 400 });
    }
    if (Buffer.byteLength(JSON.stringify(answers)) > MAX_ANSWERS_BYTES) {
      return NextResponse.json({ error: "Respuestas demasiado grandes." }, { status: 413 });
    }
    const validation = validateVisionCeroAnswers(driverType, answers);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "Cuestionario incompleto o inválido.", errors: validation.errors },
        { status: 422 }
      );
    }

    // ====== 6) Datos del sorteo (opcionales) ======
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

    // ====== 7) Persistencia (idempotente + canal) ======
    const chan = typeof channel === "string" && (CHANNELS as readonly string[]).includes(channel) ? channel : "public";
    try {
      const saved = await db.surveyResponse.create({
        data: {
          driverType,
          answers: JSON.stringify(answers),
          participaSorteo,
          nombre,
          cedula,
          telefono,
          codigoSorteo,
          channel: chan,
          clientSubmissionId: subId,
        },
      });

      return NextResponse.json({
        id: saved.id,
        ok: true,
        codigoSorteo,
        participaSorteo,
      });
    } catch (e) {
      const code = (e as { code?: string }).code;
      const target = JSON.stringify((e as { meta?: unknown }).meta ?? "");
      if (code === "P2002") {
        // Colisión de clientSubmissionId (carrera) → devolver el existente.
        if (subId && (target.includes("client_submission_id") || target.includes("clientSubmissionId"))) {
          const existing = await db.surveyResponse.findUnique({ where: { clientSubmissionId: subId } });
          if (existing) {
            return NextResponse.json({
              id: existing.id,
              ok: true,
              codigoSorteo: existing.codigoSorteo,
              participaSorteo: existing.participaSorteo,
              duplicate: true,
            });
          }
        }
        // Cédula duplicada en el sorteo (índice único parcial).
        if (target.includes("cedula")) {
          return NextResponse.json(
            { error: "Esta cédula ya está registrada en el sorteo." },
            { status: 409 }
          );
        }
      }
      throw e;
    }
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
