---
file: capture-robustness.md
doc-type: SPEC
level: L2
area: A2
position: 10
title: CAPTURE_ROBUSTNESS
summary: Hallazgos de la auditoría de robustez de la captura Visión Cero (path real
  /api/survey/submit) y sus recomendaciones. Alimenta las fases de capture-offline-and-integrity.
category: 00-manifest
scope: the 00-manifest specification
---

# Robustez de la captura (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: registra los hallazgos de robustez detectados en la captura REAL (Visión Cero) y las
recomendaciones, como insumo para `capture-offline-and-integrity.md`.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NEXTJS · TECH=PRISMA · TECH=POSTGRESQL.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=SERVER_AUTHORITATIVE.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH.

## CHAPTER 3: CONTENT

### SECTION 01-HALLAZGOS

WRITE INFO: el path real es `POST /api/survey/submit` → `db.surveyResponse.create` (tabla
`public.legacy_survey_responses`). Hallazgos:

| # | Hallazgo | Severidad |
|---|----------|-----------|
| 1 | Sin validación server-side de `answers` (se guarda el JSON del cliente tal cual) | ALTA |
| 2 | `driverType` no validado contra el catálogo (sólo `typeof string`) | ALTA |
| 3 | Sin dedup de la respuesta; cédula sin índice único → race condition | ALTA |
| 4 | Sin outbox/cola: si la escritura falla, la respuesta se pierde | ALTA |
| 5 | Rate-limit en memoria (por instancia) + confianza en `x-forwarded-for` | MEDIA |
| 6 | Turnstile con claves de prueba por defecto si faltan env | MEDIA |
| 7 | Prisma `log:['query']` siempre (incluido producción) | MEDIA |
| 8 | Fallback `sqlite_backup.json` estático/obsoleto (nunca se re-escribe) | MEDIA |
| 9 | Doble stack de ingesta (legacy + SDD); la encuesta real usa el legacy | ARQUITECTURA |
| 10 | `generateSorteoCode` con `Math.random()` y sin unicidad | BAJA-MEDIA |
| 11 | Sin límite de tamaño de body/`answers` | BAJA |

WRITE INFO: bien hoy: honeypot, `$transaction` en el flujo SDD, normalización de cédula/teléfono,
hash de IP con salt diario (GDPR) — aunque el legacy no guarda IP.

### SECTION 02-RECOMENDACIONES

WRITE INFO: 1 validar `answers` y `driverType` server-side; 2 índice único parcial de cédula del
sorteo; 3 outbox durable + reintentos idempotentes; 4 rate-limit con Redis + confiar en el proxy;
5 fallar si en producción faltan claves Turnstile reales; 6 quitar `log:['query']` en producción +
pool; 7 sustituir/eliminar el fallback obsoleto; 8 código de sorteo con `crypto` + unicidad; 9
límite de tamaño de body.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: los hallazgos se cierran al implementar los MUST de `capture-offline-and-integrity.md`
(F1–F3) y sus gates.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
