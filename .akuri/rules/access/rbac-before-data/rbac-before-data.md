---
file: rbac-before-data.md
doc-type: RULE
level: L2
area: A2
position: 1
title: RBAC_BEFORE_DATA
summary: Ningún endpoint del back-office sirve datos sin autorización previa; los
  controladores de módulo declaran sus guardas/políticas.
category: access
scope: EncuestaINTTT analytics backend (analytics/api/src/modules) — controladores.
gate: deterministic/check-rbac-before-data.py
actions: create, audit, fix
---

# RULE — rbac-before-data (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: todo controlador del back-office MUST declarar una guarda de acceso (`@UseGuards(`),
una política (`@Roles(`) o ser explícitamente `@Public(`. — MUST

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=access; SCOPE=analytics/api/src/modules (**/*.controller.ts).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=GUARD_FIRST.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: cada `*.controller.ts` bajo `analytics/api/src/modules` MUST contener
`@UseGuards(` o `@Roles(` o `@Public(`. — MUST

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-rbac-before-data.py`; `--action=audit` falla si un
controlador de módulo no declara guarda/política/public.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 (o no existen controladores de módulo aún).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
