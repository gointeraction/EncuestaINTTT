---
file: pii-masking-server-side.md
doc-type: RULE
level: L2
area: A2
position: 1
title: PII_MASKING_SERVER_SIDE
summary: El enmascaramiento de PII se aplica en el servidor (nunca en el cliente);
  toda exportación/serialización con datos personales pasa por la utilidad de máscara.
category: access
scope: EncuestaINTTT analytics backend (analytics/api/src) — exportación/reportes.
gate: deterministic/check-pii-masking-server-side.py
actions: create, audit, fix
---

# RULE — pii-masking-server-side (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: todo código de exportación/serialización del back-office MUST aplicar la máscara de
PII en el servidor antes de responder. — MUST

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=access; SCOPE=analytics/api/src (archivos de exportación).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=SERVER_SIDE_GUARANTEE.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: todo archivo bajo `analytics/api/src` cuyo nombre incluya `export` MUST invocar la
máscara (`maskPii(`/`mask(`). — MUST

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-pii-masking-server-side.py`; `--action=audit` falla si un
archivo de exportación no invoca la máscara.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 (o no existe código de exportación aún).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
