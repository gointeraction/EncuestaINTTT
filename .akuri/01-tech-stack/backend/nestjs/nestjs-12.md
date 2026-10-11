---
file: nestjs-11.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: NESTJS_12
summary: NestJS 12 — el backend del BACK-OFFICE analítico de EncuestaINTTT (API de
  analítica, reportería y control de acceso restringido). Hexagonal, por supradominio;
  lee el esquema public en solo-lectura y escribe el esquema analytics.
category: nestjs
scope: the nestjs specification
---

# Tech-Stack — NestJS 12 (backend analítico)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository (ver `00-manifest/analytics-platform.md`).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=HEXAGONAL; ARCH_PATTERN=LAYERED (controller → use-case → port → adapter).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=PORT_ADAPTER; DESIGN_PATTERN=READ_MODEL.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/backend/nestjs/nestjs-12.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `backend.nestjs.analytics` — NestJS, el framework del backend del back-office (analítica, reportería, acceso restringido).

2. **major-version** — 12 — `@nestjs/core ^12.0.1`, scaffold real con `@nestjs/cli@12` en `analytics/api`.

3. **layer** — backend.

4. **scope-role** — expone la API de análisis y reportería consumida SOLO por la consola Angular; agrupa módulos por supradominio (`platform`, `analytics`); arquitectura hexagonal; DTOs de entrada/salida; cero entidades en controladores. Lee `public` en solo-lectura y escribe `analytics`.

5. **capabilities** — endpoints REST (extensibles por feature), orquestación de use-cases, errores de dominio, guards de authN/authZ (RBAC/ABAC), jobs de sumarización (scheduler), exportación con enmascaramiento PII, auditoría de acceso, OpenAPI.

6. **depends-on** — `persistence.postgresql` (rol `intt_analytics_ro` sobre `public`; escritura en `analytics`), `persistence.prisma`; consumido por `frontend.angular.admin` vía `library.orval`.

7. **canonical-files** — `analytics/api/package.json`, `analytics/api/src/main.ts`, `analytics/api/src/app.module.ts`, `analytics/api/src/{core,modules,shared}`.

8. **compliance** — backend: source-layout (core/modules/shared), module-structure, controllers-endpoints, use-cases, domain-errors, cross-module-communication (puertos), owner-of-analytics-schema, no-write-to-public, pagination, audit-fields, no-console-log.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa y la instancia `encuestaintt-analytics-api` existe y concuerda.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
