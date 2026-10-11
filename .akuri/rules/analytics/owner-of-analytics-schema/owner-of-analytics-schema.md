---
file: owner-of-analytics-schema.md
doc-type: RULE
level: L2
area: A2
position: 1
title: OWNER_OF_ANALYTICS_SCHEMA
summary: El back-office SOLO declara y escribe su esquema analytics; el esquema public
  es de la captura. Cada esquema tiene un único dueño.
category: analytics
scope: EncuestaINTTT analytics backend (analytics/api) — esquema Prisma.
gate: deterministic/check-owner-of-analytics-schema.py
actions: create, audit, fix
---

# RULE — owner-of-analytics-schema (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: el esquema Prisma del back-office MUST declarar sus modelos escribibles solo en el
esquema `analytics` (`@@schema("analytics")`); el acceso a `public` es de solo lectura. — MUST

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=analytics; SCOPE=analytics/api/prisma.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=SCHEMA_PER_OWNER.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: todo modelo escribible de `analytics/api/prisma/schema.prisma` MUST declarar
`@@schema("analytics")`; ningún modelo del back-office vive en `public`. — MUST

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-owner-of-analytics-schema.py`; `--action=audit` falla si
algún modelo del esquema del back-office no declara `@@schema("analytics")`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 (o el esquema aún no existe).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
