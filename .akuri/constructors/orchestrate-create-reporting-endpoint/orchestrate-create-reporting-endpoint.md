---
file: orchestrate-create-reporting-endpoint.md
doc-type: ORCHESTRATOR
level: L4
area: A2
position: 2
title: ORCHESTRATE_CREATE_REPORTING_ENDPOINT
summary: Ensambla un endpoint de reportería de punta a punta (read model → puerto →
  adaptador → caso de uso → controlador → OpenAPI → api-sdk → página Angular).
scope: analytics/api/src/modules/analytics/reporting + analytics/console
---

# ORCHESTRATE_CREATE_REPORTING_ENDPOINT

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: crear un endpoint de reportería (solo lectura) y su consumo en la consola, con el
contrato como única fuente de verdad.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS · TECH=ANGULAR · TECH=ORVAL.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=API_CONTRACT (OpenAPI → api-sdk).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=PORT_ADAPTER.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-PRECONDITIONS

WRITE INFO: verificar que el read model de origen existe y que la analítica está sumarizada.

### SECTION 02-INVOKE-HOW-TOS

WRITE INFO: invocar en orden:
  - `how-to-create-ports-adapters` (puerto de consulta read-only),
  - `how-to-create-use-cases` (consulta),
  - `how-to-create-endpoint` (controlador delgado con `SessionGuard` + auditoría),
  - `how-to-generate-api-sdk` (regenerar el cliente),
  - `orchestrate-create-analytics-page` del pack Angular (página que lo consume).

### SECTION 03-BUNDLE-RULES

WRITE INFO: cada paso corre dentro de las reglas: `rbac-before-data`, `access-audit-required`,
`pagination`, `api-sdk-only` (consola).

### SECTION 04-CLOSE

WRITE INFO: cerrar con `deterministic/check.py`; exige el gate de contrato (OpenAPI válido).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el flujo `orchestrator → how-to → rule` es acíclico y cada how-to resuelve.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
