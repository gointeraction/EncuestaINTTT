module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/survey/submit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sorteo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sorteo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$turnstile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/turnstile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(req) {
    try {
        // ====== 1) Rate limiting por IP (anti-spam de bots) ======
        const ip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientIp"])(req);
        const rl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(ip, {
            max: 5,
            windowMs: 10 * 60 * 1000
        }); // 5 envíos / 10 min por IP
        if (!rl.ok) {
            const mins = Math.ceil((rl.resetAt - Date.now()) / 60000);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Has enviado demasiadas encuestas. Intenta de nuevo en ~${mins} minuto(s).`
            }, {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000))
                }
            });
        }
        const body = await req.json();
        const { driverType, answers, sorteo, turnstileToken, website } = body ?? {};
        // ====== 2) Honeypot: campo oculto que solo los bots rellenan ======
        if (website && typeof website === "string" && website.trim() !== "") {
            // Silenciosamente rechazado como si fuera exitoso (para no alertar al bot)
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                id: "hp-blocked",
                ok: true
            });
        }
        // ====== 3) Cloudflare Turnstile: verifica que sea humano ======
        const ts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$turnstile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyTurnstileToken"])(turnstileToken, ip);
        if (!ts.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: ts.error ?? "Verificación de seguridad fallida."
            }, {
                status: 403
            });
        }
        if (!driverType || typeof driverType !== "string") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "driverType es requerido"
            }, {
                status: 400
            });
        }
        if (!answers || typeof answers !== "object") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "answers es requerido"
            }, {
                status: 400
            });
        }
        // --- Datos del sorteo (opcionales) ---
        let participaSorteo = false;
        let nombre = null;
        let cedula = null;
        let telefono = null;
        let codigoSorteo = null;
        if (sorteo && sorteo.participa === true) {
            const v = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sorteo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validatePersonalData"])({
                nombre: sorteo.nombre ?? "",
                cedula: sorteo.cedula ?? "",
                telefono: sorteo.telefono ?? ""
            });
            if (!v.ok) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Datos del sorteo inválidos",
                    fieldErrors: v.errors
                }, {
                    status: 400
                });
            }
            // Verificar que la cédula no haya participado ya
            const ya = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sorteo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cedulaYaParticipa"])(v.normalized.cedula);
            if (ya) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Esta cédula ya está registrada en el sorteo. Solo se permite una participación por persona."
                }, {
                    status: 409
                });
            }
            participaSorteo = true;
            nombre = v.normalized.nombre;
            cedula = v.normalized.cedula;
            telefono = v.normalized.telefono;
            codigoSorteo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sorteo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSorteoCode"])();
        }
        const saved = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveyResponse.create({
            data: {
                driverType,
                answers: JSON.stringify(answers),
                participaSorteo,
                nombre,
                cedula,
                telefono,
                codigoSorteo
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: saved.id,
            ok: true,
            codigoSorteo,
            participaSorteo
        });
    } catch (e) {
        console.error("[survey/submit] error", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error interno"
        }, {
            status: 500
        });
    }
}
async function GET() {
    try {
        const responses = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveyResponse.findMany({
            orderBy: {
                completedAt: "desc"
            },
            take: 200
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            responses: responses.map((r)=>({
                    id: r.id,
                    driverType: r.driverType,
                    answers: JSON.parse(r.answers),
                    completedAt: r.completedAt,
                    participaSorteo: r.participaSorteo,
                    nombre: r.nombre,
                    cedula: r.cedula,
                    telefono: r.telefono,
                    codigoSorteo: r.codigoSorteo
                }))
        });
    } catch (e) {
        console.error("[survey/responses] error", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error interno"
        }, {
            status: 500
        });
    }
}
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[project]/src/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// Rate limiting en memoria (por IP)
// ============================================================================
// Simple limitador de peticiones por IP usando una ventana deslizante.
// Suficiente para una sola instancia de servidor. Para producción multi-instancia
// conviene migrar a Redis, pero para esta app basta.
// ============================================================================
__turbopack_context__.s([
    "getClientIp",
    ()=>getClientIp,
    "rateLimit",
    ()=>rateLimit
]);
const buckets = new Map();
function rateLimit(ip, opts) {
    const now = Date.now();
    const windowStart = now - opts.windowMs;
    let bucket = buckets.get(ip);
    if (!bucket) {
        bucket = {
            timestamps: []
        };
        buckets.set(ip, bucket);
    }
    // Filtrar timestamps dentro de la ventana actual
    bucket.timestamps = bucket.timestamps.filter((t)=>t > windowStart);
    if (bucket.timestamps.length >= opts.max) {
        const oldest = bucket.timestamps[0];
        return {
            ok: false,
            remaining: 0,
            resetAt: oldest + opts.windowMs
        };
    }
    bucket.timestamps.push(now);
    return {
        ok: true,
        remaining: opts.max - bucket.timestamps.length,
        resetAt: now + opts.windowMs
    };
}
function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim();
    return "unknown";
}
/** Limpia periódicamente buckets vacíos para evitar fugas de memoria. */ setInterval(()=>{
    const now = Date.now();
    for (const [ip, bucket] of buckets.entries()){
        bucket.timestamps = bucket.timestamps.filter((t)=>t > now - 3600_000);
        if (bucket.timestamps.length === 0) {
            buckets.delete(ip);
        }
    }
}, 600_000); // cada 10 min
}),
"[project]/src/lib/sorteo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// Validadores para datos personales del sorteo (Venezuela)
// ============================================================================
__turbopack_context__.s([
    "VE_MOBILE_PREFIXES",
    ()=>VE_MOBILE_PREFIXES,
    "cedulaYaParticipa",
    ()=>cedulaYaParticipa,
    "generateSorteoCode",
    ()=>generateSorteoCode,
    "normalizeCedula",
    ()=>normalizeCedula,
    "normalizeTelefono",
    ()=>normalizeTelefono,
    "validatePersonalData",
    ()=>validatePersonalData
]);
function normalizeCedula(input) {
    const clean = (input ?? "").trim().toUpperCase().replace(/\s+/g, "");
    if (!clean) return {
        ok: false,
        error: "La cédula es obligatoria."
    };
    // Separar letra inicial y número
    const match = clean.match(/^([VE])?-?0*(\d{6,8})$/);
    if (!match) {
        return {
            ok: false,
            error: "Formato inválido. Usa V-12345678 o E-12345678 (6 a 8 dígitos)."
        };
    }
    const letra = match[1] ?? "V";
    const numero = match[2];
    return {
        ok: true,
        value: `${letra}-${numero}`
    };
}
function normalizeTelefono(input) {
    const clean = (input ?? "").trim().replace(/[\s\-().]/g, "");
    if (!clean) return {
        ok: false,
        error: "El teléfono es obligatorio."
    };
    // Quitar prefijo internacional
    let digits = clean;
    if (digits.startsWith("+58")) digits = digits.slice(3);
    else if (digits.startsWith("58")) digits = digits.slice(2);
    // Quitar cero inicial de móvil (0412 → 412)
    if (digits.startsWith("0")) digits = digits.slice(1);
    // Móvil venezolano: 4XX + 7 dígitos = 10 dígitos total
    const mobileMatch = digits.match(/^(412|414|424|416|426)\d{7}$/);
    if (mobileMatch) {
        const prefix = digits.slice(0, 3);
        const rest = digits.slice(3);
        return {
            ok: true,
            value: `+58-${prefix}-${rest}`
        };
    }
    return {
        ok: false,
        error: "Número inválido. Debe ser un móvil venezolano (0412, 0414, 0424, 0416 o 0426)."
    };
}
function validatePersonalData(data) {
    const errors = {};
    const normalized = {
        nombre: "",
        cedula: "",
        telefono: ""
    };
    // Nombre
    const nombre = (data.nombre ?? "").trim();
    if (nombre.length < 3) {
        errors.nombre = "Ingresa tu nombre completo (mínimo 3 caracteres).";
    } else {
        normalized.nombre = nombre;
    }
    // Cédula
    const ced = normalizeCedula(data.cedula ?? "");
    if (!ced.ok) {
        errors.cedula = ced.error;
    } else {
        normalized.cedula = ced.value;
    }
    // Teléfono
    const tel = normalizeTelefono(data.telefono ?? "");
    if (!tel.ok) {
        errors.telefono = tel.error;
    } else {
        normalized.telefono = tel.value;
    }
    return {
        ok: Object.keys(errors).length === 0,
        errors,
        normalized
    };
}
async function cedulaYaParticipa(cedula, excludeId) {
    const { db } = await __turbopack_context__.A("[project]/src/lib/db.ts [app-route] (ecmascript, async loader)");
    const existing = await db.surveyResponse.findFirst({
        where: {
            cedula,
            participaSorteo: true,
            ...excludeId ? {
                id: {
                    not: excludeId
                }
            } : {}
        },
        select: {
            id: true
        }
    });
    return !!existing;
}
function generateSorteoCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos
    let out = "";
    for(let i = 0; i < 8; i++){
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}
const VE_MOBILE_PREFIXES = [
    "0412",
    "0414",
    "0424",
    "0416",
    "0426"
];
}),
"[project]/src/lib/turnstile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// Cloudflare Turnstile — verificación server-side del token
// ============================================================================
// Turnstile es la alternativa de Cloudflare a reCAPTCHA: gratis, sin fricción
// y sin el captcha visual molesto para el usuario.
//
// Para producción, crea un sitio en https://dash.cloudflare.com → Turnstile
// y define TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY en .env con tus claves reales.
// ============================================================================
__turbopack_context__.s([
    "TURNSTILE_SITE_KEY",
    ()=>TURNSTILE_SITE_KEY,
    "verifyTurnstileToken",
    ()=>verifyTurnstileToken
]);
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // clave de test (siempre pasa)
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"; // secret de test
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
async function verifyTurnstileToken(token, remoteip) {
    if (!token) {
        return {
            ok: false,
            error: "Falta el token de verificación de seguridad."
        };
    }
    try {
        const body = new URLSearchParams();
        body.append("secret", TURNSTILE_SECRET_KEY);
        body.append("response", token);
        if (remoteip) body.append("remoteip", remoteip);
        const res = await fetch(VERIFY_URL, {
            method: "POST",
            body,
            // Cacheo: Turnstile tokens son de un solo uso, no cachear
            cache: "no-store"
        });
        const data = await res.json();
        if (!data.success) {
            return {
                ok: false,
                error: "La verificación de seguridad falló. Completa el desafío e intenta de nuevo."
            };
        }
        return {
            ok: true
        };
    } catch (e) {
        console.error("[turnstile] verify error", e);
        return {
            ok: false,
            error: "No se pudo verificar la seguridad. Intenta de nuevo."
        };
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0oc_h9d._.js.map