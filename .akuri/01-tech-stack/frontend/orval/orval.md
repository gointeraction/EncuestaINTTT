---
file: orval.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: ORVAL
summary: Orval — genera el api-sdk tipado (TypeScript) desde el OpenAPI del backend
  NestJS. Es el ÚNICO punto de contacto de la consola Angular con el back-office.
category: orval
scope: the orval specification
---

# Tech-Stack — Orval (frontend)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=API_CONTRACT (OpenAPI → cliente tipado).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/frontend/orval/orval.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `library.orval` — generador del api-sdk desde OpenAPI.

2. **major-version** — última estable — a fijar en el scaffold de `analytics/api-sdk`.

3. **layer** — frontend (herramienta de contrato).

4. **scope-role** — genera el cliente TypeScript tipado (`analytics/api-sdk`) desde el OpenAPI del back-office NestJS; es el contrato SSOT entre el back-office y la consola Angular.

5. **capabilities** — generación de clientes tipados, modelos, mocks; regeneración determinista desde el contrato.

6. **depends-on** — `backend.nestjs.analytics` (origen del OpenAPI); consumido por `frontend.angular.admin`.

7. **canonical-files** — `analytics/api-sdk/orval.config.ts`, `analytics/api-sdk/src/**`.

8. **compliance** — frontend: api-sdk-only (el frontend no escribe clientes a mano), contract-first.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa y `analytics/api-sdk` se regenera sin errores.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
