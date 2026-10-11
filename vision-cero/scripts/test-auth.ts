import assert from "node:assert";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { signAuthToken, verifyAuthToken } from "../src/lib/auth/jwt";
import { hasMinimumRole } from "../src/lib/auth/rbac";

console.log("=== Ejecutando Suite de Pruebas: Módulo Auth & RBAC (T03) ===");

// 1. Password Hashing & Verification
console.log("-> 1. Probando hashing y verificación de contraseñas con scrypt...");
const password = "SuperSecretPassword2026!";
const hash = hashPassword(password);
assert.ok(hash.includes(":"), "El hash debe contener salt y key separados por dos puntos");
assert.ok(verifyPassword(password, hash), "Debe verificar la contraseña correcta");
assert.strictEqual(verifyPassword("WrongPassword!", hash), false, "Debe rechazar una contraseña incorrecta");
assert.strictEqual(verifyPassword(password, "invalidsalt:invalidkey"), false, "Debe manejar hashes corruptos sin crashear");
console.log("   [PASÓ] Hashing y verificación seguros.");

// 2. JWT Generation & Verification
console.log("-> 2. Probando emisión y validación de tokens JWT...");
const testUser = {
  id: "usr-12345",
  email: "admin@intt.gob.ve",
  role: "admin" as const,
};

const token = signAuthToken(testUser, 3600);
assert.ok(token, "El token debe generarse");
const parts = token.split(".");
assert.strictEqual(parts.length, 3, "El JWT debe tener exactamente 3 segmentos");

const decoded = verifyAuthToken(token);
assert.ok(decoded, "El token válido debe decodificarse");
assert.strictEqual(decoded.sub, testUser.id, "El sub debe coincidir");
assert.strictEqual(decoded.email, testUser.email, "El email debe coincidir");
assert.strictEqual(decoded.role, testUser.role, "El rol debe coincidir");
console.log("   [PASÓ] Emisión y decodificación correcta.");

// 3. JWT Tampering Protection
console.log("-> 3. Probando protección contra alteración y falsificación de JWT...");
const tamperedPayload = parts[0] + "." + Buffer.from(JSON.stringify({ sub: "hacker", role: "admin" })).toString("base64") + "." + parts[2];
assert.strictEqual(verifyAuthToken(tamperedPayload), null, "Debe rechazar tokens con payload adulterado");

const tamperedSignature = token.slice(0, -5) + "abcde";
assert.strictEqual(verifyAuthToken(tamperedSignature), null, "Debe rechazar firmas inválidas");
console.log("   [PASÓ] Detección de manipulaciones y firmas forjadas.");

// 4. JWT Expiration
console.log("-> 4. Probando expiración de tokens...");
const expiredToken = signAuthToken(testUser, -10); // Expirado hace 10s
assert.strictEqual(verifyAuthToken(expiredToken), null, "Debe rechazar tokens expirados");
console.log("   [PASÓ] Expiración respetada.");

// 5. RBAC Hierarchy
console.log("-> 5. Probando jerarquía de roles RBAC...");
assert.strictEqual(hasMinimumRole("admin", "creator"), true, "Admin supera a Creator");
assert.strictEqual(hasMinimumRole("admin", "analyst"), true, "Admin supera a Analyst");
assert.strictEqual(hasMinimumRole("creator", "analyst"), true, "Creator supera a Analyst");
assert.strictEqual(hasMinimumRole("creator", "creator"), true, "Creator satisface Creator");
assert.strictEqual(hasMinimumRole("analyst", "creator"), false, "Analyst no satisface Creator");
assert.strictEqual(hasMinimumRole("analyst", "admin"), false, "Analyst no satisface Admin");
console.log("   [PASÓ] Jerarquía RBAC evaluada correctamente.");

console.log("\n>>> Todas las pruebas de T03 (Auth + RBAC) pasaron exitosamente. <<<");
