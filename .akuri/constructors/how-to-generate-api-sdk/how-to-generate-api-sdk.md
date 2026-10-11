---
file: how-to-generate-api-sdk.md
doc-type: HOW_TO
level: L4
area: A2
position: 3
title: HOW_TO_GENERATE_API_SDK
summary: Construye el api-sdk tipado (cliente Angular) desde el OpenAPI del back-office
  con Orval, dejándolo como única fuente del contrato para la consola.
---

# HOW_TO_GENERATE_API_SDK

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: construir UN artefacto: el cliente api-sdk generado desde el contrato OpenAPI.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=ORVAL · TECH=ANGULAR.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=API_CONTRACT.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REGISTRY (contrato como SSOT).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-FORM-FIELDS

WRITE INFO: entrada: `openapi.json` del back-office. Salida: cliente tipado en
`analytics/console/src/app/shared/api-sdk`.

### SECTION 02-CONSTRUCT

WRITE INFO: pasos: exportar el OpenAPI del API en marcha (`/openapi-json`) → ejecutar
`orval --config ./orval.config.ts` → verificar que la consola compila con el cliente generado.

### SECTION 03-CHECKPOINT

WRITE INFO: checkpoint determinista: cierra cuando el cliente se regenera sin errores y
`analytics/console` compila (`ng build`).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el artefacto se cierra cuando se regenera sin errores y la consola compila.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
