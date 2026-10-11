---
file: angular.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: ANGULAR_22
summary: Angular 22 (standalone) — el framework de la CONSOLA de análisis y autenticación
  del personal (back-office). Consume la API NestJS solo por el api-sdk generado.
category: angular
scope: the angular specification
---

# Tech-Stack — Angular 22 (frontend analítico)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository (ver `00-manifest/analytics-platform.md`).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=STANDALONE_COMPONENTS; ARCH_PATTERN=SMART_DUMB (contenedores + presentación).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=API_SDK_ONLY; DESIGN_PATTERN=GUARD (sesión de staff).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/frontend/angular/angular-22.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `frontend.angular.admin` — Angular, el framework de la consola de análisis y autenticación del personal.

2. **major-version** — 22 — `@angular/core ^22.2.0`, scaffold real con `@angular/cli@22` en `analytics/console`.

3. **layer** — frontend.

4. **scope-role** — interfaz del personal autorizado (admin/analista/auditor): login, dashboards, reportes, exportación. Habla con el back-office ÚNICAMENTE por el api-sdk.

5. **capabilities** — componentes standalone, routing lazy por feature, guards de sesión, interceptor HTTP (token), signals/estado, design system propio, consumo de `api-sdk` tipado.

6. **depends-on** — `backend.nestjs.analytics` (vía `library.orval` → `analytics/api-sdk`).

7. **canonical-files** — `analytics/console/package.json`, `analytics/console/src/main.ts`, `analytics/console/src/app/app.config.ts`, `analytics/console/src/app/{core,modules,shared}`.

8. **compliance** — frontend: source-layout (core/modules/shared), api-sdk-only (no acceso directo a datos), session-guard, no-console-log, design-system-tokens.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa y la instancia `encuestaintt-admin` existe y concuerda.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
