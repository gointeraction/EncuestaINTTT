---
file: api-sdk-only.md
doc-type: RULE
level: L2
area: A2
position: 1
title: API_SDK_ONLY
summary: La consola Angular accede a los datos SOLO por el api-sdk generado; ninguna
  página usa HttpClient directo ni conoce URLs del back-office.
category: angular
scope: EncuestaINTTT analytics console (analytics/console/src/app/modules).
gate: deterministic/check-api-sdk-only.py
actions: create, audit, fix
---

# RULE — api-sdk-only (EncuestaINTTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE RULE: las páginas de la consola MUST NOT usar `HttpClient` directamente; consumen el
`api-sdk`. — MUST NOT

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: CATEGORY=angular; SCOPE=analytics/console/src/app/modules.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=API_SDK_ONLY.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE-RULE

### SECTION 01-THE-INVARIANT

WRITE RULE: ningún archivo bajo `analytics/console/src/app/modules` MUST importar/instanciar
`HttpClient` (`HttpClient`, `http.get(`, `http.post(`). — MUST NOT

### SECTION 02-THE-GATE

WRITE INFO: gate `deterministic/check-api-sdk-only.py`; `--action=audit` falla si una página usa
`HttpClient`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la regla se cumple cuando el gate retorna exit 0 (o no existen páginas aún).

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
