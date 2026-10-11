---
file: orchestrate-create-summarization-job.md
doc-type: ORCHESTRATOR
level: L4
area: A2
position: 3
title: ORCHESTRATE_CREATE_SUMMARIZATION_JOB
summary: Ensambla un job de sumarización independiente (cálculo desde public → escritura
  en analytics), con registro de corridas y ejecución programada.
scope: analytics/api/src/modules/analytics/read-model + integration/scheduler
---

# ORCHESTRATE_CREATE_SUMMARIZATION_JOB

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: crear un job que recalcule uno o más read models sin interferir con la captura.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS · TECH=PRISMA.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=ORCHESTRATOR_TO_HOW_TO.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=READ_MODEL.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-PRECONDITIONS

WRITE INFO: verificar que el read model objetivo y su puerto de lectura existen.

### SECTION 02-INVOKE-HOW-TOS

WRITE INFO: invocar en orden:
  - `how-to-create-use-cases` (el cálculo del job),
  - `how-to-create-service` (servicio de ejecución + registro de corrida),
  - `how-to-create-endpoint` (disparo manual + estado),
  - (opcional) alto en el `SchedulerService` (job programado).

### SECTION 03-BUNDLE-RULES

WRITE INFO: cada paso corre dentro de las reglas: `summarization-via-job` (concepto),
`no-write-to-public`, `owner-of-analytics-schema`.

### SECTION 04-CLOSE

WRITE INFO: cerrar con `deterministic/check.py` y una corrida de humo (job → estado `done`).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el job es válido cuando su gate pasa y una corrida registra estado.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
