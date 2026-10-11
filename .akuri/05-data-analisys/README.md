---
file: README.md
doc-type: README
level: L2
area: A2
position: 0
title: PRESENTACION_ESTADISTICA
summary: Conjunto 05-data-analisys — declara CÓMO se presentan los resultados de
  EncuestaINTTT en forma de estadísticas; aísla las preguntas de filtro, fija el camino
  de análisis, el catálogo visual por tipo de pregunta y su encaje en la capa analítica.
  A2 declara; A3 construye.
---

# EncuestaINTTT — Presentación estadística de resultados (05-data-analisys)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: este conjunto declara, de forma formal, QUÉ se desea presentar de la encuesta
(los resultados como estadísticas) y CÓMO (qué preguntas son ejes de filtro, por qué camino
se analizan y con qué visual se muestra cada tipo de pregunta). Separa la naturaleza
PRESENTACIÓN (analítica) de la naturaleza CAPTURA (el cuestionario), sin tocar esta última.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.
  - INFORM: leer para conocer el modelo de filtros y el catálogo visual.
  - CONSTRUCT: seguir el camino de análisis (02) y el encaje técnico (04).
  - AUDIT: verificar que ninguna pregunta se trata a la vez como filtro y como medida.
  - FIX: ante un desacuerdo, corregir la declaración (A2), no la realidad (A3).

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=POSTGRESQL 16 (origen de los datos, esquema `public`) · TECH=NESTJS
(read models, esquema `analytics`) · TECH=ANGULAR (consola de análisis) · TECH=ADL
(sketch visual).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CQRS · ARCH_PATTERN=READ_MODEL · ARCH_PATTERN=SCHEMA_PER_OWNER
· ARCH_PATTERN=STRANGLER (fases).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=HECHO_POR_DIMENSION (la pregunta sustantiva es la medida; el
filtro es la dimensión de segmentación). DESIGN_PATTERN=PORT_ADAPTER.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=DATA_INK_RATIO;
VISUAL_PATTERN=EVERY_GRAPH_SHOWS_N.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENIDO

WRITE INFO: A2 **declara**; A3 **construye y verifica**. Este conjunto declara el modelo de
presentación y comprueba que la realidad (el cuestionario en
`EncuestaINTTT/src/lib/survey-data.ts` y los read models del back-office) coincide con la
declaración. En discrepancia, se corrige A2 — nunca se dobla A3.

## Instruction set

| # | Documento | Qué declara |
|---|-----------|-------------|
| 01 | `01-marco-estadistico.md` | El marco: clases de pregunta, aislamiento de filtros, catálogo de dimensiones y reglas de rigor |
| 02 | `02-camino-de-analisis.md` | El camino por capas (ficha técnica → universo → univariado → bivariado → geo → verbátims → índices) |
| 03 | `03-catalogo-visual.md` | El visual recomendado por tipo de pregunta y el inventario de las 55 preguntas |
| 04 | `04-encaje-tecnico.md` | Dónde vive cada pieza (read models, rutas, consola) y el plan por fases |

## Qué se desea presentar y cómo (resumen)

WRITE INFO: el objetivo es un panel analítico que (a) retrate QUIÉN respondió usando los
filtros (edad, sexo, estado/municipio, nivel educativo y tipo de conductor) y (b) mida QUÉ
declararon las preguntas sustantivas, siempre con la base aplicable por delante y con el
visual adecuado a cada tipo.

## Deterministic tools

- `deterministic/check.py` — gate del conjunto: frontmatter + estructura + coherencia
  A2↔A3 (las preguntas de filtro declaradas existen en `survey-data.ts`).

## Source of truth (A3)

| Artefacto | Ruta |
|-----------|------|
| Cuestionario y tipos de pregunta | `EncuestaINTTT/src/lib/survey-data.ts` |
| Read models del back-office | `analytics/api/src/modules/analytics/read-model/read-model.service.ts` |
| Reportería y cruces | `analytics/api/src/modules/analytics/reporting/reporting.service.ts` |
| Consola y visuales | `analytics/console/src/app/` |

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el conjunto cierra cuando su gate (`deterministic/check.py`) pasa.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
