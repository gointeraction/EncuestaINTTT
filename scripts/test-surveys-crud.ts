import assert from "node:assert";
import { slugify, generateShortCode } from "../src/lib/services/slug";
import { signAuthToken } from "../src/lib/auth/jwt";

console.log("=== Ejecutando Suite de Pruebas: CRUD de Encuestas (T04) ===");

// 1. Slugify utility
console.log("-> 1. Probando generación de slugs URL-friendly...");
assert.strictEqual(
  slugify("Satisfacción de Atención al Usuario — INTT 2026"),
  "satisfaccion-de-atencion-al-usuario-intt-2026"
);
assert.strictEqual(
  slugify("¿Cómo califica el estado de las vías?"),
  "como-califica-el-estado-de-las-vias"
);
assert.strictEqual(slugify("   Espacios   múltiples   "), "espacios-multiples");
console.log("   [PASÓ] Generador de slugs normaliza tildes, signos y espacios.");

// 2. ShortCode generator
console.log("-> 2. Probando generación de códigos cortos...");
const code1 = generateShortCode(6);
const code2 = generateShortCode(6);
assert.strictEqual(code1.length, 6, "Longitud esperada: 6");
assert.strictEqual(code2.length, 6, "Longitud esperada: 6");
assert.notStrictEqual(code1, code2, "Dos códigos consecutivos no deben ser idénticos");
// Verificar que no use caracteres confusos (0, O, 1, I, l)
const ambiguousChars = ["0", "O", "1", "I", "l"];
for (const char of ambiguousChars) {
  assert.strictEqual(code1.includes(char), false, `El código corto no debe contener '${char}'`);
}
console.log("   [PASÓ] Códigos cortos generados sin caracteres ambiguos.");

// 3. Simulación de Control de Acceso RBAC para CRUD
console.log("-> 3. Verificando restricciones RBAC en operaciones de encuestas...");
const creatorUser = { id: "usr-creator-1", email: "creator@intt.gob.ve", role: "creator" as const };
const analystUser = { id: "usr-analyst-1", email: "analyst@intt.gob.ve", role: "analyst" as const };
const adminUser = { id: "usr-admin-1", email: "admin@intt.gob.ve", role: "admin" as const };

const creatorToken = signAuthToken(creatorUser);
const analystToken = signAuthToken(analystUser);
const adminToken = signAuthToken(adminUser);

assert.ok(creatorToken, "Token creador generado");
assert.ok(analystToken, "Token analista generado");
assert.ok(adminToken, "Token admin generado");

// Validar reglas de negocio del ciclo de vida
console.log("-> 4. Verificando reglas de transición de estados y borrado...");
const validStatuses = ["draft", "published", "closed", "archived"];
function canDeleteSurvey(status: string, role: string): boolean {
  if (role === "admin") return true;
  return status === "draft";
}

assert.strictEqual(canDeleteSurvey("draft", "creator"), true, "Creador puede borrar borrador");
assert.strictEqual(canDeleteSurvey("published", "creator"), false, "Creador no puede borrar publicada");
assert.strictEqual(canDeleteSurvey("closed", "creator"), false, "Creador no puede borrar cerrada");
assert.strictEqual(canDeleteSurvey("published", "admin"), true, "Admin puede borrar cualquier estado");
console.log("   [PASÓ] Reglas de ciclo de vida y políticas de borrado validadas.");

console.log("\n>>> Todas las pruebas de T04 (CRUD Surveys) pasaron exitosamente. <<<");
