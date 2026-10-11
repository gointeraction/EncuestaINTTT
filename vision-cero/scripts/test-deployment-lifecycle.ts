import assert from "node:assert";
import {
  generateQrSvg,
  generateQrPng,
  evaluateSurveyAvailability,
} from "../src/lib/services/deployment-service";

console.log("=== Ejecutando Suite de Pruebas: Despliegue, QR y Ciclo de Vida (T09 - T12) ===");

async function runTests() {
  // 1. Generación de código QR (SVG y PNG)
  console.log("-> 1. Probando generación de código QR en formato SVG y PNG...");
  const testUrl = "https://encuesta.intt.gob.ve/s/aB3xK9";
  const svg = await generateQrSvg(testUrl);
  assert.ok(svg.includes("<svg"), "El output debe ser un documento SVG válido");
  assert.ok(svg.includes("#1c2454"), "El SVG debe aplicar el color institucional INTT Navy");

  const png = await generateQrPng(testUrl);
  assert.ok(Buffer.isBuffer(png), "El output debe ser un Buffer binario");
  // Firma mágica de PNG: 89 50 4E 47 0D 0A 1A 0A
  assert.strictEqual(png[0], 0x89);
  assert.strictEqual(png[1], 0x50);
  assert.strictEqual(png[2], 0x4e);
  assert.strictEqual(png[3], 0x47);
  console.log("   [PASÓ] QR SVG y PNG generados correctamente con colores institucionales.");

  // 2. Disponibilidad temporal (T11)
  console.log("-> 2. Probando evaluación de vigencia temporal (starts_at, ends_at)...");
  const pastDate = new Date(Date.now() - 3600 * 1000);
  const futureDate = new Date(Date.now() + 3600 * 1000);

  // Encuesta aún no iniciada
  const notStarted = evaluateSurveyAvailability({
    status: "published",
    startsAt: futureDate,
    endsAt: null,
    maxResponses: null,
    currentResponsesCount: 10,
  });
  assert.strictEqual(notStarted.available, false);
  assert.strictEqual(notStarted.reason, "not_started");

  // Encuesta expirada
  const expired = evaluateSurveyAvailability({
    status: "published",
    startsAt: pastDate,
    endsAt: pastDate,
    maxResponses: null,
    currentResponsesCount: 10,
  });
  assert.strictEqual(expired.available, false);
  assert.strictEqual(expired.reason, "expired");

  // Encuesta vigente
  const active = evaluateSurveyAvailability({
    status: "published",
    startsAt: pastDate,
    endsAt: futureDate,
    maxResponses: null,
    currentResponsesCount: 10,
  });
  assert.strictEqual(active.available, true);
  console.log("   [PASÓ] Apertura y cierre temporal evaluados correctamente.");

  // 3. Límite de respuestas (T12)
  console.log("-> 3. Probando límite de respuestas máximas (cierre automático)...");
  const quotaReached = evaluateSurveyAvailability({
    status: "published",
    startsAt: null,
    endsAt: null,
    maxResponses: 100,
    currentResponsesCount: 100,
  });
  assert.strictEqual(quotaReached.available, false);
  assert.strictEqual(quotaReached.reason, "quota_reached");

  const quotaAvailable = evaluateSurveyAvailability({
    status: "published",
    startsAt: null,
    endsAt: null,
    maxResponses: 100,
    currentResponsesCount: 99,
  });
  assert.strictEqual(quotaAvailable.available, true);
  console.log("   [PASÓ] Cierre automático por cuota máxima verificado.");

  // 4. Estados del ciclo de vida
  console.log("-> 4. Verificando estados de ciclo de vida (draft -> published -> closed -> archived)...");
  const draftSurvey = evaluateSurveyAvailability({
    status: "draft",
    startsAt: null,
    endsAt: null,
    maxResponses: null,
    currentResponsesCount: 0,
  });
  assert.strictEqual(draftSurvey.available, false);
  assert.strictEqual(draftSurvey.reason, "not_published");
  console.log("   [PASÓ] Encuestas no publicadas bloquean acceso público.");

  console.log("\n>>> Todas las pruebas de Fase 2 (T09, T10, T11, T12) pasaron exitosamente. <<<");
}

runTests().catch((err) => {
  console.error("Fallo en pruebas:", err);
  process.exit(1);
});
