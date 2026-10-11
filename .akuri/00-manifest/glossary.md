---
file: glossary.md
doc-type: SPEC
level: L2
area: A2
position: 11
title: GLOSSARY
summary: Lenguaje unificado de EncuestaINTTT. Fija qué es una «encuesta» (el cuestionario),
  qué es un «cuestionario respondido», una «pregunta», una «respuesta», el «tipo de
  conductor», el «canal» y una «entrevista válida», para que la UI, el código y los docs
  usen los mismos términos.
category: 00-manifest
scope: the 00-manifest specification
---

# Glosario (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: unifica el vocabulario del sistema. Evita ambigüedades (p.ej. llamar «respuestas»
a los cuestionarios completos).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: NONE here.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH (un término, un significado).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-TERMINOS

WRITE INFO: **Encuesta** (RAE/Wikipedia): técnica de investigación que utiliza un **cuestionario
estandarizado** para recopilar datos, opiniones, hábitos o comportamientos de una **muestra
representativa**. En el sistema, la encuesta es el ESTUDIO (p.ej. la encuesta *Visión Cero*), y el
**cuestionario** es su INSTRUMENTO (el conjunto de preguntas).

WRITE INFO: vocabulario canónico:

| Término | Significado | NO usar |
|---------|-------------|---------|
| **Encuesta** | La **técnica/estudio** que usa un cuestionario estandarizado (p.ej. la encuesta *Visión Cero*). | — |
| **Cuestionario** | El **instrumento** estandarizado: el conjunto de preguntas (abiertas o cerradas). | — |
| **Cuestionario respondido** (respuesta) | **Una instancia** del cuestionario llenada por un sujeto; es lo cuantificable. Las "180" son cuestionarios respondidos. | «respuesta» para el estudio/cuestionario entero |
| **Muestra** | Subgrupo representativo de la población. | — |
| **Pregunta** | Cada ítem (abierta = texto; cerrada = opción única/múltiple/escala). | — |
| **Respuesta** | El **valor de UNA pregunta** (p.ej. `edad = 52`). | usarlo para el cuestionario completo |
| **Tipo de conductor** | Perfil (`driverType`) que determina qué preguntas aplican (`appliesTo`/`showIf`). | — |
| **Segmento** | Agrupación por tipo de conductor. | — |
| **Canal / modalidad** | Medio de aplicación: `public` (en línea, CAWI), `kiosk` y `surveyor` (presencial, dispositivos móviles). | — |
| **Participante del sorteo** | Sujeto que opta al sorteo (identificado por cédula única). | — |
| **Entrevista válida** | Cuestionario COMPLETO + pasa validación + no duplicado. | — |
| **Sumarización** | Cálculo de los read models de la analítica a partir de la captura (los datos cuantificados). | — |

WRITE RULE: en la UI, los KPI y los docs MUST nombrar el instrumento («encuesta Visión Cero») y
usar «**Cuestionarios**» para las instancias; «respuesta» se reserva para el valor de UNA
pregunta. — MUST

### SECTION 02-APLICACION

WRITE INFO: aplicado en: título del Panel global («Panel global · Encuesta Visión Cero»), KPI
«Cuestionarios», la página «Datos de prueba» («Cuestionarios (Visión Cero)») y los logs del
seeder. La modalidad se registra en la columna `channel` de `legacy_survey_responses`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando la UI/código/docs respetan la tabla de §01.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
