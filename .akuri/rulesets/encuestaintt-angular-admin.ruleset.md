---
file: encuestaintt-angular-admin.ruleset.md
doc-type: RULESET
level: L2
area: A2
position: 5
title: RULESET_ENCUESTAINTTT_ANGULAR_ADMIN
summary: EncuestaINTTT extra gates for the Angular staff console (back-office) — added
  ON TOP of the technology ruleset. Not a procedure.
technology: angular
applies-to: admin-console
rules: [no-console-log, source-layout, api-sdk-only, session-guard, no-db-in-page, design-system-tokens]
---

# RULESET — encuestaintt angular admin (consola de staff)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: the project-specific gates for the Angular staff console, added by reference to the
technology ruleset. The resolver composes both; this ruleset only declares the project's ADDITIONS.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECHNOLOGY=angular (within the EncuestaINTTT project); APPLIES-TO=admin-console.

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
  - `source-layout` — core/modules/shared in `apps/admin-web/src/app/`.
  - `api-sdk-only` — the console talks to the back-office ONLY through `packages/api-sdk`.
  - `session-guard` — every protected route requires an authenticated staff session.
  - `no-db-in-page` — pages never access the database.
  - `design-system-tokens` — tokens are the single source of truth for the console's visuals.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the ruleset is valid when every selected rule resolves to a gate.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
