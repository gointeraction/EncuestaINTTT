---
file: encuestaintt-nextjs-page.ruleset.md
doc-type: RULESET
level: L2
area: A2
position: 1
title: RULESET_ENCUESTAINTTT_NEXTJS_PAGE
summary: EncuestaINTTT extra gates for Next.js pages/widgets — added ON TOP of the
  technology ruleset (composed by the resolver, never repeated). Not a procedure.
technology: nextjs
applies-to: page
rules: [no-console-log, client-directive, ui-no-upward-dependency, no-db-in-page]
---

# RULESET — encuestaintt nextjs-page

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: the project-specific gates for Next.js pages/widgets, added by reference to the
technology ruleset. The resolver composes both; this ruleset only declares the project's ADDITIONS.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECHNOLOGY=nextjs (within the EncuestaINTTT project); APPLIES-TO=page.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=RULESET_AS_SELECTION (gates by reference).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=COMPOSE_BY_REFERENCE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-SELECTION

### SECTION 01-RULES

WRITE INFO: this ruleset adds, by reference, the gates:
  - `no-console-log` — no stray console.log/debug in application code.
  - `client-directive` — a component using hooks/browser APIs declares `"use client"`.
  - `ui-no-upward-dependency` — `components/ui/*` does not import survey/dashboard/admin code.
  - `no-db-in-page` — pages/components never query the DB; they call the API.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the ruleset is valid when every selected rule resolves to a gate.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
