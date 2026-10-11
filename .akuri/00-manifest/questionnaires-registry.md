---
file: questionnaires-registry.md
doc-type: SPEC
level: L2
area: A2
position: 12
title: QUESTIONNAIRES_REGISTRY
summary: Normaliza el «cuestionario» como entidad de primera clase para administrar MÚLTIPLES
  cuestionarios, cada uno con su instrumento (frontend/definición), sus reglas, su seed, su
  almacenamiento y su análisis. Fija el modelo de registro y su mapeo; Visión Cero es el
  primero, pero el diseño no la asume única.
category: 00-manifest
scope: the 00-manifest specification
---

# Registro de cuestionarios (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: el sistema debe poder administrar **N cuestionarios**, cada uno con su **instrumento**
(frontend + definición de preguntas), sus **reglas** (validación, condicional, sorteo), su **seed**,
su **almacenamiento** y su **análisis**. Hoy sólo existe Visión Cero; el diseño NO debe asumir que
es única. Ver `glossary.md` (método/instrumento/reactivos/datos/análisis).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS · TECH=ANGULAR · TECH=NEXTJS · TECH=POSTGRESQL.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=REGISTRY (data-driven); ARCH_PATTERN=PLUGGABLE_INSTRUMENT;
ARCH_PATTERN=SERVER_AUTHORITATIVE.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=CONDITIONAL_QUESTIONNAIRE (appliesTo/showIf); DESIGN_PATTERN=ADAPTER
(una fuente por cuestionario).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH.

## CHAPTER 3: CONTENT

### SECTION 01-ENTIDAD

WRITE INFO: un **cuestionario** (registro) declara:

| Campo | Qué es |
|-------|--------|
| `id` | slug único (p.ej. `vision-cero`) |
| `title` | nombre del instrumento |
| `instrument` | origen de la definición de preguntas (código o tabla) |
| `storage` | tabla(s) de captura donde viven las respuestas (cuestionarios respondidos) |
| `segments` | campo + etiquetas de segmentación (p.ej. `driverType`) |
| `rules` | reglas de validación/condición/sorteo |
| `labels` | mapa pregunta-id → etiqueta |
| `seed` | módulo del seeder que emula ESTE cuestionario |
| `analysis` | read models y métricas a construir |
| `channels` | canales admitidos (`public`/`kiosk`/`surveyor`) |

### SECTION 02-MAPEO-ACTUAL-VISION-CERO

WRITE INFO: el primer cuestionario:

| Campo | Visión Cero |
|-------|-------------|
| id | `vision-cero` |
| title | Encuesta Visión Cero — Siniestros de motocicletas |
| instrument | `src/lib/survey-data.ts` (6 perfiles; 22–51 preguntas) |
| storage | `public.legacy_survey_responses` (`answers` JSON, `driverType`, `sorteo`, `channel`) |
| segments | `driverType` (6 tipos) |
| rules | `appliesTo`/`showIf` + validación de sorteo (cédula única) |
| seed | `analytics/seed` (`core/vision-cero.ts`) |
| analysis | `analytics.report_global_dashboard` + `report_survey_summaries` |
| channels | `public`, `kiosk`, `surveyor` |

### SECTION 03-CAMBIOS-A3

WRITE INFO: puntos a normalizar (hoy hardcodeados a Visión Cero):
- **Analítica**: `ReadModelService` y `reporting` deben derivar la fuente/etiquetas/segmentos del
  **registro** (no constantes fijas). El motor SDD (`surveys/questions/responses/answers`) ya es
  multi-cuestionario y sirve como adaptador para cuestionarios nuevos.
- **Seeder**: un módulo por cuestionario (`core/questionnaires/<id>.ts`); el comando elige el
  cuestionario (`--questionnaire`).
- **Captura**: cada cuestionario tiene su **instrumento** (frontend). Visión Cero usa su frontend
  legacy; los nuevos usan el motor SDD (`/api/v1/...`).

WRITE RULE: cada cuestionario MUST declarar su entrada de registro; la analítica, el seeder y las
validaciones MUST derivarse de ese registro, no de constantes de un caso particular. — MUST

### SECTION 04-FASES

WRITE INFO:
- **Ahora (Visión Cero)**: registro con una sola entrada; el código se hace **registry-driven**
  sin cambiar el comportamiento.
- **Futuro**: activar el registro en la analítica (una entrada → un read model por cuestionario) y
  el motor SDD para instrumentos nuevos; el seeder agrega módulos por cuestionario.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: válido cuando agregar un cuestionario nuevo = agregar una entrada de registro + su
instrumento + su módulo de seed, sin tocar los existentes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
