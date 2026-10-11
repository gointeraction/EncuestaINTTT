module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

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
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/v1/surveys/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/auth/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/rbac.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$survey$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/services/survey-service.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireRoles"])(request, [
        "creator",
        "analyst",
        "admin"
    ]);
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get("status");
        const limitParam = searchParams.get("limit");
        // Los creadores ven sus encuestas a menos que sean admin
        const creatorId = auth.user.role === "creator" ? auth.user.id : searchParams.get("creator_id") || undefined;
        const surveys = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$survey$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listSurveys"])({
            creatorId,
            status: statusParam || undefined,
            limit: limitParam ? parseInt(limitParam, 10) : 20
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: surveys,
            total: surveys.length
        });
    } catch (error) {
        console.error("[API Surveys GET error]:", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createProblemResponse"])({
            type: "https://httpstatuses.com/500",
            title: "Error Interno",
            status: 500,
            detail: "Ocurrió un error inesperado al listar las encuestas."
        });
    }
}
async function POST(request) {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireRoles"])(request, [
        "creator",
        "admin"
    ]);
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const body = await request.json().catch(()=>null);
        if (!body || typeof body.title !== "string" || !body.title.trim()) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createProblemResponse"])({
                type: "https://httpstatuses.com/422",
                title: "Entidad No Procesable",
                status: 422,
                detail: "El campo 'title' es obligatorio y debe ser un texto no vacío."
            });
        }
        const survey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$survey$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSurvey"])(auth.user.id, {
            title: body.title,
            description: body.description,
            accessMode: body.access_mode,
            allowPartial: body.allow_partial,
            maxResponses: body.max_responses,
            startsAt: body.starts_at,
            endsAt: body.ends_at,
            consentText: body.consent_text
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(survey, {
            status: 201
        });
    } catch (error) {
        console.error("[API Surveys POST error]:", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createProblemResponse"])({
            type: "https://httpstatuses.com/500",
            title: "Error Interno",
            status: 500,
            detail: "Ocurrió un error inesperado al crear la encuesta."
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
"[project]/src/lib/auth/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/password.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/jwt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/rbac.ts [app-route] (ecmascript)");
;
;
;
;
;
}),
"[project]/src/lib/auth/jwt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signAuthToken",
    ()=>signAuthToken,
    "verifyAuthToken",
    ()=>verifyAuthToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const DEFAULT_SECRET = "intt_default_secret_key_sdd_auth_2026_super_secure_random";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días
function getAuthSecret() {
    return process.env.AUTH_SECRET || process.env.ADMIN_SECRET || DEFAULT_SECRET;
}
function base64UrlEncode(data) {
    return Buffer.from(data).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while(base64.length % 4){
        base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf-8");
}
function signAuthToken(user, ttlSeconds = TOKEN_TTL_SECONDS) {
    const now = Math.floor(Date.now() / 1000);
    const header = {
        alg: "HS256",
        typ: "JWT"
    };
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: now,
        exp: now + ttlSeconds
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])("sha256", getAuthSecret()).update(signingInput).digest();
    const encodedSignature = base64UrlEncode(signature);
    return `${signingInput}.${encodedSignature}`;
}
function verifyAuthToken(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])("sha256", getAuthSecret()).update(signingInput).digest();
        const actualSignature = Buffer.from(encodedSignature.replace(/-/g, "+").replace(/_/g, "/"), "base64");
        if (expectedSignature.length !== actualSignature.length) return null;
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(expectedSignature, actualSignature)) return null;
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return null; // Expirado
        }
        return payload;
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/auth/password.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const KEY_LENGTH = 64;
function hashPassword(password) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomBytes"])(16).toString("hex");
    const derivedKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(password, salt, KEY_LENGTH);
    return `${salt}:${derivedKey.toString("hex")}`;
}
function verifyPassword(password, storedHash) {
    try {
        const [salt, key] = storedHash.split(":");
        if (!salt || !key) return false;
        const derivedKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(password, salt, KEY_LENGTH);
        const keyBuffer = Buffer.from(key, "hex");
        if (derivedKey.length !== keyBuffer.length) return false;
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(derivedKey, keyBuffer);
    } catch  {
        return false;
    }
}
}),
"[project]/src/lib/auth/rbac.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createProblemResponse",
    ()=>createProblemResponse,
    "hasMinimumRole",
    ()=>hasMinimumRole,
    "requireAuth",
    ()=>requireAuth,
    "requireRoles",
    ()=>requireRoles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/session.ts [app-route] (ecmascript)");
;
;
const ROLE_HIERARCHY = {
    analyst: 10,
    creator: 20,
    admin: 30
};
function hasMinimumRole(userRole, requiredRole) {
    return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}
function createProblemResponse(problem) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(problem, {
        status: problem.status,
        headers: {
            "Content-Type": "application/problem+json"
        }
    });
}
function requireAuth(request) {
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUserFromRequest"])(request);
    if (!user) {
        return {
            errorResponse: createProblemResponse({
                type: "https://httpstatuses.com/401",
                title: "No Autenticado",
                status: 401,
                detail: "Se requiere un token de sesión o header Authorization Bearer válido."
            })
        };
    }
    return {
        user
    };
}
function requireRoles(request, allowedRoles) {
    const auth = requireAuth(request);
    if (auth.errorResponse) return auth;
    const user = auth.user;
    const isAllowed = allowedRoles.some((role)=>user.role === role || user.role === "admin");
    if (!isAllowed) {
        return {
            errorResponse: createProblemResponse({
                type: "https://httpstatuses.com/403",
                title: "Acceso Denegado",
                status: 403,
                detail: `El rol actual '${user.role}' no cuenta con permisos suficientes para este recurso.`
            })
        };
    }
    return {
        user
    };
}
}),
"[project]/src/lib/auth/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AUTH_COOKIE_NAME",
    ()=>AUTH_COOKIE_NAME,
    "createAuthSessionCookie",
    ()=>createAuthSessionCookie,
    "destroyAuthSessionCookie",
    ()=>destroyAuthSessionCookie,
    "extractToken",
    ()=>extractToken,
    "getAuthUser",
    ()=>getAuthUser,
    "getAuthUserFromRequest",
    ()=>getAuthUserFromRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/jwt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin-auth.ts [app-route] (ecmascript)");
;
;
;
const AUTH_COOKIE_NAME = "sdd_auth_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días
function extractToken(request, cookieValue) {
    if (request) {
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
            return authHeader.slice(7).trim();
        }
    }
    if (cookieValue) {
        return cookieValue;
    }
    return null;
}
function getAuthUserFromRequest(request) {
    // 1. Probar token JWT de SDD (cookie o header Authorization)
    const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const token = extractToken(request, cookieValue);
    if (token) {
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyAuthToken"])(token);
        if (payload) {
            return {
                id: payload.sub,
                email: payload.email,
                role: payload.role
            };
        }
    }
    // 2. Probar cookie de administrador unificado intt_admin_session
    const adminCookie = request.cookies.get("intt_admin_session")?.value;
    if (adminCookie && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyAdminToken"])(adminCookie)) {
        return {
            id: "admin-master",
            email: "admin@intt.gob.ve",
            role: "admin"
        };
    }
    return null;
}
async function getAuthUser() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        if (token) {
            const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyAuthToken"])(token);
            if (payload) {
                return {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role
                };
            }
        }
        const adminCookie = cookieStore.get("intt_admin_session")?.value;
        if (adminCookie && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyAdminToken"])(adminCookie)) {
            return {
                id: "admin-master",
                email: "admin@intt.gob.ve",
                role: "admin"
            };
        }
        return null;
    } catch  {
        return null;
    }
}
async function createAuthSessionCookie(user) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signAuthToken"])(user, COOKIE_MAX_AGE);
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE
    });
    return token;
}
async function destroyAuthSessionCookie() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete(AUTH_COOKIE_NAME);
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
"[project]/src/lib/services/local-survey-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteLocalSurvey",
    ()=>deleteLocalSurvey,
    "getLocalSurveyById",
    ()=>getLocalSurveyById,
    "loadLocalSurveys",
    ()=>loadLocalSurveys,
    "saveLocalSurvey",
    ()=>saveLocalSurvey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
function storePath() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(process.cwd(), "db", "local_surveys.json");
}
function loadLocalSurveys() {
    try {
        const path = storePath();
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(path)) {
            return [];
        }
        const raw = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(path, "utf-8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.warn("[local-survey-store] No se pudo leer el almacén local:", err);
        return [];
    }
}
function getLocalSurveyById(id) {
    const surveys = loadLocalSurveys();
    return surveys.find((s)=>s.id === id) ?? null;
}
function saveLocalSurvey(survey) {
    const surveys = loadLocalSurveys();
    const idx = surveys.findIndex((s)=>s.id === survey.id);
    if (idx >= 0) {
        surveys[idx] = survey;
    } else {
        surveys.push(survey);
    }
    writeLocalSurveys(surveys);
    return survey;
}
function deleteLocalSurvey(id) {
    const surveys = loadLocalSurveys();
    const filtered = surveys.filter((s)=>s.id !== id);
    if (filtered.length === surveys.length) {
        return false;
    }
    writeLocalSurveys(filtered);
    return true;
}
function writeLocalSurveys(surveys) {
    try {
        const path = storePath();
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(path);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(dir)) {
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])(dir, {
                recursive: true
            });
        }
        const tmp = `${path}.tmp`;
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(tmp, JSON.stringify(surveys, null, 2), "utf-8");
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["renameSync"])(tmp, path);
    } catch (err) {
        console.warn("[local-survey-store] No se pudo escribir el almacén local:", err);
        throw err;
    }
}
}),
"[project]/src/lib/services/slug.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateShortCode",
    ()=>generateShortCode,
    "slugify",
    ()=>slugify
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function slugify(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remueve diacríticos / tildes
    .toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
function generateShortCode(length = 6) {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    const bytes = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomBytes"])(length);
    let result = "";
    for(let i = 0; i < length; i++){
        result += chars[bytes[i] % chars.length];
    }
    return result;
}
}),
"[project]/src/lib/services/survey-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSurvey",
    ()=>createSurvey,
    "deleteSurvey",
    ()=>deleteSurvey,
    "getSurveyById",
    ()=>getSurveyById,
    "listSurveys",
    ()=>listSurveys,
    "updateSurvey",
    ()=>updateSurvey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/services/slug.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/services/local-survey-store.ts [app-route] (ecmascript)");
;
;
;
/**
 * Genera un slug único garantizado en la base de datos o fallback.
 */ async function generateUniqueSlug(baseTitle) {
    const baseSlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugify"])(baseTitle) || "encuesta";
    try {
        let slug = baseSlug;
        let attempt = 0;
        while(true){
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.findUnique({
                where: {
                    slug
                },
                select: {
                    id: true
                }
            });
            if (!existing) {
                return slug;
            }
            attempt++;
            slug = `${baseSlug}-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateShortCode"])(4).toLowerCase()}`;
            if (attempt > 10) {
                return `${baseSlug}-${Date.now().toString(36)}`;
            }
        }
    } catch  {
        return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }
}
/**
 * Genera un código corto único garantizado.
 */ async function generateUniqueShortCode() {
    try {
        let attempt = 0;
        while(attempt < 10){
            const shortCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateShortCode"])(6);
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.findUnique({
                where: {
                    shortCode
                },
                select: {
                    id: true
                }
            });
            if (!existing) {
                return shortCode;
            }
            attempt++;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateShortCode"])(8);
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$slug$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateShortCode"])(6);
    }
}
async function createSurvey(creatorId, input) {
    const slug = await generateUniqueSlug(input.title);
    const shortCode = await generateUniqueShortCode();
    try {
        const survey = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.create({
            data: {
                creatorId,
                title: input.title.trim(),
                description: input.description?.trim(),
                slug,
                shortCode,
                status: "draft",
                accessMode: input.accessMode || "public_anonymous",
                allowPartial: input.allowPartial ?? false,
                maxResponses: input.maxResponses ? Number(input.maxResponses) : null,
                startsAt: input.startsAt ? new Date(input.startsAt) : null,
                endsAt: input.endsAt ? new Date(input.endsAt) : null,
                consentText: input.consentText?.trim()
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        questions: true,
                        responses: true
                    }
                }
            }
        });
        // Registrar auditoría
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.create({
            data: {
                actorId: creatorId,
                action: "survey.created",
                entityType: "survey",
                entityId: survey.id,
                payload: {
                    title: survey.title,
                    slug: survey.slug,
                    status: survey.status
                }
            }
        }).catch(()=>{});
        return survey;
    } catch (dbErr) {
        console.warn("[survey-service] Fallback a almacenamiento local para createSurvey:", dbErr);
        const localSurvey = {
            id: "survey-" + Date.now(),
            creatorId,
            title: input.title.trim(),
            description: input.description?.trim() || null,
            slug,
            shortCode,
            status: "draft",
            accessMode: input.accessMode || "public_anonymous",
            allowPartial: input.allowPartial ?? false,
            maxResponses: input.maxResponses ? Number(input.maxResponses) : null,
            startsAt: input.startsAt ? new Date(input.startsAt).toISOString() : null,
            endsAt: input.endsAt ? new Date(input.endsAt).toISOString() : null,
            consentText: input.consentText?.trim() || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            creator: {
                id: creatorId,
                name: "Administrador General",
                email: "admin@intt.gob.ve"
            },
            _count: {
                questions: 0,
                responses: 0
            },
            questions: []
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveLocalSurvey"])(localSurvey);
    }
}
async function listSurveys(params) {
    try {
        const limit = Math.min(Math.max(params.limit || 20, 1), 100);
        const where = {};
        if (params.creatorId) where.creatorId = params.creatorId;
        if (params.status) where.status = params.status;
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.findMany({
            where,
            orderBy: {
                createdAt: "desc"
            },
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        questions: true,
                        responses: true
                    }
                }
            }
        });
    } catch (err) {
        console.warn("[survey-service] PostgreSQL no disponible. Usando local-survey-store para listSurveys");
        let surveys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadLocalSurveys"])();
        if (params.status) {
            surveys = surveys.filter((s)=>s.status === params.status);
        }
        return surveys;
    }
}
async function getSurveyById(id) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.findUnique({
            where: {
                id
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                questions: {
                    orderBy: {
                        position: "asc"
                    },
                    include: {
                        options: {
                            orderBy: {
                                position: "asc"
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        responses: true,
                        questions: true,
                        invitations: true
                    }
                }
            }
        });
    } catch (err) {
        console.warn("[survey-service] Usando local-survey-store para getSurveyById");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLocalSurveyById"])(id);
    }
}
async function updateSurvey(id, input, actorId) {
    try {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.findUnique({
            where: {
                id
            }
        });
        if (!existing) return null;
        const dataToUpdate = {};
        if (input.title !== undefined) {
            dataToUpdate.title = input.title.trim();
        }
        if (input.description !== undefined) {
            dataToUpdate.description = input.description?.trim() || null;
        }
        if (input.status !== undefined) {
            dataToUpdate.status = input.status;
        }
        if (input.accessMode !== undefined) {
            dataToUpdate.accessMode = input.accessMode;
        }
        if (input.allowPartial !== undefined) {
            dataToUpdate.allowPartial = input.allowPartial;
        }
        if (input.maxResponses !== undefined) {
            dataToUpdate.maxResponses = input.maxResponses ? Number(input.maxResponses) : null;
        }
        if (input.startsAt !== undefined) {
            dataToUpdate.startsAt = input.startsAt ? new Date(input.startsAt) : null;
        }
        if (input.endsAt !== undefined) {
            dataToUpdate.endsAt = input.endsAt ? new Date(input.endsAt) : null;
        }
        if (input.consentText !== undefined) {
            dataToUpdate.consentText = input.consentText?.trim() || null;
        }
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.update({
            where: {
                id
            },
            data: dataToUpdate,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        questions: true,
                        responses: true
                    }
                }
            }
        });
        // Registrar auditoría del cambio
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.create({
            data: {
                actorId,
                action: "survey.updated",
                entityType: "survey",
                entityId: id,
                payload: {
                    changes: dataToUpdate,
                    previousStatus: existing.status,
                    newStatus: updated.status
                }
            }
        }).catch(()=>{});
        return updated;
    } catch (err) {
        console.warn("[survey-service] Fallback a local store para updateSurvey:", err);
        const local = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLocalSurveyById"])(id);
        if (!local) return null;
        if (input.title !== undefined) local.title = input.title.trim();
        if (input.description !== undefined) local.description = input.description?.trim() || null;
        if (input.status !== undefined) local.status = input.status;
        if (input.accessMode !== undefined) local.accessMode = input.accessMode;
        if (input.allowPartial !== undefined) local.allowPartial = input.allowPartial;
        if (input.maxResponses !== undefined) local.maxResponses = input.maxResponses ? Number(input.maxResponses) : null;
        if (input.consentText !== undefined) local.consentText = input.consentText?.trim() || null;
        local.updatedAt = new Date().toISOString();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveLocalSurvey"])(local);
    }
}
async function deleteSurvey(id, actorId, isAdmin = false) {
    try {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.findUnique({
            where: {
                id
            }
        });
        if (!existing) return {
            success: false,
            notFound: true
        };
        if (existing.status !== "draft" && !isAdmin) {
            return {
                success: false,
                conflict: true,
                reason: "Solo las encuestas en estado 'draft' pueden ser eliminadas. Para otras, use el estado 'archived'."
            };
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].survey.delete({
            where: {
                id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].auditLog.create({
            data: {
                actorId,
                action: "survey.deleted",
                entityType: "survey",
                entityId: id,
                payload: {
                    title: existing.title,
                    status: existing.status
                }
            }
        }).catch(()=>{});
        return {
            success: true
        };
    } catch (err) {
        console.warn("[survey-service] Fallback a local store para deleteSurvey:", err);
        const ok = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$local$2d$survey$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteLocalSurvey"])(id);
        return ok ? {
            success: true
        } : {
            success: false,
            notFound: true
        };
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0dovugb._.js.map