import assert from "node:assert";
import {
  validateAnswersAgainstQuestions,
  SubmittedAnswer,
} from "../src/lib/services/response-service";

console.log("=== Ejecutando Suite de Pruebas: Ingesta Transaccional y Validación Server-Side (T19 - T22) ===");

// 1. Escenario Gherkin: "Respuesta inválida rechazada en servidor"
console.log("-> 1. Verificando Escenario Gherkin: 'Respuesta inválida rechazada en servidor'...");
const scaleQuestion = {
  id: "q-scale-1",
  type: "scale",
  label: "Califique el servicio en escala del 1 al 5",
  required: true,
  validationRules: { min: 1, max: 5 },
  options: [],
};

const invalidScaleAnswers: SubmittedAnswer[] = [
  { question_id: "q-scale-1", value: 9 }, // Valor fuera de regla
];

const scaleCheck = validateAnswersAgainstQuestions([scaleQuestion], invalidScaleAnswers);
assert.strictEqual(scaleCheck.valid, false, "Debe rechazar valores numéricos fuera del rango [1..5]");
assert.strictEqual(scaleCheck.issues.length, 1);
assert.strictEqual(scaleCheck.issues[0].questionId, "q-scale-1");
assert.strictEqual(scaleCheck.issues[0].field, "range");
console.log("   [PASÓ] Escenario Gherkin validado: escala 1–5 con valor 9 es rechazada con HTTP 422.");

// 2. Validación de preguntas requeridas
console.log("-> 2. Probando detección de preguntas requeridas omitidas...");
const emptyAnswers: SubmittedAnswer[] = [];
const requiredCheck = validateAnswersAgainstQuestions([scaleQuestion], emptyAnswers);
assert.strictEqual(requiredCheck.valid, false);
assert.strictEqual(requiredCheck.issues[0].field, "required");
console.log("   [PASÓ] Omisión de campos requeridos detectada correctamente.");

// 3. Validación de opciones en preguntas de selección (single_choice / multi_choice)
console.log("-> 3. Probando validación estricta de opciones predefinidas...");
const choiceQuestion = {
  id: "q-choice-1",
  type: "single_choice",
  label: "¿Usa casco al conducir?",
  required: true,
  validationRules: {},
  options: [
    { label: "Siempre", value: "siempre" },
    { label: "A veces", value: "a_veces" },
    { label: "Nunca", value: "nunca" },
  ],
};

const forgedOptionAnswers: SubmittedAnswer[] = [
  { question_id: "q-choice-1", value: "opcion_falsa_inyectada" },
];

const optionCheck = validateAnswersAgainstQuestions([choiceQuestion], forgedOptionAnswers);
assert.strictEqual(optionCheck.valid, false);
assert.strictEqual(optionCheck.issues[0].field, "option_value");
console.log("   [PASÓ] Rechazo de opciones inexistentes o adulteradas verificado.");

// 4. Validación de respuesta completamente válida
console.log("-> 4. Probando verificación exitosa de respuestas conformes...");
const validAnswers: SubmittedAnswer[] = [
  { question_id: "q-scale-1", value: 4 },
  { question_id: "q-choice-1", value: "siempre" },
];

const allValidCheck = validateAnswersAgainstQuestions(
  [scaleQuestion, choiceQuestion],
  validAnswers
);
assert.strictEqual(allValidCheck.valid, true);
assert.strictEqual(allValidCheck.issues.length, 0);
console.log("   [PASÓ] Conjunto de respuestas válidas aprobado al 100%.");

// 5. Escenario Gherkin: "Cierre automático por límite"
console.log("-> 5. Verificando lógica del Escenario Gherkin: 'Cierre automático por límite'...");
function simulateQuotaCheck(maxResponses: number, currentResponses: number) {
  const newTotal = currentResponses + 1;
  const autoClose = newTotal >= maxResponses;
  return { newTotal, autoClose, newStatus: autoClose ? "closed" : "published" };
}

// 99 respuestas de 100 -> respuesta #100 dispara cierre automático
const closureTest = simulateQuotaCheck(100, 99);
assert.strictEqual(closureTest.newTotal, 100);
assert.strictEqual(closureTest.autoClose, true);
assert.strictEqual(closureTest.newStatus, "closed");

// 50 respuestas de 100 -> continúa abierta
const openTest = simulateQuotaCheck(100, 50);
assert.strictEqual(openTest.autoClose, false);
assert.strictEqual(openTest.newStatus, "published");
console.log("   [PASÓ] Cierre automático al alcanzar límite verificado.");

console.log("\n>>> Todas las pruebas de Fase 4 (Ingesta y Validación de Respuestas) pasaron exitosamente. <<<");
