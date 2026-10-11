---
file: encuestaintt-prisma.ruleset.md
doc-type: RULESET
level: L2
area: A2
position: 3
title: RULESET_ENCUESTAINTTT_PRISMA
summary: EncuestaINTTT extra gates for the Prisma/persistence layer — added ON TOP of
  the technology ruleset. Not a procedure.
technology: prisma
applies-to: repository
rules: [schema-of-record, transactional-write, unique-constraints, no-raw-pii]
---

# RULESET — encuestaintt prisma

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: the project-specific gates for the persistence layer, added by reference to the
technology ruleset. The resolver composes both; this ruleset only declares the project's ADDITIONS.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECHNOLOGY=prisma (within the EncuestaINTTT project); APPLIES-TO=repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=RULESET_AS_SELECTION (gates by reference).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=COMPOSE_BY_REFERENCE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-SELECTION

### SECTION 01-RULES

WRITE INFO: this ruleset adds, by reference, the gates:
  - `schema-of-record` — `prisma/schema.prisma` is the only schema; DB access via the client.
  - `transactional-write` — multi-row writes inside `$transaction`.
  - `unique-constraints` — anti-fraud and `(responseId, questionId)` uniqueness enforced in schema.
  - `no-raw-pii` — IP/e-mail persisted only as hashes.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the ruleset is valid when every selected rule resolves to a gate.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
