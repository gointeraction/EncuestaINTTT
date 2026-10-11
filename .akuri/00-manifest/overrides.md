---
file: overrides.md
doc-type: OVERRIDES
level: L2
area: A2
position: 6
title: OVERRIDES
summary: Overrides de primera clase del proyecto EncuestaINTTT sobre normas estrictas
  de A1. Cada override declara la norma, el nuevo valor, el alcance y su justificación.
  O-1 idioma (español en lugar de inglés); O-2 (reservado).
---

# Overrides — EncuestaINTTT (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: registra cada excepción de primera clase a una norma estricta de A1 (la norma
general sigue vigente fuera del alcance declarado). Un override no debilita la norma base
globalmente: la dirige dentro de su scope.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: NONE here.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: THE OVERRIDES

### SECTION 01-O-1-IDIOMA

WRITE RULE: en TODO el proyecto EncuestaINTTT (documentación, comentarios y textos de
interfaz) se usa **español** en lugar de inglés. — OVERRIDE

WRITE INFO: norma dirigida — A1 `01-principles/02-methodology.md` (SECTION 07) y su directiva
`04-directives/language.md`: "everything in English: code, comments, and docs; bilingual only
as `en: | es:`". Se DIRIGE dentro del alcance del proyecto.

WRITE INFO: alcance y matices:
  - Documentación (`.akuri/**`), comentarios de código y textos de UI: **español**.
  - Identificadores de código (clases, funciones, variables), nombres de archivos de la
    industria y APIs de librerías: **se mantienen en inglés** (no se traduce el léxico técnico
    ni se rompen convenciones de los frameworks).
  - Justificación: el cliente (INTT, Venezuela) es monolingüe hispanohablante y el equipo y los
    operadores trabajan en español; el riesgo de interpretación errónea supera el beneficio de
    la uniformidad en inglés. Lo refuerza `01-tech-stack` e `i18n: es-only` en las reglas locales.

### SECTION 02-O-2-RESERVADO

WRITE INFO: sin override activo; se reserva para futuras excepciones (p. ej. auth federada).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: un override es válido cuando declara norma, valor, alcance y justificación, y no
contradice ninguna norma fuera de su alcance.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
