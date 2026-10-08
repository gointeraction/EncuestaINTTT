import assert from "node:assert";
import {
  VALID_QUESTION_TYPES,
  validateQuestionSchema,
} from "../src/lib/services/question-service";

console.log("=== Ejecutando Suite de Pruebas: CRUD de Preguntas y Reglas JSONB (T05 & T06) ===");

// 1. Tipos válidos de preguntas
console.log("-> 1. Verificando tipos permitidos según spec.md (US-1.2)...");
assert.strictEqual(VALID_QUESTION_TYPES.length, 8);
const expectedTypes = [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "dropdown",
  "scale",
  "rating",
  "date",
];
for (const type of expectedTypes) {
  assert.ok(VALID_QUESTION_TYPES.includes(type as any), `El tipo '${type}' debe estar soportado`);
}
console.log("   [PASÓ] Los 8 tipos estándar están correctamente registrados.");

// 2. Rechazo de tipos inválidos
console.log("-> 2. Probando rechazo de tipos no soportados...");
const invalidTypeCheck = validateQuestionSchema("unknown_matrix");
assert.strictEqual(invalidTypeCheck.valid, false);
assert.ok(invalidTypeCheck.error?.includes("inválido"), "Debe indicar error de tipo");
console.log("   [PASÓ] Tipos no registrados son rechazados determinísticamente.");

// 3. Reglas de preguntas de selección (single_choice, multi_choice, dropdown)
console.log("-> 3. Probando validación de opciones para preguntas de selección...");
const noOptionsCheck = validateQuestionSchema("single_choice", []);
assert.strictEqual(noOptionsCheck.valid, false);
assert.ok(noOptionsCheck.error?.includes("al menos 2 opciones"), "Debe exigir al menos 2 opciones");

const oneOptionCheck = validateQuestionSchema("multi_choice", [{ label: "Opción 1", value: "opt1" }]);
assert.strictEqual(oneOptionCheck.valid, false);

const validOptionsCheck = validateQuestionSchema("dropdown", [
  { label: "Caracas", value: "ccs" },
  { label: "Maracaibo", value: "mcbo" },
]);
assert.strictEqual(validOptionsCheck.valid, true);
console.log("   [PASÓ] Exigencia de >= 2 opciones verificada.");

// 4. Reglas numéricas y de escala (JSONB validation_rules)
console.log("-> 4. Probando validaciones de límites en escalas (min < max)...");
const invalidScaleCheck = validateQuestionSchema("scale", undefined, { min: 10, max: 5 });
assert.strictEqual(invalidScaleCheck.valid, false);
assert.ok(invalidScaleCheck.error?.includes("menor que 'max'"), "Debe rechazar min >= max");

const validScaleCheck = validateQuestionSchema("rating", undefined, { min: 1, max: 5 });
assert.strictEqual(validScaleCheck.valid, true);
console.log("   [PASÓ] Reglas de validación numérica validadas.");

// 5. Preguntas de texto libre
console.log("-> 5. Probando preguntas de texto libre sin opciones requeridas...");
const textCheck = validateQuestionSchema("long_text");
assert.strictEqual(textCheck.valid, true);
console.log("   [PASÓ] Preguntas de texto no requieren opciones.");

console.log("\n>>> Todas las pruebas de T05 y T06 (Questions & JSONB Rules) pasaron exitosamente. <<<");
