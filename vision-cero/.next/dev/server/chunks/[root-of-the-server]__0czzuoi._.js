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
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/admin/session/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/auth/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/session.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    try {
        const authed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminAuthed"])();
        if (authed) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAuthSessionCookie"])({
                id: "admin-master",
                email: "admin@intt.gob.ve",
                role: "admin"
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            authed
        });
    } catch (e) {
        console.error("[admin/session] error", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            authed: false
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0czzuoi._.js.map