---
file: encuestaintt-nestjs-analytics.ruleset.md
doc-type: RULESET
level: L2
area: A2
position: 4
title: RULESET_ENCUESTAINTTT_NESTJS_ANALYTICS
summary: EncuestaINTTT extra gates for the NestJS back-office (analytics/reporting/access)
  — added ON TOP of the technology ruleset. Not a procedure.
technology: nestjs
applies-to: backoffice-api
rules: [no-console-log, source-layout, module-structure, controllers-endpoints, use-cases, domain-errors, cross-module-communication, owner-of-analytics-schema, no-write-to-public, pagination, audit-fields, rbac-before-data, pii-masking-server-side, access-audit-required]
---

# RULESET — encuestaintt nestjs analytics (back-office)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: the project-specific gates for the back-office API, added by reference to the
technology ruleset `02-technologies/nestjs/...`. The resolver composes both; this ruleset only
declares the project's ADDITIONS.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECHNOLOGY=nestjs (within the EncuestaINTTT project); APPLIES-TO=backoffice-api.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=RULESET_AS_SELECTION (gates by reference).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=COMPOSE_BY_REFERENCE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-SELECTION

### SECTION 01-RULES

WRITE INFO: this ruleset adds, by reference, the gates:
  - Technology: `no-console-log`, `source-layout`, `module-structure`, `controllers-endpoints`,
    `use-cases`, `domain-errors`, `cross-module-communication`, `pagination`, `audit-fields`.
  - Ownership: `owner-of-analytics-schema` (solo escribe `analytics`), `no-write-to-public`,
    `read-only-on-public` (rol `intt_analytics_ro`).
  - Access: `rbac-before-data`, `pii-masking-server-side`, `access-audit` (registrar lecturas
    sensibles).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the ruleset is valid when every selected rule resolves to a gate.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
