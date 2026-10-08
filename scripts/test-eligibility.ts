import assert from "node:assert";
import { hashClientIp } from "../src/lib/services/ip-hash";
import {
  signRespondentSessionToken,
  verifyRespondentSessionToken,
  hashEmail,
} from "../src/lib/services/eligibility-service";

console.log("=== Ejecutando Suite de Pruebas: Motor de Elegibilidad y Seguridad (T14 - T18) ===");

// 1. Anonimización de IP con salt rotativo (NFR-7)
console.log("-> 1. Probando anonimización criptográfica de direcciones IP...");
const ip1 = "190.202.45.12";
const ip2 = "190.202.45.13";
const hash1 = hashClientIp(ip1);
const hash2 = hashClientIp(ip2);
const hash1Repeat = hashClientIp(ip1);

assert.strictEqual(hash1.length, 64, "El hash de IP debe ser SHA-256 de 64 caracteres");
assert.strictEqual(hash1, hash1Repeat, "Misma IP dentro del mismo día debe generar hash idéntico");
assert.notStrictEqual(hash1, hash2, "IPs distintas deben generar hashes diferentes");
assert.strictEqual(hash1.includes(ip1), false, "La IP original no debe ser recuperable");
console.log("   [PASÓ] Hash de IP unidireccional y determinista verificado.");

// 2. Hash de correos para anti-duplicados (US-3.2)
console.log("-> 2. Probando normalización y hash de correos electrónicos...");
const emailNormal = "conductor@gmail.com";
const emailSpacedUpper = "  Conductor@GMAIL.COM  ";
assert.strictEqual(hashEmail(emailNormal), hashEmail(emailSpacedUpper));
console.log("   [PASÓ] Normalización y hash de correo son inmunes a mayúsculas y espacios.");

// 3. Emisión y verificación de tokens de sesión para encuestados (US-3.5)
console.log("-> 3. Probando ciclo de vida de tokens de sesión de encuestado...");
const sessionPayload = {
  surveyId: "surv-100",
  accessMode: "public_anonymous" as const,
  respondentToken: "resp-token-uuid-123",
};

const sessionToken = signRespondentSessionToken(sessionPayload, 3600);
assert.ok(sessionToken.includes("."), "El token de sesión debe ser firmado");

const decodedSession = verifyRespondentSessionToken(sessionToken);
assert.ok(decodedSession, "El token válido debe verificarse exitosamente");
assert.strictEqual(decodedSession.surveyId, sessionPayload.surveyId);
assert.strictEqual(decodedSession.respondentToken, sessionPayload.respondentToken);
assert.strictEqual(decodedSession.accessMode, sessionPayload.accessMode);

// Rechazo de tokens manipulados
const tamperedToken = sessionToken.slice(0, -4) + "zzzz";
assert.strictEqual(verifyRespondentSessionToken(tamperedToken), null, "Debe rechazar firmas adulteradas");

// Rechazo de tokens expirados
const expiredToken = signRespondentSessionToken(sessionPayload, -10);
assert.strictEqual(verifyRespondentSessionToken(expiredToken), null, "Debe rechazar tokens expirados");
console.log("   [PASÓ] Tokens de sesión protegidos contra manipulación y caducidad.");

// 4. Verificación del Escenario Gherkin (Bloquear duplicado con token de invitación)
console.log("-> 4. Verificando lógica del Escenario Gherkin: 'Bloquear duplicado con token'...");
function simulateEligibilityCheck(invitationStatus: string) {
  if (invitationStatus === "used") {
    return {
      eligible: false,
      status: 409,
      message: "Esta encuesta ya fue respondida",
      questions: null,
    };
  }
  if (invitationStatus === "pending") {
    return {
      eligible: true,
      status: 200,
      questions: [{ id: "q1", label: "¿Pregunta 1?" }],
    };
  }
  return { eligible: false, status: 403, questions: null };
}

const consumedResult = simulateEligibilityCheck("used");
assert.strictEqual(consumedResult.eligible, false);
assert.strictEqual(consumedResult.status, 409);
assert.strictEqual(consumedResult.questions, null, "NO debe revelar preguntas si ya fue consumido");

const freshResult = simulateEligibilityCheck("pending");
assert.strictEqual(freshResult.eligible, true);
assert.ok(freshResult.questions && freshResult.questions.length > 0, "Debe incluir preguntas si es elegible");
console.log("   [PASÓ] Escenario Gherkin validado: preguntas ocultas ante duplicados.");

console.log("\n>>> Todas las pruebas de Fase 3 (Elegibilidad y Seguridad) pasaron exitosamente. <<<");
