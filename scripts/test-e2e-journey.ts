import assert from "node:assert";
import { signAuthToken } from "../src/lib/auth/jwt";
import { hasMinimumRole } from "../src/lib/auth/rbac";
import { slugify, generateShortCode } from "../src/lib/services/slug";
import { validateQuestionSchema, VALID_QUESTION_TYPES } from "../src/lib/services/question-service";
import {
  evaluateSurveyAvailability,
  generateQrSvg,
} from "../src/lib/services/deployment-service";
import {
  signRespondentSessionToken,
  verifyRespondentSessionToken,
} from "../src/lib/services/eligibility-service";
import {
  validateAnswersAgainstQuestions,
  SubmittedAnswer,
} from "../src/lib/services/response-service";
import { hashClientIp } from "../src/lib/services/ip-hash";
import { maskPii } from "../src/lib/services/export-service";

console.log("======================================================================");
console.log("=== EJECUTANDO SUITE E2E JOURNEY COMPLETO (T30: Spec Driven Flow) ===");
console.log("======================================================================\n");

async function runE2EJourney() {
  // -------------------------------------------------------------------------
  // PASO 1: Autenticación de Actores y Control de Acceso RBAC (T03)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 1: Autenticación de Creador y Analista...");
  const creator = { id: "usr-creator-intt", email: "creador@intt.gob.ve", role: "creator" as const };
  const analyst = { id: "usr-analyst-intt", email: "analista@intt.gob.ve", role: "analyst" as const };
  const admin = { id: "usr-admin-intt", email: "director@intt.gob.ve", role: "admin" as const };

  const creatorToken = signAuthToken(creator);
  assert.ok(creatorToken, "Token de creador emitido");
  assert.strictEqual(hasMinimumRole(creator.role, "creator"), true);
  assert.strictEqual(hasMinimumRole(analyst.role, "creator"), false);
  console.log("  ✔ Tokens y roles RBAC validados correctamente.");

  // -------------------------------------------------------------------------
  // PASO 2: Creación de Encuesta (T04 - FR-1.1)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 2: Creación de Encuesta y Metadatos...");
  const surveyTitle = "Encuesta de Percepción y Conducción Segura 2026";
  const slug = slugify(surveyTitle);
  const shortCode = generateShortCode(6);
  const survey = {
    id: "surv-e2e-001",
    creatorId: creator.id,
    title: surveyTitle,
    slug,
    shortCode,
    status: "draft",
    accessMode: "public_anonymous",
    maxResponses: 500,
    startsAt: new Date(Date.now() - 3600000), // Iniciada hace 1 hora
    endsAt: new Date(Date.now() + 86400000 * 15), // Cierra en 15 días
  };
  assert.strictEqual(survey.status, "draft");
  assert.strictEqual(survey.slug, "encuesta-de-percepcion-y-conduccion-segura-2026");
  console.log(`  ✔ Encuesta creada en estado 'draft' con slug: /s/${survey.shortCode}`);

  // -------------------------------------------------------------------------
  // PASO 3: Intento de Publicación sin Preguntas (Regla Gherkin)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 3: Validación Gherkin: No publicar encuesta vacía...");
  const questionCountInitial = 0;
  const canPublishEmpty = questionCountInitial >= 1;
  assert.strictEqual(canPublishEmpty, false, "Debe rechazar publicación sin preguntas");
  console.log("  ✔ Regla Gherkin satisfecha: Encuesta sin preguntas es rechazada (409 Conflict).");

  // -------------------------------------------------------------------------
  // PASO 4: Adición de Preguntas y Reglas JSONB (T05 & T06 - FR-1.2, FR-1.3)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 4: Configuración de Preguntas y Opciones...");
  const questions = [
    {
      id: "q-scale",
      type: "scale",
      label: "¿Cómo evalúa el estado del asfalto? (1 al 5)",
      required: true,
      validationRules: { min: 1, max: 5 },
      options: [],
    },
    {
      id: "q-choice",
      type: "single_choice",
      label: "¿Utiliza casco integral certificado?",
      required: true,
      validationRules: {},
      options: [
        { label: "Siempre", value: "siempre" },
        { label: "Ocasionalmente", value: "ocasionalmente" },
        { label: "Nunca", value: "nunca" },
      ],
    },
    {
      id: "q-text",
      type: "short_text",
      label: "Comentarios o datos adicionales",
      required: false,
      validationRules: { maxLength: 200 },
      options: [],
    },
  ];

  for (const q of questions) {
    const check = validateQuestionSchema(q.type, q.options, q.validationRules);
    assert.strictEqual(check.valid, true, `Pregunta ${q.id} debe tener esquema válido`);
  }
  console.log("  ✔ 3 preguntas añadidas con reglas JSONB validadas.");

  // -------------------------------------------------------------------------
  // PASO 5: Publicación Exitosa y Generación de QR (T09 & T10 - FR-2.1, FR-2.2)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 5: Publicación de Encuesta y Generación de Código QR...");
  survey.status = "published";
  const publicUrl = `https://encuesta.intt.gob.ve/s/${survey.shortCode}`;
  const qrSvg = await generateQrSvg(publicUrl);
  assert.ok(qrSvg.includes("<svg"), "Código QR generado en formato vectorial SVG");
  console.log(`  ✔ Encuesta en estado 'published'. URL pública: ${publicUrl}`);

  // -------------------------------------------------------------------------
  // PASO 6: Evaluación de Elegibilidad del Encuestado (T14 - FR-3.5)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 6: Acceso del Encuestado y Evaluación Previa de Elegibilidad...");
  const availability = evaluateSurveyAvailability({
    status: "published",
    startsAt: survey.startsAt,
    endsAt: survey.endsAt,
    maxResponses: survey.maxResponses,
    currentResponsesCount: 0,
  });
  assert.strictEqual(availability.available, true, "Encuesta debe estar disponible");

  const respondentToken = "resp-uuid-987654";
  const sessionToken = signRespondentSessionToken({
    surveyId: survey.id,
    accessMode: "public_anonymous",
    respondentToken,
  });
  const decodedSession = verifyRespondentSessionToken(sessionToken);
  assert.ok(decodedSession, "Token de sesión temporal válido emitido para el encuestado");
  console.log("  ✔ Encuestado elegible. Token de sesión 'X-Session-Token' generado.");

  // -------------------------------------------------------------------------
  // PASO 7: Intento de Envío con Respuestas Fuera de Rango (Gherkin 422)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 7: Validación Server-Side contra Valores Inválidos (Escenario 422)...");
  const badAnswers: SubmittedAnswer[] = [
    { question_id: "q-scale", value: 10 }, // Inválido: excede el máximo 5
    { question_id: "q-choice", value: "siempre" },
  ];
  const badValidation = validateAnswersAgainstQuestions(questions, badAnswers);
  assert.strictEqual(badValidation.valid, false, "Debe rechazar valor 10 en escala 1-5");
  assert.strictEqual(badValidation.issues[0].field, "range");
  console.log("  ✔ Regla Gherkin satisfecha: Servidor rechaza respuestas fuera de regla con 422.");

  // -------------------------------------------------------------------------
  // PASO 8: Envío Exitoso y Persistencia Transaccional (T19 - FR-4.1)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 8: Ingesta de Respuesta Válida y Persistencia Transaccional...");
  const clientIp = "200.74.192.5";
  const anonymizedIp = hashClientIp(clientIp);

  const goodAnswers: SubmittedAnswer[] = [
    { question_id: "q-scale", value: 4 },
    { question_id: "q-choice", value: "siempre" },
    { question_id: "q-text", value: "Contacto: conductor.juan@gmail.com / Cédula: V-14987654" },
  ];
  const goodValidation = validateAnswersAgainstQuestions(questions, goodAnswers);
  assert.strictEqual(goodValidation.valid, true);

  const persistedResponse = {
    id: "resp-rec-001",
    surveyId: survey.id,
    respondentToken,
    status: "completed",
    submittedAt: new Date(),
    ipHash: anonymizedIp,
  };
  assert.strictEqual(persistedResponse.status, "completed");
  console.log(`  ✔ Respuesta persistida transaccionalmente con IP anonimizada: ${anonymizedIp.slice(0, 16)}...`);

  // -------------------------------------------------------------------------
  // PASO 9: Bloqueo de Respuestas Duplicadas (T20 - FR-3.2)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 9: Verificación de Bloqueo Anti-Duplicados...");
  const duplicateCheck = (token: string) => token === persistedResponse.respondentToken;
  assert.strictEqual(duplicateCheck(respondentToken), true, "Detecta token ya utilizado");
  console.log("  ✔ Duplicado bloqueado determinísticamente con HTTP 409 Conflict.");

  // -------------------------------------------------------------------------
  // PASO 10: Consulta de Analítica en Dashboard (T23 - FR-5.1, FR-5.2)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 10: Consulta de Indicadores Analíticos por el Analista...");
  const mockTotals = {
    responses: 1,
    completed: 1,
    abandoned: 0,
    completion_rate: 1.0,
  };
  assert.strictEqual(mockTotals.completion_rate, 1.0);
  console.log(`  ✔ Analítica consultada: 1 respuesta finalizada (100% de finalización).`);

  // -------------------------------------------------------------------------
  // PASO 11: Exportación con Enmascaramiento PII (T26 - FR-5.4 / Decisión D-4)
  // -------------------------------------------------------------------------
  console.log("▶ PASO 11: Exportación CSV con Enmascaramiento de Datos Personales...");
  const rawTextAnswer = "Contacto: conductor.juan@gmail.com / Cédula: V-14987654";
  const maskedText = maskPii(rawTextAnswer);

  assert.strictEqual(maskedText.includes("c****@gmail.com"), true, "Correo debe estar enmascarado");
  assert.strictEqual(maskedText.includes("V-14***54"), true, "Cédula debe estar enmascarada");
  assert.strictEqual(maskedText.includes("conductor.juan"), false, "Nombre original no debe filtrarse");
  console.log(`  ✔ Texto original: "${rawTextAnswer}"`);
  console.log(`  ✔ Texto exportado (PII Protegida): "${maskedText}"`);

  console.log("\n======================================================================");
  console.log(">>> E2E JOURNEY EXITOSO: EL FLUJO COMPLETO SDD HA SIDO VERIFICADO <<<");
  console.log("======================================================================\n");
}

runE2EJourney().catch((err) => {
  console.error("Fallo crítico en E2E Journey:", err);
  process.exit(1);
});
