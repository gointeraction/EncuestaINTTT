---
file: no-console-log.md
doc-type: RULE
level: L2
area: A2
position: 1
title: NO_CONSOLE_LOG
summary: In EncuestaINTTT application code, no console.log/console.debug in server
  paths; use structured error logging.
category: quality
scope: EncuestaINTTT application TypeScript code (`src/`).
gate: deterministic/check-no-console-log.py
actions: create, audit, fix
---

# RULE — no-console-log (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: EncuestaINTTT application TypeScript code MUST NOT leave stray
`console.log`/`console.debug` in shipped code paths. — MUST NOT

WRITE INFO: this is a PROJECT rule: it narrows the technology rules for THIS project.
`console.error`/`console.warn` in catch blocks are allowed (they are the current logging seam).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: applies to the technologies used by EncuestaINTTT (nextjs, nextjs-api, react, zustand).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: no `console.log(`/`console.debug(` in `src/**/*.{ts,tsx}` (excluding `.d.ts`,
`node_modules`, `.next`). — MUST NOT

### SECTION 02-THE-GATE

WRITE INFO: the gate is `deterministic/check-no-console-log.py`; `--action=audit` fails on any
offending file, naming it.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the rule holds when the gate returns exit 0 over `EncuestaINTTT/vision-cero/src`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
