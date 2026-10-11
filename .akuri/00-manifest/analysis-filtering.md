---
file: analysis-filtering.md
doc-type: SPEC
level: L2
area: A2
position: 14
title: ANALYSIS_FILTERING
summary: Cómo se procesa el análisis cuando se FILTRA el resultado por dimensiones (sexo, edad,
  estado, tipo de conductor, canal, etc.). Define el modelo de filtros (envelope / respuesta /
  derivada), el pipeline (acotar → agregar por pregunta) y cómo se aplica sobre el documento
  JSON de Visión Cero, derivado del registro de cuestionarios.
category: 00-manifest
scope: the 00-manifest specification
---

# Filtrado del análisis (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: fija cómo se **procesa el análisis cuando se filtra** el conjunto de cuestionarios
respondidos por una o más dimensiones (sexo, edad, estado, tipo de conductor, canal, …), para
que los paneles y el API segmenten de forma uniforme. Ver `answers-storage.md` y
`questionnaires-registry.md`.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=POSTGRESQL · TECH=NESTJS.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=READ_MODEL (agregado materializado) + ARCH_PATTERN=AD_HOC_QUERY
(filtrado en vivo).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REGISTRY (dimensiones por cuestionario); DESIGN_PATTERN=SNAKE_CASE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH.

## CHAPTER 3: CONTENT

### SECTION 01-MODELO-DE-FILTROS

WRITE INFO: un **filtro** = `(dimension, value)`. Varias dimensiones se combinan con **AND**.
Tipos de dimensión:

| Tipo | Ejemplos | Cómo se resuelve |
|------|----------|------------------|
| **Envelope** (columna) | `driverType` (tipo de conductor), `channel` (canal) | `"<columna>" = value` |
| **Respuesta** (clave del JSON) | `sexo`, `estado`, `casco_usa`, `licencia` | `answers::jsonb ->> '<key>' = value` (o `-> '<key>' ? value` para múltiple) |
| **Derivada** | `edad` por grupos (14-24, 25-34, 35-44, 45-54, 55+) | rango sobre `(answers::jsonb ->> 'edad')::int` |

WRITE INFO: las dimensiones disponibles las declara el **registro** del cuestionario
(segmentos/canales + etiquetas de preguntas categóricas), no un caso particular.

### SECTION 02-PIPELINE

WRITE INFO: el análisis filtrado es **acotar → agregar**:

1. **Acotar**: construir el `WHERE` a partir de los filtros (envelope → columna; respuesta →
   clave JSON; derivada → rango). El **índice GIN** (`answers::jsonb`) sirve a los filtros por
   respuesta.
2. **Agregar**: recalcular **pregunta por pregunta** sobre el subconjunto acotado (categóricas →
   conteo; múltiples → conteo por opción; escalas/números → distribución y promedio; abiertas →
   muestra). Igual que la sumarización, pero sobre el subconjunto.

WRITE INFO: `driverType`/`channel` son **columnas** (no JSON) → filtrar por ellos NO requiere
parsear el documento.

### SECTION 03-DOS-MODOS

WRITE INFO:
- **Agregado materializado** (sin filtros): se calcula una vez en `summarize` y se sirve desde
  `analytics.report_survey_summaries` / `report_global_dashboard`.
- **Filtrado en vivo** (con filtros): se recalcula al vuelo sobre el documento (solo SELECT).
  Es lo que devuelve `GET /analytics/surveys/:id/dashboard?dimension=…&value=…`.

WRITE RULE: el filtrado MUST ser solo-lectura (SELECT) y NO escribir en la captura. — MUST

### SECTION 04-API

WRITE INFO: contrato de lectura del panel:
- `GET /analytics/surveys/:id/dashboard` → resumen materializado (global del cuestionario).
- `GET /analytics/surveys/:id/dashboard?dimension=<d>&value=<v>` → resumen **filtrado**.
- `GET /analytics/surveys/:id/dimensions` → dimensiones disponibles y sus valores.
- `GET /analytics/surveys/:id/timeline` → respondidos por día.
- `GET /analytics/surveys/:id/cross-tab?q1=&q2=` → tabla cruzada entre dos preguntas.

### SECTION 05-MULTI-CUESTIONARIO

WRITE INFO: el `WHERE` y las dimensiones se derivan del **registro** (`source.table`,
`answersField`, `segmentsField`, `channelField`, `labels`). Para un cuestionario normalizado
(SDD), el adaptador usa `answers`/`responses`; para el documental (Visión Cero), usa el JSON.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: válido cuando un filtro por sexo/edad/estado/tipo de conductor/canal devuelve el
desglose por pregunta del subconjunto correcto, en vivo y solo-lectura.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
