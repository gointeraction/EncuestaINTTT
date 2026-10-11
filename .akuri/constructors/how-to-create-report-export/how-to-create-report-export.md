---
file: how-to-create-report-export.md
doc-type: HOW_TO
level: L4
area: A2
position: 1
title: HOW_TO_CREATE_REPORT_EXPORT
summary: Construye la exportación CSV de una encuesta (RFC 4180 + BOM) con
  enmascaramiento de PII decidido por rol en el servidor y registro de la exportación.
---

# HOW_TO_CREATE_REPORT_EXPORT

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: construir UN artefacto: el serializador CSV de una encuesta, con máscara de PII
server-side por rol.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS · TECH=PRISMA.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=API_CONTRACT.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=SERVER_SIDE_GUARANTEE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-FORM-FIELDS

WRITE INFO: entradas: `surveyId`, `rol` (para decidir la máscara). Salida: un CSV
(`text/csv`, `Content-Disposition: attachment`).

### SECTION 02-CONSTRUCT

WRITE INFO: pasos: leer preguntas/respuestas/answers de `public` (solo lectura) → construir el
CSV (columnas por pregunta, BOM, CRLF, comillas escapadas) → aplicar `maskPii(` a la columna de
participante si el rol no es `admin` → registrar en `survey_exports`.

### SECTION 03-CHECKPOINT

WRITE INFO: checkpoint determinista: el artefacto cierra cuando contiene la llamada de máscara
(`maskPii(`) y el gate de la regla `pii-masking-server-side` pasa (ver
`../../rules/access/pii-masking-server-side`).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el artefacto se cierra cuando su gate determinista pasa.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
