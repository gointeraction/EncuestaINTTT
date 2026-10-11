---
file: nextjs-api-16.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: NEXTJS_API_16
summary: Next.js Route Handlers — the backend of EncuestaINTTT. Two API generations
  (legacy Visión Cero `/api/*` and SDD v1 `/api/v1/*`), thin handlers delegating to
  the service layer.
category: nextjs-api
scope: the nextjs-api specification
---

# Tech-Stack — Next.js Route Handlers (backend)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=ROUTE_HANDLERS; ARCH_PATTERN=LAYERED (route → service → db).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=SERVICE_LAYER.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/backend/nextjs-api/nextjs-api-16.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `backend.nextjs-api` — Next.js Route Handlers (`src/app/api/**/route.ts`), the application backend.

2. **major-version** — 16 — same Next.js 16 runtime; `output: "standalone"`.

3. **layer** — backend.

4. **scope-role** — exposes the REST API consumed by the UI: legacy Visión Cero routes (`/api/survey/submit`, `/api/survey/stats`, `/api/survey/participants`, `/api/survey/seed`, `/api/admin/*`) and the SDD v1 routes (`/api/v1/surveys/**`, `/api/v1/public/surveys/**`).

5. **capabilities** — per-verb handlers (`GET`/`POST`/`PATCH`/`DELETE`), request validation, standardized error responses (`createProblemResponse` → RFC 7807), transactional writes, RBAC guards (`requireAuth`/`requireRoles`).

6. **depends-on** — `persistence.prisma`, `persistence.postgresql`; `security.turnstile`; `lib/rate-limit.ts`.

7. **canonical-files** — `src/app/api/*/route.ts`, `src/lib/services/*.ts`, `src/lib/auth/*.ts`.

8. **compliance** — backend: source-layout, thin-handler (no inline business logic), server-side-validation (422), transactional-write ($transaction), rbac-before-tenant-data, no-console-log.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
