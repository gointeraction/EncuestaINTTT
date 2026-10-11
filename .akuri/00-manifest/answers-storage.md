---
file: answers-storage.md
doc-type: SPEC
level: L2
area: A2
position: 13
title: ANSWERS_STORAGE
summary: Estrategia de almacenamiento de respuestas. Se captura el CUESTIONARIO RESPONDIDO
  COMPLETO como un documento JSON (una fila por cuestionario, `answers` keyed por pregunta-id)
  para procesarlo pregunta por pregunta y analizarlo. Fija el contrato del documento, cómo se
  analiza, cómo se lidia con varios cuestionarios y cuándo conviene normalizar.
category: 00-manifest
scope: the 00-manifest specification
---

# Almacenamiento de respuestas (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: fija cómo se guardan las respuestas y por qué: **se captura el cuestionario
respondido COMPLETO como un documento JSON** (una fila = un cuestionario respondido), con las
respuestas **indexadas por pregunta-id**, para poder **procesarlo pregunta por pregunta** y
analizarlo después. Ver `glossary.md` (instrumento/reactivos/datos/análisis) y
`questionnaires-registry.md`.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=POSTGRESQL · TECH=PRISMA · TECH=NESTJS.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=DOCUMENT_STORE (JSON por fila); ARCH_PATTERN=READ_MODEL
(agregados materializados).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=SINGLE_SOURCE_OF_TRUTH (el documento es la evidencia primaria).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-ESTRATEGIA

WRITE INFO: **JSON documental por cuestionario respondido.** Una fila contiene el cuestionario
COMPLETO. La analítica agrega pregunta por pregunta a partir del documento.

WRITE INFO: **Por qué** (frente a «una columna por pregunta» o EAV):
- La forma de las respuestas VARÍA por perfil (`appliesTo`/`showIf`) y por cuestionario → una
  columna por pregunta obligaría a migrar el esquema por cada cambio (rígido).
- Captura simple: escribir UNA fila (transacción mínima).
- El documento es la **evidencia primaria** íntegra; el análisis se hace en **read models**
  materializados (una vez), no por consulta.

### SECTION 02-CONTRATO-DEL-DOCUMENTO

WRITE INFO: el documento `answers` es un **mapa plano `pregunta-id → valor`**:
- valor cerrado (única/select) → `string`; múltiple → `string[]`; escala/número → `number`;
  abierto → `string`. Compuestos (`estado-municipio`) → varias claves (`estado`, `municipio`).
- El **envelope** va en columnas (no en el JSON): `driverType`, `channel`, **`completedAt`
  (recepción del servidor, `now()` al insertar)** y **`capturedAt` (captura del dispositivo,
  nullable; igual a `completedAt` cuando es online, distinto en offline)**, `participaSorteo`
  (+ sorteo) y, para multi-cuestionario/offline, `questionnaire` y `answersVersion`.

WRITE RULE: el documento MUST contener TODAS las preguntas aplicables al perfil (cuestionario
COMPLETO); incompletos no se persisten. — MUST

WRITE RULE: las claves MUST ser los **ids estables** de la definición del instrumento. — MUST

### SECTION 03-ANALISIS-POR-PREGUNTA

WRITE INFO: la sumarización recorre el documento y agrega **pregunta por pregunta**:
categóricas → conteo de valores; múltiples → conteo por opción; escalas/números → distribución y
promedio; abiertas → muestra. La tabla cruzada combina DOS claves del mismo documento. Los
resultados se materializan en `analytics.report_global_dashboard` y
`analytics.report_survey_summaries`.

### SECTION 04-MULTI-CUESTIONARIO

WRITE INFO: el **registro** (`questionnaires-registry.md`) declara, por cuestionario, su
`source`:
- **Documento JSON**: `{ table, answersField, segmentsField, channelField, sorteoField }` (Visión
  Cero).
- **Normalizado (SDD)**: `response/answer` con `survey_id` (motor genérico).

WRITE INFO: agregar un cuestionario = agregar una entrada de `source`; la analítica adapta el
lector. Opciones: (a) **una tabla por cuestionario** (lo actual) o (b) **una tabla compartida con
la columna `questionnaire`** (tag de instrumento). Elegir (b) cuando convivan varios en la misma
tabla.

### SECTION 05-CRITERIO-DE-NORMALIZACION

WRITE INFO: se mantiene **JSON + read models** mientras basta el análisis materializado. Se
migra a **normalizado (SDD)** cuando se cumplan AMBAS: (1) existe un **segundo cuestionario** que
lo justifica, y (2) hay necesidad de **consultas ad-hoc por pregunta** con filtros/índices que el
JSON no cubra cómodamente. Hasta entonces, JSON + registro.

### SECTION 06-ROBUSTECIMIENTO

WRITE INFO: reglas que endurecen la estrategia:
1. **Completitud**: sólo se persiste el cuestionario completo (ver §02).
2. **Contrato estable**: claves = ids de la definición; versionado con `answersVersion`.
3. **Índice**: índice **GIN** sobre `answers::jsonb` → consultas por pregunta eficientes.
4. **Validación server-side** (F1): validar el documento contra la definición del instrumento.
5. **Acotado**: límite de tamaño del cuerpo/`answers`.
6. **Idempotencia/anti-fraude** y **canal**: ver `capture-offline-and-integrity.md`.

WRITE RULE: las columnas-envelope (driverType/channel/completedAt/sorteo) MUST ir separadas del
JSON para poder filtrar por canal y segmento sin parsear. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la estrategia es válida cuando (a) cada cuestionario respondido es un documento
completo e íntegro, (b) el análisis se obtiene pregunta por pregunta desde el registro, y (c) el
índice GIN existe sobre `answers::jsonb`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
