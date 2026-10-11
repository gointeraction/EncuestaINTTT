module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/survey/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/survey-analytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
;
;
;
function getFallbackRows() {
    try {
        const backupPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "db", "sqlite_backup.json");
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupPath)) {
            const content = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(backupPath, "utf-8");
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                return parsed.map((item)=>({
                        driverType: item.driverType || "otro_conductor",
                        answers: typeof item.answers === "string" ? item.answers : JSON.stringify(item.answers),
                        completedAt: new Date(item.completedAt || Date.now()),
                        participaSorteo: Boolean(item.participaSorteo)
                    }));
            }
        }
    } catch (err) {
        console.warn("[survey/stats] Error reading sqlite_backup fallback", err);
    }
    return [];
}
async function GET(req) {
    try {
        if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminAuthed"])()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No autorizado"
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(req.url);
        const forceRefresh = searchParams.get("refresh") === "1";
        let rows = [];
        let isFromDb = true;
        try {
            // 1. Si no se fuerza refresh, intentar servir desde la tabla de sumarización
            if (!forceRefresh) {
                const cached = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveySummary.findUnique({
                    where: {
                        id: "latest"
                    }
                });
                if (cached?.summaryData) {
                    try {
                        const parsedData = JSON.parse(cached.summaryData);
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            ...parsedData,
                            _source: "precomputed_summary",
                            _cachedAt: cached.calculatedAt,
                            _totalSummarized: cached.totalCount
                        });
                    } catch (err) {
                        console.warn("[survey/stats] Error parsing cached summary, fallback to live query", err);
                    }
                }
            }
            // 2. Si no hay resumen o se pidió refresh, calcular en vivo desde DB
            rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveyResponse.findMany({
                select: {
                    driverType: true,
                    answers: true,
                    completedAt: true,
                    participaSorteo: true
                }
            });
        } catch (dbErr) {
            console.warn("[survey/stats] Error de conexión a PostgreSQL. Usando respaldo local:", dbErr);
            isFromDb = false;
            rows = getFallbackRows();
        }
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseSurveyRows"])(rows);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeSurveyStats"])(parsed, rows.length);
        // 3. Si la base de datos está conectada, guardar resumen
        if (isFromDb) {
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveySummary.upsert({
                    where: {
                        id: "latest"
                    },
                    create: {
                        id: "latest",
                        calculatedAt: new Date(),
                        totalCount: rows.length,
                        summaryData: JSON.stringify(stats)
                    },
                    update: {
                        calculatedAt: new Date(),
                        totalCount: rows.length,
                        summaryData: JSON.stringify(stats)
                    }
                });
            } catch (upsertErr) {
                console.warn("[survey/stats] Fallo al guardar en surveySummary:", upsertErr);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...stats,
            _source: isFromDb ? "live_computed" : "local_backup",
            _cachedAt: new Date(),
            _totalSummarized: rows.length
        });
    } catch (e) {
        console.error("[survey/stats] error", e);
        // Retornar fallback en lugar de 500 para evitar que la UI crashee
        const fallbackRows = getFallbackRows();
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseSurveyRows"])(fallbackRows);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeSurveyStats"])(parsed, fallbackRows.length);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...stats,
            _source: "emergency_fallback"
        });
    }
}
async function POST() {
    try {
        if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminAuthed"])()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No autorizado"
            }, {
                status: 401
            });
        }
        const startTime = Date.now();
        let rows = [];
        try {
            rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveyResponse.findMany({
                select: {
                    driverType: true,
                    answers: true,
                    completedAt: true,
                    participaSorteo: true
                }
            });
        } catch  {
            rows = getFallbackRows();
        }
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseSurveyRows"])(rows);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeSurveyStats"])(parsed, rows.length);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].surveySummary.upsert({
                where: {
                    id: "latest"
                },
                create: {
                    id: "latest",
                    calculatedAt: new Date(),
                    totalCount: rows.length,
                    summaryData: JSON.stringify(stats)
                },
                update: {
                    calculatedAt: new Date(),
                    totalCount: rows.length,
                    summaryData: JSON.stringify(stats)
                }
            });
        } catch (err) {
            console.warn("[survey/stats POST] Fallo al guardar en cache:", err);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            records: rows.length,
            durationMs: Date.now() - startTime,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error("[survey/stats POST] error", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error interno"
        }, {
            status: 500
        });
    }
}
}),
"[project]/src/lib/admin-auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminSession",
    ()=>createAdminSession,
    "destroyAdminSession",
    ()=>destroyAdminSession,
    "isAdminAuthed",
    ()=>isAdminAuthed,
    "verifyAdminPassword",
    ()=>verifyAdminPassword,
    "verifyAdminToken",
    ()=>verifyAdminToken
]);
// ============================================================================
// Autenticación para el panel de administración (dashboard privado)
// ============================================================================
// Sistema simple de sesión con cookie httpOnly firmada (HMAC-SHA256).
// La URL privada es /?admin=1 — muestra el login; tras autenticarse, el dashboard.
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
const COOKIE_NAME = "intt_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días
function getSecret() {
    return process.env.ADMIN_SECRET || "9f3c1a7e4b2d8f6a5c9e1b3d7f4a2e8c6b9d3f1a7e5c4b2d8a6f9e3c1b7d4a2e";
}
function getPassword() {
    return process.env.ADMIN_PASSWORD || "VisionCero2026!";
}
/** Crea un token firmado: payload.expires HMAC */ function signToken(payload, expires) {
    const data = `${payload}.${expires}`;
    const sig = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])("sha256", getSecret()).update(data).digest("hex");
    return `${data}.${sig}`;
}
/** Verifica un token firmado. */ function verifyToken(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const [payload, expiresStr, sig] = parts;
        const expires = Number(expiresStr);
        if (isNaN(expires) || Date.now() > expires) return false;
        const data = `${payload}.${expires}`;
        const expectedSig = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])("sha256", getSecret()).update(data).digest("hex");
        const a = Buffer.from(sig, "hex");
        const b = Buffer.from(expectedSig, "hex");
        if (a.length !== b.length) return false;
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(a, b);
    } catch  {
        return false;
    }
}
function verifyAdminPassword(password) {
    const expected = getPassword();
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(a, b);
}
async function createAdminSession() {
    const expires = Date.now() + COOKIE_MAX_AGE * 1000;
    const token = signToken("admin", expires);
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    store.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE
    });
}
async function destroyAdminSession() {
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    store.delete(COOKIE_NAME);
}
function verifyAdminToken(token) {
    return verifyToken(token);
}
async function isAdminAuthed() {
    try {
        const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const token = store.get(COOKIE_NAME)?.value;
        if (!token) return false;
        return verifyToken(token);
    } catch  {
        return false;
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
"[project]/src/lib/survey-analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeSurveyStats",
    ()=>computeSurveyStats,
    "parseSurveyRows",
    ()=>parseSurveyRows
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/survey-data.ts [app-route] (ecmascript)");
;
function parseSurveyRows(rows) {
    return rows.map((r)=>{
        let answersObj = {};
        try {
            answersObj = typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers || {};
        } catch  {
            answersObj = {};
        }
        return {
            driverType: r.driverType,
            answers: answersObj,
            completedAt: r.completedAt,
            participaSorteo: Boolean(r.participaSorteo)
        };
    });
}
function computeSurveyStats(parsed, total) {
    // --- Distribución por tipo de conductor ---
    const byDriverType = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DRIVER_TYPES"].map((dt)=>({
            id: dt.id,
            label: dt.label,
            count: parsed.filter((p)=>p.driverType === dt.id).length
        }));
    // --- Distribución por sexo ---
    const bySex = countValues(parsed, "sexo");
    // --- Distribución por grupo de edad ---
    const ageGroups = {
        "14-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45-54": 0,
        "55+": 0,
        "Sin dato": 0
    };
    for (const p of parsed){
        const a = p.answers["edad"];
        const age = typeof a === "number" ? a : a ? Number(a) : NaN;
        if (isNaN(age)) {
            ageGroups["Sin dato"]++;
        } else if (age < 25) ageGroups["14-24"]++;
        else if (age < 35) ageGroups["25-34"]++;
        else if (age < 45) ageGroups["35-44"]++;
        else if (age < 55) ageGroups["45-54"]++;
        else ageGroups["55+"]++;
    }
    // --- Uso de casco ---
    const casco = countValues(parsed, "casco_usa");
    // --- Licencia ---
    const licencia = countValues(parsed, "licencia");
    // --- Ha tenido siniestro ---
    const siniestro = countValues(parsed, "ha_tenido_siniestro");
    // --- Gravedad del siniestro ---
    const siniestroGravedad = countValues(parsed, "siniestro_gravedad");
    // --- Causas principales (checkbox, multi-valor) ---
    const causasPrincipales = countCheckbox(parsed, "causas_principales");
    // --- Medidas efectivas (checkbox) ---
    const medidasEfectivas = countCheckbox(parsed, "medidas_efectivas");
    // --- Percepción de seguridad (escala 1-5) ---
    const percepcionSeguridad = countScale(parsed, "percepcion_seguridad");
    // --- Efectividad del control (escala 1-5) ---
    const efectividadControl = countScale(parsed, "efectividad_control");
    // --- Uso del celular ---
    const usoCelular = countValues(parsed, "uso_celular");
    // --- Alcohol y conducción ---
    const alcohol = countValues(parsed, "alcohol_conduccion");
    // --- Estado de vías (escala) ---
    const estadoVias = countScale(parsed, "estado_vias");
    // --- Señalización vial (escala) ---
    const senalizacion = countScale(parsed, "senalizacion");
    // --- Velocidad: respeto al límite (escala) ---
    const velocidadOpinion = countScale(parsed, "velocidad_opinion");
    // --- Respeto a peatones (escala) ---
    const rebasesPeatones = countScale(parsed, "rebases_peatones");
    // --- Promedios de escalas ---
    const avgPercepcionSeguridad = avgScale(parsed, "percepcion_seguridad");
    const avgEfectividadControl = avgScale(parsed, "efectividad_control");
    const avgEstadoVias = avgScale(parsed, "estado_vias");
    const avgSenalizacion = avgScale(parsed, "senalizacion");
    const avgVelocidadOpinion = avgScale(parsed, "velocidad_opinion");
    const avgRebasesPeatones = avgScale(parsed, "rebases_peatones");
    // --- Promedio de edad ---
    const ages = parsed.map((p)=>{
        const a = p.answers["edad"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
    }).filter((n)=>n !== null);
    const avgEdad = ages.length ? ages.reduce((s, n)=>s + n, 0) / ages.length : 0;
    // --- Promedio de años conduciendo ---
    const anosCond = parsed.map((p)=>{
        const a = p.answers["anos_conduciendo"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
    }).filter((n)=>n !== null);
    const avgAnosConduciendo = anosCond.length ? anosCond.reduce((s, n)=>s + n, 0) / anosCond.length : 0;
    // --- Promedio de km diarios ---
    const kmArr = parsed.map((p)=>{
        const a = p.answers["km_diarios"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
    }).filter((n)=>n !== null);
    const avgKmDiarios = kmArr.length ? kmArr.reduce((s, n)=>s + n, 0) / kmArr.length : 0;
    // --- Promedio de horas diarias ---
    const horasArr = parsed.map((p)=>{
        const a = p.answers["horas_diarias"];
        const n = typeof a === "number" ? a : a ? Number(a) : NaN;
        return isNaN(n) ? null : n;
    }).filter((n)=>n !== null);
    const avgHorasDiarias = horasArr.length ? horasArr.reduce((s, n)=>s + n, 0) / horasArr.length : 0;
    // --- Indicadores adicionales ---
    const byEstado = countValues(parsed, "estado").slice(0, 12);
    const nivelEducativo = countValues(parsed, "nivel_educativo");
    const frecuenciaConduccion = countValues(parsed, "frecuencia_conduccion");
    const categoriaLicencia = countValues(parsed, "categoria_licencia");
    const usoPrincipal = countValues(parsed, "uso_principal");
    const conduccionNocturna = countValues(parsed, "conduccion_nocturna");
    const climaLluvia = countValues(parsed, "clima_lluvia");
    const cascoTipo = countValues(parsed, "casco_tipo");
    const cascoCertificado = countValues(parsed, "casco_certificado");
    const equipamientoAdicional = countCheckbox(parsed, "equipamiento_adicional");
    const elementosMoto = countCheckbox(parsed, "elementos_moto");
    const pasajerosExtra = countValues(parsed, "pasajeros_extra");
    const presionTiempo = countValues(parsed, "presion_tiempo");
    const fatiga = countValues(parsed, "fatiga");
    const siniestroAno = countValues(parsed, "siniestro_ano");
    const siniestroCausas = countCheckbox(parsed, "siniestro_causas");
    const siniestroAtencion = countValues(parsed, "siniestro_atencion");
    const iluminacion = countValues(parsed, "iluminacion");
    const problemasVia = countCheckbox(parsed, "problemas_via");
    const conoceLimitesVelocidad = countValues(parsed, "conoce_limites_velocidad");
    const conoceAlcoholemia = countValues(parsed, "conoce_alcoholemia");
    const conoceSanciones = countValues(parsed, "conoce_sanciones");
    const recibioCapacitacion = countValues(parsed, "recibio_capacitacion");
    const apoyoVisionCero = countValues(parsed, "apoyo_vision_cero");
    const disposicionParticipar = countValues(parsed, "disposicion_participar");
    const sorteoParticipantes = parsed.filter((p)=>p.participaSorteo).length;
    return {
        total,
        byDriverType,
        bySex,
        ageGroups,
        casco,
        licencia,
        siniestro,
        siniestroGravedad,
        causasPrincipales,
        medidasEfectivas,
        percepcionSeguridad,
        efectividadControl,
        usoCelular,
        alcohol,
        estadoVias,
        byEstado,
        nivelEducativo,
        frecuenciaConduccion,
        categoriaLicencia,
        usoPrincipal,
        conduccionNocturna,
        climaLluvia,
        cascoTipo,
        cascoCertificado,
        equipamientoAdicional,
        elementosMoto,
        pasajerosExtra,
        presionTiempo,
        fatiga,
        siniestroAno,
        siniestroCausas,
        siniestroAtencion,
        senalizacion,
        velocidadOpinion,
        rebasesPeatones,
        iluminacion,
        problemasVia,
        conoceLimitesVelocidad,
        conoceAlcoholemia,
        conoceSanciones,
        recibioCapacitacion,
        apoyoVisionCero,
        disposicionParticipar,
        avg: {
            percepcionSeguridad: avgPercepcionSeguridad,
            efectividadControl: avgEfectividadControl,
            estadoVias: avgEstadoVias,
            senalizacion: avgSenalizacion,
            velocidadOpinion: avgVelocidadOpinion,
            rebasesPeatones: avgRebasesPeatones,
            edad: avgEdad,
            anosConduciendo: avgAnosConduciendo,
            kmDiarios: avgKmDiarios,
            horasDiarias: avgHorasDiarias
        },
        sorteo: {
            participantes: sorteoParticipantes
        },
        meta: {
            sections: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SURVEY"].sections.length,
            driverTypes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DRIVER_TYPES"].length
        }
    };
}
// ---------------------------------------------------------------------------
// Helpers internos de conteo
// ---------------------------------------------------------------------------
function countValues(parsed, questionId) {
    const map = new Map();
    for (const p of parsed){
        const v = p.answers[questionId];
        if (v === undefined || v === null || v === "") continue;
        const key = String(v);
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([label, count])=>({
            label,
            count
        })).sort((a, b)=>b.count - a.count);
}
function countCheckbox(parsed, questionId) {
    const map = new Map();
    for (const p of parsed){
        const v = p.answers[questionId];
        if (Array.isArray(v)) {
            for (const opt of v){
                map.set(opt, (map.get(opt) ?? 0) + 1);
            }
        } else if (typeof v === "string" && v) {
            map.set(v, (map.get(v) ?? 0) + 1);
        }
    }
    return Array.from(map.entries()).map(([label, count])=>({
            label,
            count
        })).sort((a, b)=>b.count - a.count);
}
function countScale(parsed, questionId) {
    const out = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
    };
    for (const p of parsed){
        const v = p.answers[questionId];
        const n = typeof v === "number" ? v : v ? Number(v) : NaN;
        if (!isNaN(n) && n >= 1 && n <= 5) {
            out[String(n)] = (out[String(n)] ?? 0) + 1;
        }
    }
    return out;
}
function avgScale(parsed, questionId) {
    let sum = 0;
    let count = 0;
    for (const p of parsed){
        const v = p.answers[questionId];
        const n = typeof v === "number" ? v : v ? Number(v) : NaN;
        if (!isNaN(n) && n >= 1 && n <= 5) {
            sum += n;
            count++;
        }
    }
    return count ? sum / count : 0;
}
}),
"[project]/src/lib/survey-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// Visión Cero en Siniestros de Motocicletas — Definición de Encuesta
// ============================================================================
// El núcleo de esta encuesta es la LÓGICA CONDICIONAL:
// - `appliesTo`: filtra preguntas según el TIPO DE CONDUCTOR
// - `showIf`:    filtra preguntas según respuestas anteriores (branching)
// ============================================================================
__turbopack_context__.s([
    "DRIVER_TYPES",
    ()=>DRIVER_TYPES,
    "SURVEY",
    ()=>SURVEY,
    "countQuestionsForDriverType",
    ()=>countQuestionsForDriverType,
    "getActiveQuestions",
    ()=>getActiveQuestions,
    "getSectionsForDriverType",
    ()=>getSectionsForDriverType
]);
const DRIVER_TYPES = [
    {
        id: "motociclista_activo",
        label: "Motociclista activo",
        description: "Conduzco motocicleta actualmente, por uso particular.",
        icon: "Bike"
    },
    {
        id: "delivery",
        label: "Delivery / Mensajero",
        description: "Conduzco motocicleta como parte de mi trabajo (delivery, mensajería).",
        icon: "PackageCheck"
    },
    {
        id: "mototaxista",
        label: "Mototaxista",
        description: "Conduzco motocicleta prestando servicio de transporte de pasajeros.",
        icon: "Users"
    },
    {
        id: "ex_motociclista",
        label: "Ex motociclista",
        description: "Conduje motocicleta en el pasado pero ya no lo hago.",
        icon: "History"
    },
    {
        id: "familiar",
        label: "Familiar de víctima",
        description: "Soy familiar o cercano a una persona víctima de un siniestro de motocicleta.",
        icon: "HeartHandshake"
    },
    {
        id: "otro_conductor",
        label: "Otro conductor / peatón",
        description: "Conduzco otro vehículo (carro, bicicleta) o soy peatón.",
        icon: "Car"
    }
];
const SURVEY = {
    title: "Hacia una Visión Cero en Siniestros de Motocicletas",
    subtitle: "Encuesta para identificar causas, percepciones y propuestas de mejora. Las preguntas se adaptan a tu perfil de conductor.",
    sections: [
        // --------------------------------------------------------------------------
        {
            id: "demograficos",
            title: "1. Datos demográficos",
            description: "Información básica para segmentar los resultados.",
            icon: "UserRound",
            appliesTo: "all",
            questions: [
                {
                    id: "edad",
                    type: "number",
                    text: "¿Cuál es tu edad?",
                    unit: "años",
                    appliesTo: "all",
                    required: true,
                    scaleMin: 14,
                    scaleMax: 90
                },
                {
                    id: "sexo",
                    type: "radio",
                    text: "Sexo",
                    appliesTo: "all",
                    required: true,
                    options: [
                        "Femenino",
                        "Masculino",
                        "Otro / Prefiero no decir"
                    ]
                },
                {
                    id: "ubicacion",
                    type: "estado-municipio",
                    text: "¿En qué estado y municipio resides?",
                    help: "Selecciona primero el estado y luego el municipio.",
                    appliesTo: "all",
                    required: true
                },
                {
                    id: "ocupacion",
                    type: "text",
                    text: "Ocupación principal",
                    appliesTo: "all"
                },
                {
                    id: "nivel_educativo",
                    type: "select",
                    text: "Nivel educativo alcanzado",
                    appliesTo: "all",
                    options: [
                        "Primaria incompleta",
                        "Primaria completa",
                        "Secundaria incompleta",
                        "Secundaria completa",
                        "Técnico/Tecnólogo",
                        "Universitario incompleto",
                        "Universitario completo",
                        "Posgrado"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "experiencia",
            title: "2. Experiencia como conductor de motocicleta",
            description: "Tu trayectoria conduciendo motocicleta.",
            icon: "Gauge",
            appliesTo: [
                "motociclista_activo",
                "delivery",
                "mototaxista",
                "ex_motociclista"
            ],
            questions: [
                {
                    id: "anos_conduciendo",
                    type: "number",
                    text: "¿Cuántos años llevas (o llevaste) conduciendo motocicleta?",
                    unit: "años",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    required: true
                },
                {
                    id: "licencia",
                    type: "radio",
                    text: "¿Posees licencia de conducción vigente para motocicleta?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    required: true,
                    options: [
                        "Sí, vigente",
                        "Sí, vencida",
                        "No tengo licencia",
                        "Estoy en trámite"
                    ]
                },
                {
                    id: "categoria_licencia",
                    type: "select",
                    text: "¿Qué categoría de licencia tienes?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    showIf: {
                        questionId: "licencia",
                        value: [
                            "Sí, vigente",
                            "Sí, vencida"
                        ]
                    },
                    options: [
                        "A1",
                        "A2",
                        "B1",
                        "C1",
                        "C2",
                        "Otra",
                        "No estoy seguro"
                    ]
                },
                {
                    id: "motivo_no_licencia",
                    type: "textarea",
                    text: "¿Por qué no tienes licencia?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    showIf: {
                        questionId: "licencia",
                        value: "No tengo licencia"
                    }
                },
                {
                    id: "frecuencia_conduccion",
                    type: "radio",
                    text: "¿Con qué frecuencia conduces (o conducías) la motocicleta?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    required: true,
                    options: [
                        "Todos los días",
                        "Varias veces por semana",
                        "Una vez por semana",
                        "Ocasionalmente",
                        "Ya no conduzco"
                    ]
                },
                {
                    id: "dejo_conducir_razon",
                    type: "textarea",
                    text: "¿Por qué dejaste de conducir motocicleta?",
                    appliesTo: [
                        "ex_motociclista"
                    ],
                    showIf: {
                        questionId: "frecuencia_conduccion",
                        value: "Ya no conduzco"
                    }
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "uso_moto",
            title: "3. Uso de la motocicleta",
            description: "Para qué usas la motocicleta y en qué condiciones.",
            icon: "Route",
            appliesTo: [
                "motociclista_activo",
                "delivery",
                "mototaxista"
            ],
            questions: [
                {
                    id: "uso_principal",
                    type: "radio",
                    text: "¿Cuál es el uso principal de tu motocicleta?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    required: true,
                    options: [
                        "Transporte al trabajo / estudio",
                        "Trabajo (delivery / mensajería)",
                        "Transporte de pasajeros (mototaxi)",
                        "Recreativo / paseo",
                        "Otro"
                    ]
                },
                {
                    id: "uso_otro",
                    type: "text",
                    text: "Especifica otro uso:",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    showIf: {
                        questionId: "uso_principal",
                        value: "Otro"
                    }
                },
                {
                    id: "km_diarios",
                    type: "number",
                    text: "Aproximadamente, ¿cuántos kilómetros recorres al día?",
                    unit: "km/día",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ]
                },
                {
                    id: "horas_diarias",
                    type: "number",
                    text: "¿Cuántas horas al día conduces en promedio?",
                    unit: "horas",
                    appliesTo: [
                        "delivery",
                        "mototaxista"
                    ]
                },
                {
                    id: "plataforma_delivery",
                    type: "text",
                    text: "¿Para qué plataforma(s) trabajas? (ej. Uber Eats, Rappi, PedidosYa, propia)",
                    appliesTo: [
                        "delivery"
                    ]
                },
                {
                    id: "pasajeros_dia",
                    type: "number",
                    text: "¿Cuántos pasajeros transportas en promedio al día?",
                    unit: "pasajeros",
                    appliesTo: [
                        "mototaxista"
                    ]
                },
                {
                    id: "conduccion_nocturna",
                    type: "radio",
                    text: "¿Conduces con frecuencia de noche (después de las 9 pm)?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    options: [
                        "Sí, frecuentemente",
                        "A veces",
                        "Rara vez",
                        "Nunca"
                    ]
                },
                {
                    id: "clima_lluvia",
                    type: "radio",
                    text: "¿Conduces incluso con lluvia o condiciones adversas?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    options: [
                        "Sí, siempre",
                        "A veces, si es necesario",
                        "No, evito conducir"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "equipamiento",
            title: "4. Equipamiento de seguridad",
            description: "Elementos de protección que usas o usabas.",
            icon: "ShieldCheck",
            appliesTo: [
                "motociclista_activo",
                "delivery",
                "mototaxista",
                "ex_motociclista"
            ],
            questions: [
                {
                    id: "casco_usa",
                    type: "radio",
                    text: "¿Usas (o usabas) casco al conducir?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    required: true,
                    options: [
                        "Siempre",
                        "Casi siempre",
                        "A veces",
                        "Rara vez",
                        "Nunca"
                    ]
                },
                {
                    id: "casco_tipo",
                    type: "select",
                    text: "¿Qué tipo de casco usas?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    showIf: {
                        questionId: "casco_usa",
                        value: [
                            "Siempre",
                            "Casi siempre",
                            "A veces",
                            "Rara vez"
                        ]
                    },
                    options: [
                        "Integral",
                        "Modular",
                        "Jet / abierto",
                        "Cross / motocross",
                        "Bicicleta / no certificado"
                    ]
                },
                {
                    id: "casco_certificado",
                    type: "radio",
                    text: "¿Tu casco tiene certificación de seguridad (DOT, ECE, SNELL)?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    showIf: {
                        questionId: "casco_usa",
                        value: [
                            "Siempre",
                            "Casi siempre",
                            "A veces",
                            "Rara vez"
                        ]
                    },
                    options: [
                        "Sí",
                        "No",
                        "No lo sé"
                    ]
                },
                {
                    id: "motivo_no_casco",
                    type: "textarea",
                    text: "¿Por qué no usas casco?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    showIf: {
                        questionId: "casco_usa",
                        value: "Nunca"
                    }
                },
                {
                    id: "equipamiento_adicional",
                    type: "checkbox",
                    text: "¿Qué otros elementos de protección usas habitualmente?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    options: [
                        "Chaqueta con refuerzos / cordura",
                        "Guantes",
                        "Botas o calzado cerrado",
                        "Pantalón de protección",
                        "Rodilleras",
                        "Chaleco reflectivo",
                        "Protección lumbar",
                        "Ninguno"
                    ]
                },
                {
                    id: "elementos_moto",
                    type: "checkbox",
                    text: "¿Qué elementos de seguridad tiene tu motocicleta?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    options: [
                        "Luces delanteras y traseras funcionando",
                        "Luces direccionales (intermitentes)",
                        "Espejos retrovisores",
                        "Frenos en buen estado",
                        "Llantas en buen estado",
                        "Claxon / bocina",
                        "Pito / alarma",
                        "No estoy seguro"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "comportamiento",
            title: "5. Comportamiento y prácticas de conducción",
            description: "Hábitos al volante que influyen en la seguridad.",
            icon: "Activity",
            appliesTo: [
                "motociclista_activo",
                "delivery",
                "mototaxista"
            ],
            questions: [
                {
                    id: "velocidad_opinion",
                    type: "scale",
                    text: "En una escala de 1 a 5, ¿consideras que conduces a una velocidad adecuada al límite?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    required: true,
                    scaleMin: 1,
                    scaleMax: 5,
                    scaleLabels: {
                        min: "Nunca respeto el límite",
                        max: "Siempre respeto el límite"
                    }
                },
                {
                    id: "uso_celular",
                    type: "radio",
                    text: "¿Usas el celular mientras conduces (llamadas, mensajes, GPS)?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    required: true,
                    options: [
                        "Sí, frecuentemente",
                        "A veces",
                        "Solo GPS",
                        "Nunca"
                    ]
                },
                {
                    id: "alcohol_conduccion",
                    type: "radio",
                    text: "¿Has conducido después de consumir alcohol?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    required: true,
                    options: [
                        "Sí, varias veces",
                        "Sí, alguna vez",
                        "Nunca"
                    ]
                },
                {
                    id: "pasajeros_extra",
                    type: "radio",
                    text: "¿Transportas a más de un pasajero (triples / cuádruples)?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    options: [
                        "Frecuentemente",
                        "A veces",
                        "Nunca"
                    ]
                },
                {
                    id: "rebases_peatones",
                    type: "scale",
                    text: "¿Respetas el paso de peatones en cruces y semáforos?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista"
                    ],
                    scaleMin: 1,
                    scaleMax: 5,
                    scaleLabels: {
                        min: "Nunca",
                        max: "Siempre"
                    }
                },
                {
                    id: "presion_tiempo",
                    type: "radio",
                    text: "¿Sientes presión por el tiempo (entregas, pasajeros) que te hace conducir más rápido?",
                    appliesTo: [
                        "delivery",
                        "mototaxista"
                    ],
                    options: [
                        "Siempre",
                        "Frecuentemente",
                        "A veces",
                        "Rara vez",
                        "Nunca"
                    ]
                },
                {
                    id: "fatiga",
                    type: "radio",
                    text: "¿Conduces aunque sientas fatiga o sueño?",
                    appliesTo: [
                        "delivery",
                        "mototaxista"
                    ],
                    options: [
                        "Frecuentemente",
                        "A veces",
                        "Rara vez",
                        "Nunca"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "siniestros",
            title: "6. Experiencia con siniestros de tránsito",
            description: "Accidentes y eventos relacionados con motocicletas.",
            icon: "Siren",
            appliesTo: "all",
            questions: [
                {
                    id: "ha_tenido_siniestro",
                    type: "radio",
                    text: "¿Has tenido algún siniestro de tránsito con motocicleta (como conductor, pasajero o peatón)?",
                    appliesTo: "all",
                    required: true,
                    options: [
                        "Sí, como conductor de moto",
                        "Sí, como pasajero de moto",
                        "Sí, como peatón/otro vehículo",
                        "No, nunca"
                    ]
                },
                {
                    id: "siniestro_gravedad",
                    type: "radio",
                    text: "¿Qué tan grave fue el siniestro más reciente?",
                    appliesTo: "all",
                    showIf: {
                        questionId: "ha_tenido_siniestro",
                        value: [
                            "Sí, como conductor de moto",
                            "Sí, como pasajero de moto",
                            "Sí, como peatón/otro vehículo"
                        ]
                    },
                    options: [
                        "Solo daños materiales",
                        "Lesiones leves",
                        "Lesiones graves",
                        "Fallecimiento",
                        "Fallecimiento de otra persona"
                    ]
                },
                {
                    id: "siniestro_ano",
                    type: "number",
                    text: "¿En qué año ocurrió el siniestro más reciente?",
                    unit: "año",
                    appliesTo: "all",
                    showIf: {
                        questionId: "ha_tenido_siniestro",
                        value: [
                            "Sí, como conductor de moto",
                            "Sí, como pasajero de moto",
                            "Sí, como peatón/otro vehículo"
                        ]
                    }
                },
                {
                    id: "siniestro_causas",
                    type: "checkbox",
                    text: "¿Qué factores crees que causaron el siniestro?",
                    appliesTo: "all",
                    showIf: {
                        questionId: "ha_tenido_siniestro",
                        value: [
                            "Sí, como conductor de moto",
                            "Sí, como pasajero de moto",
                            "Sí, como peatón/otro vehículo"
                        ]
                    },
                    options: [
                        "Exceso de velocidad",
                        "Conductor ebrio o bajo efectos",
                        "Uso del celular",
                        "No respetar semáforo / señal",
                        "Falla mecánica",
                        "Mala condición de la vía",
                        "Clima adverso",
                        "Otro conductor",
                        "Falta de visibilidad",
                        "No estoy seguro"
                    ]
                },
                {
                    id: "siniestro_atencion",
                    type: "radio",
                    text: "Después del siniestro, ¿recibiste atención médica?",
                    appliesTo: "all",
                    showIf: {
                        questionId: "ha_tenido_siniestro",
                        value: [
                            "Sí, como conductor de moto",
                            "Sí, como pasajero de moto",
                            "Sí, como peatón/otro vehículo"
                        ]
                    },
                    options: [
                        "Sí, inmediata",
                        "Sí, pero tardía",
                        "No recibí atención",
                        "No la necesité"
                    ]
                },
                {
                    id: "familiar_relacion",
                    type: "select",
                    text: "¿Qué parentesco tienes con la víctima?",
                    appliesTo: [
                        "familiar"
                    ],
                    options: [
                        "Padre / Madre",
                        "Hijo/a",
                        "Esposo/a / Pareja",
                        "Hermano/a",
                        "Otro familiar",
                        "Amigo/a cercano"
                    ]
                },
                {
                    id: "familiar_siniestro_tipo",
                    type: "radio",
                    text: "El siniestro que afectó a tu familiar resultó en:",
                    appliesTo: [
                        "familiar"
                    ],
                    required: true,
                    options: [
                        "Lesiones leves",
                        "Lesiones graves / discapacidad",
                        "Fallecimiento"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "percepcion",
            title: "7. Percepción de causas y medidas",
            description: "Tu opinión sobre las causas de los siniestros y qué medidas ayudarían.",
            icon: "Brain",
            appliesTo: "all",
            questions: [
                {
                    id: "causas_principales",
                    type: "checkbox",
                    text: "¿Cuáles consideras que son las principales causas de siniestros de motocicleta en tu ciudad?",
                    appliesTo: "all",
                    required: true,
                    options: [
                        "Exceso de velocidad",
                        "Conducir bajo efectos del alcohol",
                        "Uso del celular",
                        "Falta de capacitación / licencia",
                        "Mala infraestructura vial",
                        "Falta de señalización",
                        "Conductores de otros vehículos",
                        "Condición de las motocicletas",
                        "Falta de cultura vial",
                        "Presión laboral (delivery)"
                    ]
                },
                {
                    id: "medidas_efectivas",
                    type: "checkbox",
                    text: "¿Qué medidas crees que serían más efectivas para reducir los siniestros?",
                    appliesTo: "all",
                    required: true,
                    options: [
                        "Más controles policiales y alcoholemia",
                        "Mayor y mejor educación vial",
                        "Mejorar infraestructura (ciclorrutas, señalización)",
                        "Endurecer sanciones y multas",
                        "Capacitación obligatoria para motociclistas",
                        "Controles técnicos vehiculares obligatorios",
                        "Campañas de concientización",
                        "Mejorar iluminación vial",
                        "Regulación de apps de delivery",
                        "Reducción de velocidad urbana"
                    ]
                },
                {
                    id: "efectividad_control",
                    type: "scale",
                    text: "¿Qué tan efectivo consideras el control actual de tránsito en tu ciudad?",
                    appliesTo: "all",
                    scaleMin: 1,
                    scaleMax: 5,
                    scaleLabels: {
                        min: "Nada efectivo",
                        max: "Muy efectivo"
                    }
                },
                {
                    id: "percepcion_seguridad",
                    type: "scale",
                    text: "¿Qué tan seguro te sientes (o te sentías) al conducir o transitar en motocicleta?",
                    appliesTo: "all",
                    scaleMin: 1,
                    scaleMax: 5,
                    scaleLabels: {
                        min: "Muy inseguro",
                        max: "Muy seguro"
                    }
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "infraestructura",
            title: "8. Infraestructura vial",
            description: "Condiciones de las vías que usas.",
            icon: "Construction",
            appliesTo: "all",
            questions: [
                {
                    id: "estado_vias",
                    type: "scale",
                    text: "¿Cómo calificas el estado general de las vías por donde conduces o transitas?",
                    appliesTo: "all",
                    scaleMin: 1,
                    scaleMax: 5,
                    scaleLabels: {
                        min: "Muy malo",
                        max: "Muy bueno"
                    }
                },
                {
                    id: "senalizacion",
                    type: "scale",
                    text: "¿La señalización vertical y horizontal es clara y visible?",
                    appliesTo: "all",
                    scaleMin: 1,
                    scaleMax: 5,
                    scaleLabels: {
                        min: "Nada clara",
                        max: "Muy clara"
                    }
                },
                {
                    id: "iluminacion",
                    type: "radio",
                    text: "¿La iluminación en las vías nocturnas es adecuada?",
                    appliesTo: "all",
                    options: [
                        "Sí, en la mayoría",
                        "Solo en algunas",
                        "No, es deficiente",
                        "No conduzco de noche"
                    ]
                },
                {
                    id: "problemas_via",
                    type: "checkbox",
                    text: "¿Qué problemas de infraestructura identificas con más frecuencia?",
                    appliesTo: "all",
                    options: [
                        "Huecos / baches",
                        "Falta de señalización",
                        "Señalización borrada / dañada",
                        "Falta de iluminación",
                        "Falta de ciclorruta",
                        "Esquinas con visibilidad reducida",
                        "Semiclós / reductores de velocidad mal diseñados",
                        "Drenaje deficiente / charcos"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "normativas",
            title: "9. Conocimiento de normativas",
            description: "Qué tanto conoces las normas de tránsito aplicables a motocicletas.",
            icon: "Scale",
            appliesTo: [
                "motociclista_activo",
                "delivery",
                "mototaxista",
                "ex_motociclista"
            ],
            questions: [
                {
                    id: "conoce_limites_velocidad",
                    type: "radio",
                    text: "¿Conoces los límites de velocidad para motocicletas en zona urbana?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    options: [
                        "Sí, claramente",
                        "Más o menos",
                        "No los conozco"
                    ]
                },
                {
                    id: "conoce_alcoholemia",
                    type: "radio",
                    text: "¿Conoces las normas sobre alcoholemia para conductores de motocicleta?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    options: [
                        "Sí, claramente",
                        "Más o menos",
                        "No las conozco"
                    ]
                },
                {
                    id: "conoce_sanciones",
                    type: "radio",
                    text: "¿Conoces las sanciones por no usar casco o por infracciones de tránsito?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    options: [
                        "Sí, claramente",
                        "Más o menos",
                        "No las conozco"
                    ]
                },
                {
                    id: "recibio_capacitacion",
                    type: "radio",
                    text: "¿Has recibido alguna capacitación formal en conducción de motocicleta?",
                    appliesTo: [
                        "motociclista_activo",
                        "delivery",
                        "mototaxista",
                        "ex_motociclista"
                    ],
                    options: [
                        "Sí, en academia",
                        "Sí, por la empresa / app",
                        "Sí, informalmente",
                        "No"
                    ]
                }
            ]
        },
        // --------------------------------------------------------------------------
        {
            id: "propuestas",
            title: "10. Propuestas de mejora",
            description: "Tus ideas para avanzar hacia Visión Cero.",
            icon: "Lightbulb",
            appliesTo: "all",
            questions: [
                {
                    id: "propuesta_principal",
                    type: "textarea",
                    text: "¿Cuál consideras que es la acción más urgente para reducir los siniestros de motocicleta?",
                    appliesTo: "all",
                    required: true
                },
                {
                    id: "apoyo_vision_cero",
                    type: "radio",
                    text: "¿Apoyarías una política de 'Visión Cero' (ninguna muerte aceptable en vías)?",
                    appliesTo: "all",
                    options: [
                        "Sí, totalmente",
                        "Sí, en parte",
                        "No estoy seguro",
                        "No"
                    ]
                },
                {
                    id: "disposicion_participar",
                    type: "radio",
                    text: "¿Estarías dispuesto a participar en campañas o capacitaciones de seguridad vial?",
                    appliesTo: "all",
                    options: [
                        "Sí, seguro",
                        "Tal vez",
                        "No"
                    ]
                },
                {
                    id: "comentario_final",
                    type: "textarea",
                    text: "¿Algún comentario o experiencia adicional que quieras compartir?",
                    appliesTo: "all"
                }
            ]
        }
    ]
};
function getSectionsForDriverType(driverType) {
    return SURVEY.sections.filter((s)=>s.appliesTo === "all" || s.appliesTo.includes(driverType));
}
function getActiveQuestions(section, driverType, answers) {
    return section.questions.filter((q)=>{
        // Filtro por tipo de conductor
        if (q.appliesTo !== "all" && !q.appliesTo.includes(driverType)) return false;
        // Filtro por dependencia de respuesta previa (showIf)
        if (q.showIf) {
            const prev = answers[q.showIf.questionId];
            if (prev === undefined || prev === null || prev === "") return false;
            const required = q.showIf.value;
            const actual = String(prev);
            if (Array.isArray(required)) {
                if (!required.includes(actual)) return false;
            } else {
                if (actual !== required) return false;
            }
        }
        return true;
    });
}
function countQuestionsForDriverType(driverType) {
    return getSectionsForDriverType(driverType).reduce((acc, s)=>acc + s.questions.filter((q)=>q.appliesTo === "all" || q.appliesTo.includes(driverType)).length, 0);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ux5b5d._.js.map