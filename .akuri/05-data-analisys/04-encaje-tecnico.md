---
file: 04-encaje-tecnico.md
doc-type: SPEC
level: L2
area: A2
position: 4
title: ENCAJE_TECNICO
summary: Dónde vive cada pieza de la presentación estadística — read model segmentado,
  rutas de la capa servidor, barra de filtros de la consola — qué ya existe, qué falta,
  la discrepancia de claves de `ubicacion` y el plan por fases.
category: 05-data-analisys
scope: the 05-data-analisys specification set
---

# Encaje técnico (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: declara DÓNDE vive cada pieza de la presentación (read models, rutas, consola) y
qué falta por construir. Es el puente entre el marco (01), el camino (02) y el catálogo
visual (03) con la realidad de A3.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=POSTGRESQL · TECH=NESTJS (back-office `analytics/api`) · TECH=ANGULAR
(consola `analytics/console`) · TECH=ORVAL (api-sdk).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CQRS; ARCH_PATTERN=READ_MODEL; ARCH_PATTERN=SCHEMA_PER_OWNER.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=PORT_ADAPTER; DESIGN_PATTERN=API_CONTRACT.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH.

## CHAPTER 3: CONTENT

### SECTION 01-QUE-YA-EXISTE

WRITE INFO: la capa analítica ya aporta piezas reutilizables:

| Pieza existente | Ubicación | Rol |
|-----------------|-----------|-----|
| Desglose univariado por pregunta | `read-model.service.ts` | conteos, escala y comentarios por pregunta |
| Cruce de dos preguntas | `reporting.service.ts` (`crossTab`) | base del bivariado |
| Rutas de panel | `reporting.controller.ts` | panel por encuesta y panel global |
| Componente de gráfico | `console/.../display/chart/` | contenedor de visuales |
| Barra de filtros | `console/.../form/filter-bar/` | control de segmentación en pantalla |
| Tokens de datos | `.../tokens/composites/data-viz.css` | colores y estilos de gráficos |

### SECTION 02-QUE-FALTA

WRITE INFO: falta lo específico de la segmentación:

1. Un catálogo explícito de DIMENSIONES de filtro (con las bandas de edad) derivado de
   `survey-data.ts`.
2. Un read model SEGMENTADO `(pregunta × filtro × categoría)` precalculado por jobs.
3. Generalizar el cruce para que un FILTRO pueda ser la segunda pregunta.
4. Una barra de filtros global en la consola que reescriba el contexto del panel.

### SECTION 03-MODELO-DEL-READ-MODEL

WRITE INFO: el read model segmentado es una tabla de hechos por la dimensión: cada fila es
`(survey_id, question_id, filter_id, filter_value, value, n)`; los porcentajes se derivan de
`n` sobre la base aplicable, nunca se almacenan como verdad. Se recomputa desde `public`.

WRITE RULE: el read model segmentado MUST ser DERIVADO de `public` y recomputable; nunca es
fuente de verdad. — MUST

WRITE RULE: la base aplicable (`appliesTo`/`showIf`) MUST respetarse al calcular cada celda
segmentada. — MUST

### SECTION 04-RUTAS

WRITE INFO: rutas previstas (bajo sesión):

| Ruta | Devuelve |
|------|----------|
| `GET /analytics/surveys/:id/dashboard` | panel de la encuesta (ya existe) |
| `GET /analytics/surveys/:id/dashboard?segment=...` | panel acotado por uno o más filtros |
| `GET /analytics/surveys/:id/cross-tab` | cruce de dos preguntas (ya existe) |
| `GET /analytics/surveys/:id/filters` | catálogo de dimensiones de filtro disponibles |

### SECTION 05-CONSOLA

WRITE INFO: la consola envuelve el panel con la barra de filtros global: al cambiar un
filtro se vuelve a consultar el panel acotado. El estado del filtro vive en la página, no en
los componentes de visual.

### SECTION 06-DISCREPANCIA

WRITE INFO: hay una discrepancia a corregir antes de segmentar: `src/lib/survey-analytics.ts`
lee `answers["estado"]`, pero la pregunta es `ubicacion` (tipo `estado-municipio`) y el
formulario guarda en las claves `estado` y `municipio` (`src/components/survey/survey-form.tsx`).

WRITE RULE: el contrato de claves de `ubicacion` MUST fijarse en `estado` y `municipio`, y
todo lector MUST usar esas claves. — MUST

### SECTION 07-FASES

WRITE INFO: el plan por fases respeta el orden de prioridad del camino de análisis:

| Fase | Alcance | Criterio de paso |
|------|---------|------------------|
| F1 | catálogo de dimensiones de filtro + corregir la clave `ubicacion` | los 5 filtros resuelven con su normalización |
| F2 | read model segmentado para los 4 filtros top | panel acotado por filtro con base aplicable |
| F3 | bivariado genérico pregunta × filtro | cruce con supresión `n<30` |
| F4 | geoespacial (estado → municipio) y verbátims | mapa + temas codificados |
| F5 | índices compuestos | resumen de una cifra por tema |

WRITE RULE: cada fase MUST ser desplegable de forma independiente y no puede degradar la
captura. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando cada pieza declarada tiene su ubicación en A3 y cada
pieza faltante tiene su fase.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
