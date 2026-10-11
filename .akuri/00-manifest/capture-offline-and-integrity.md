---
file: capture-offline-and-integrity.md
doc-type: SPEC
level: L2
area: A2
position: 9
title: CAPTURE_OFFLINE_AND_INTEGRITY
summary: Modelo de captura offline-first de Visión Cero con DOS mecanismos (ciudadano PWA y
  encuestador/kiosco), validaciones e idempotencia alineadas, control anti-bot por canal, e
  integridad del sorteo (una participación por ciudadano en una entrevista VÁLIDA). Sólo se
  transmiten encuestas COMPLETAS.
category: 00-manifest
scope: the 00-manifest specification
---

# Captura offline y integridad (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: fija el diseño de captura **offline-first** de la encuesta Visión Cero y las
reglas de **integridad** (validación, idempotencia, anti-bot, sorteo y anti-fraude), para poder
ejecutarlo más adelante sin ambigüedad. Regla de oro: **sólo se transmiten y almacenan encuestas
COMPLETAS**; una **entrevista VÁLIDA** da derecho a **una única** participación en el sorteo por
ciudadano.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NEXTJS · TECH=ZUSTAND · TECH=PWA · TECH=INDEXEDDB · TECH=POSTGRESQL · TECH=REDIS.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=OFFLINE_FIRST; ARCH_PATTERN=OUTBOX; ARCH_PATTERN=IDEMPOTENT_INGESTION;
ARCH_PATTERN=CHANNEL_AGNOSTIC; ARCH_PATTERN=SERVER_AUTHORITATIVE.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=CONDITIONAL_QUESTIONNAIRE (appliesTo / showIf); DESIGN_PATTERN=PROOF_OF_WORK.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-SITUACION-ACTUAL

WRITE INFO: hoy la captura es **online-only**: Next.js SPA (`src/app/page.tsx`), estado en
**zustand sin persistir** (`src/store/survey-store.ts`) y submit **al final** del flujo
(`src/components/survey/sorteo-form.tsx` → `POST /api/survey/submit`). No hay PWA/service worker/
IndexedDB. Recargar **pierde el progreso**; si el submit falla por red, **la respuesta se pierde**.
El endpoint legacy **no valida `answers`** ni `driverType`.

### SECTION 02-MODELO-OFFLINE

WRITE INFO: se adopta **offline-first** con **dos mecanismos** sobre el MISMO núcleo:

| Mecanismo | Dispositivo | Uso | Sincronización |
|-----------|-------------|-----|----------------|
| **Ciudadano** | teléfono propio (PWA) | responde con o sin red | envía al completar / al reconectar |
| **Encuestador / Kiosco** | tablet registrada | muchas entrevistas offline | **lote** al reconectar (batch) |

WRITE RULE: una encuesta MUST estar COMPLETA (todas las preguntas requeridas y aplicables
respondidas según `appliesTo`/`showIf`) antes de encolarse o transmitirse. Incompletas NO se envían. — MUST

### SECTION 03-NUCLEO-CANAL-AGNOSTICO

WRITE INFO: un único objeto de ingesta, común a los canales (`link|qr|kiosk|surveyor`):

```
Submission {
  clientSubmissionId   // UUID — idempotencia
  channel, channelMeta { deviceId?, operatorId?, kioskId? }
  driverType           // ∈ catálogo (6 tipos de Visión Cero)
  answers              // JSON, por version del cuestionario
  surveyVersion        // definición usada por el cliente offline
  capturedAt           // hora del dispositivo
  receivedAt           // hora del servidor (se fija al sincronizar)
  signature?           // kiosco/encuestador: dispositivo firmado
  botProof?            // turnstile (online) | pow (offline)
  sorteo? { participa, nombre, cedula, telefono }
}
```

WRITE INFO: un endpoint de ingesta **idempotente** valida, deduplica y guarda para TODOS los canales.

### SECTION 04-VALIDACIONES-IDEMPOTENCIA-BOT

WRITE INFO: **validaciones**: `appliesTo`/`showIf` + `validateAnswersAgainstQuestions` (ya existe)
se ejecutan en **cliente** (bloquean el envío) y en **servidor** (autoridad). El servidor valida
`driverType` contra el catálogo (hoy sólo `typeof string`).

WRITE INFO: **idempotencia**: `clientSubmissionId` es único. Reintentos y duplicados no crean filas
nuevas.

WRITE INFO: **control anti-bot por canal** (Turnstile no corre sin red):
- Ciudadano **online**: Turnstile al enviar.
- Ciudadano **offline**: **proof-of-work** (hashcash) al completar + verificación secundaria al sincronizar.
- Kiosco / Encuestador: **submissions firmadas** por dispositivo registrado (+ cuota por operador).

WRITE RULE: toda ingesta MUST validar en el SERVIDOR (no confiar en el cliente). — MUST

WRITE RULE: la ingesta MUST ser idempotente por `clientSubmissionId`. — MUST

### SECTION 05-SORTEO-INTEGRIDAD

WRITE INFO: **entrevista VÁLIDA** = completa + pasa validación + no duplicada. Sólo entonces se
genera `codigoSorteo` y se registra la participación del sorteo.

WRITE INFO: la **cédula** (normalizada) es la identidad del sorteo. Hoy el dedup es en la app **sin
índice único** → *race condition*. Se corrige con **índice único parcial** en BD sobre la cédula
cuando `participaSorteo = true`; el conflicto se resuelve sin crear una segunda participación.

WRITE RULE: un ciudadano MUST tener a lo sumo UNA participación válida en el sorteo (cédula única). — MUST

WRITE RULE: la participación del sorteo MUST ligarse a una entrevista VÁLIDA (no a envíos parciales). — MUST

### SECTION 06-RIESGO-FRAUDE

WRITE INFO: vectores y mitigaciones:

| Vector | Riesgo | Mitigación |
|--------|--------|-----------|
| Ciudadano responde N veces (mismo teléfono) | infla conteos | `respondentToken` persistente + rate-limit por token+IP |
| Ciudadano con varias identidades | múltiples sorteos | cédula única (índice) + validación de cédula |
| Bots | volumen | Turnstile/PoW + honeypot + rate-limit (Redis) |
| Encuestador que fabrica respuestas | alto | firma de dispositivo + cuota por operador + detección de anomalías |
| Offline multi-dispositivo (misma persona) | duplicados | idempotencia + dedup servidor |

### SECTION 07-MODELO-DATOS

WRITE INFO: aditivo (no rompe la tabla real): `clientSubmissionId` (unique), `channel`,
`channelMeta`, `capturedAt`, `surveyVersion`, `signature`, `botProof`, y el **índice único de
cédula** del sorteo. La **tabla legacy sigue siendo la fuente** de la encuesta real; la analítica
la sigue leyendo.

### SECTION 08-FASES

WRITE INFO:
- **F1 (online robusto + anti-duplicados) — HECHO (2026-10-11, A3)**: `clientSubmissionId` +
  ingesta **idempotente**; validación **server-side** de `answers`/`driverType`; índice único de
  cédula del sorteo; canal + `capturedAt` en el envelope. Implementación:
  - Validación: `vision-cero/src/lib/validation/vision-cero.ts` (driverType ∈ catálogo;
    `answers` contra `appliesTo`/`showIf` + requeridos + tipos/opciones → 422; tope 256 KB) invocada
    en `vision-cero/src/app/api/survey/submit/route.ts`.
  - Idempotencia: columna única `legacy_survey_responses.client_submission_id`; el cliente envía el
    id (`vision-cero/src/components/survey/sorteo-form.tsx`); un reintento devuelve el MISMO resultado.
  - Sorteo: índice único parcial `vision-cero/deploy/sql/02-capture-unique-cedula.sql` → 409.
  - Pendiente de F1: **persistencia de progreso + outbox** (se materializa en F2).
- **F2 (offline real, PWA)**: service worker + IndexedDB + flush al reconectar; **PoW** offline +
  Turnstile online; `surveyVersion`; persistencia de borrador + **outbox**.
- **F3 (canales confiables + anti-fraude)**: registro/firma de dispositivos kiosco/encuestador,
  cuotas y **panel de anomalías**.

### SECTION 09-DECISIONES-ABIERTAS

WRITE INFO: pendientes de decidir antes de ejecutar:
1. **Unicidad**: ¿una respuesta por ciudadano (dedup duro) o varias respuestas limitando sólo el sorteo?
2. **Identidad**: ¿la cédula es obligatoria para TODAS (permite dedup real) o sólo para el sorteo?
3. **Offline ciudadano**: ¿PWA instalable (modo avión total) o sólo outbox+reintento?
4. **Kiosco/encuestador**: ¿dispositivos firmados o cuota+batch sin firma?
5. **PoW offline**: ¿se adopta como control anti-bot offline?

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la spec es válida cuando el A3 (captura) implementa los MUST de §02/§04/§05 y las
decisiones de §09 están resueltas; en discrepancia, se corrige A2 — nunca se dobla A3.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
