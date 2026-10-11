---
file: orchestrate-create-read-model.md
doc-type: ORCHESTRATOR
level: L4
area: A2
position: 1
title: ORCHESTRATE_CREATE_READ_MODEL
summary: Ensambla la creación de un read model del esquema analytics — verifica
  precondiciones, invoca los how-tos del pack NestJS en orden y cierra con su propio gate.
scope: analytics/api/src/modules/analytics/read-model
---

# ORCHESTRATE_CREATE_READ_MODEL

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: crear (o ampliar) un read model `report_*` que se calcula desde `public` (solo
lectura) y se persiste en `analytics`, sin tocar la captura.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS · TECH=PRISMA.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=ORCHESTRATOR_TO_HOW_TO; ARCH_PATTERN=CQRS.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=READ_MODEL.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-PRECONDITIONS

WRITE INFO: verificar: (a) existe el esquema `analytics` y el rol del back-office; (b) el
modelo Prisma `report_*` declara `@@schema("analytics")`; (c) hay acceso de solo lectura a
`public`. Si falta, DETENER.

### SECTION 02-INVOKE-HOW-TOS

WRITE INFO: invocar, en orden, los how-tos del pack `nestjs-akuri-oma-module`:
  - `how-to-create-entity` (el read model),
  - `how-to-create-ports-adapters` (lectura `public` + escritura `analytics`),
  - `how-to-create-use-cases` (el cálculo),
  - `how-to-create-test`.

### SECTION 03-BUNDLE-RULES

WRITE INFO: cada paso corre dentro de las reglas: `owner-of-analytics-schema`,
`no-write-to-public`, `read-model-derived`.

### SECTION 04-CLOSE

WRITE INFO: cerrar con `deterministic/check.py` del orquestador (precondiciones + resultado)
y regenerar el read model con el job (`orchestrate-create-summarization-job`).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el orquestador es válido cuando cada how-to invocado existe y el gate cierra.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
