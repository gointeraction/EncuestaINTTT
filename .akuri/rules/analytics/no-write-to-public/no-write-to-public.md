---
file: no-write-to-public.md
doc-type: RULE
level: L2
area: A2
position: 1
title: NO_WRITE_TO_PUBLIC
summary: El back-office NUNCA escribe en el esquema public (captura); solo lee.
  Protege la ruta crítica de captura de cualquier efecto del sistema analítico.
category: analytics
scope: EncuestaINTTT analytics backend (analytics/api/src) — no aplica a la captura.
gate: deterministic/check-no-write-to-public.py
actions: create, audit, fix
---

# RULE — no-write-to-public (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: el back-office de EncuestaINTTT MUST NOT ejecutar operaciones de escritura
(`create`/`update`/`delete`/`upsert`/`createMany`/`updateMany`/`deleteMany`/`$executeRaw`) sobre
el esquema `public` (datos de captura). — MUST NOT

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=analytics; SCOPE=analytics/api/src (Prisma/TypeScript).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=READ_ONLY_PUBLIC (rol `intt_analytics_ro`).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: el cliente de lectura del back-office (`publicRead`) MUST NOT recibir llamadas de
escritura; toda escritura analítica va al esquema `analytics`. — MUST NOT

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-no-write-to-public.py`; `--action=audit` falla si
`analytics/api/src` invoca escritura sobre `publicRead`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 sobre `analytics/api/src`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
