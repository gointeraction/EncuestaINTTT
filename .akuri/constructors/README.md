---
file: README.md
doc-type: README
level: L4
area: A2
position: 1
title: CONSTRUCTORS
summary: Catálogo de los constructores project-local (L4) del back-office analítico
  de EncuestaINTTT — los orquestadores y how-tos que ensamblan y construyen los
  artefactos de analítica/reportería/acceso, componiendo los packs reutilizables.
---

# Constructores project-local (L4)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: estos son los ciudadanos L4 del método (Rule gobierna · How-To construye ·
Orchestrator ensambla) específicos de la analítica de EncuestaINTTT. Reutilizan los packs
compartidos (`nestjs-akuri-oma-module`, `angular-akuri-oma-*`) y añaden lo propio del dominio
analítico (read models, reportería, sumarización, exportación, acceso).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS · TECH=ANGULAR · TECH=PRISMA · TECH=ORVAL · TECH=PSEUDO.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=ORCHESTRATOR_TO_HOW_TO; ARCH_PATTERN=COMPOSE_PACKS.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=ONE_WAY_DEPENDENCY (orchestrator → how-to → rule).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE CATALOG

### SECTION 01-ORCHESTRATORS

WRITE INFO: orquestadores (verifican precondiciones, invocan how-tos en orden):
  - `orchestrate-create-read-model` — read models `report_*` del esquema `analytics`.
  - `orchestrate-create-reporting-endpoint` — endpoint de reportería (puerto → adaptador → use-case → controlador → OpenAPI → api-sdk → página).
  - `orchestrate-create-summarization-job` — job de sumarización independiente.

### SECTION 02-HOW-TOS

WRITE INFO: how-tos (construyen UN artefacto):
  - `how-to-create-report-export` — CSV con enmascaramiento de PII por rol.
  - `how-to-create-access-policy` — guarda/política RBAC-ABAC + auditoría.
  - `how-to-generate-api-sdk` — cliente tipado desde el OpenAPI (orval).

### SECTION 03-REUSE

WRITE INFO: la construcción estándar (entities, use-cases, ports/adapters, controllers,
tests) se delega en el pack `nestjs-akuri-oma-module`; estos constructores solo añaden lo
analítico y ensamblan el flujo de contrato.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: cada constructor es válido cuando su `deterministic/check.py` (o el verificador
compartido `tools/check-constructors.py`) pasa y cada how-to invocado resuelve a un artefacto.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
