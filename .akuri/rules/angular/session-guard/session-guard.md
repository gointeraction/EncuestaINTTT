---
file: session-guard.md
doc-type: RULE
level: L2
area: A2
position: 1
title: SESSION_GUARD
summary: Toda ruta protegida de la consola exige una sesión de staff autenticada
  (guard); el acceso anónimo solo aplica al login.
category: angular
scope: EncuestaINTTT analytics console (analytics/console/src/app) — rutas.
gate: deterministic/check-session-guard.py
actions: create, audit, fix
---

# RULE — session-guard (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: las rutas protegidas de la consola MUST declarar un `canActivate` de sesión; solo el
login es público. — MUST

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=angular; SCOPE=analytics/console/src/app.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=GUARD_FIRST.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: los archivos de rutas protegidas bajo `analytics/console/src/app/modules` MUST
declarar `canActivate` con un guard de sesión. — MUST

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-session-guard.py`; `--action=audit` falla si una ruta
protegida no declara guard.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 (o no existen rutas de módulo aún).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
