---
file: encuestaintt-nextjs-api.ruleset.md
doc-type: RULESET
level: L2
area: A2
position: 2
title: RULESET_ENCUESTAINTTT_NEXTJS_API
summary: EncuestaINTTT extra gates for Next.js route handlers (the API) — added ON TOP
  of the technology ruleset. Not a procedure.
technology: nextjs-api
applies-to: route
rules: [no-console-log, thin-handler, server-side-validation, transactional-write, rbac-before-tenant-data]
---

# RULESET — encuestaintt nextjs-api

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: the project-specific gates for route handlers, added by reference to the technology
ruleset. The resolver composes both; this ruleset only declares the project's ADDITIONS.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECHNOLOGY=nextjs-api (within the EncuestaINTTT project); APPLIES-TO=route.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=RULESET_AS_SELECTION (gates by reference).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=COMPOSE_BY_REFERENCE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-SELECTION

### SECTION 01-RULES

WRITE INFO: this ruleset adds, by reference, the gates:
  - `no-console-log` — no stray console.log/debug.
  - `thin-handler` — the handler delegates to a service; no inline business logic.
  - `server-side-validation` — inputs validated server-side; failure → 422 (RFC 7807).
  - `transactional-write` — multi-row writes run inside a Prisma `$transaction`.
  - `rbac-before-tenant-data` — `requireAuth`/`requireRoles` guard before any tenant data.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the ruleset is valid when every selected rule resolves to a gate.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
