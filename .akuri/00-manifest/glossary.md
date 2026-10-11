---
file: glossary.md
doc-type: SPEC
level: L2
area: A2
position: 11
title: GLOSSARY
summary: Lenguaje unificado. Distingue con claridad el MÉTODO (encuesta), el INSTRUMENTO
  (cuestionario), los REACTIVOS y DATOS (preguntas y respuestas) y el ANÁLISIS (procesamiento
  cuantitativo/cualitativo), y lo mapea al sistema (Visión Cero).
category: 00-manifest
scope: the 00-manifest specification
---

# Glosario (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: unifica el vocabulario del sistema distinguiendo método, instrumento, contenido y
proceso, para que la UI, el código y los docs usen los mismos términos sin ambigüedad.

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

### SECTION 01-CAPAS

WRITE INFO: cuatro capas, de lo general a lo particular:

1. **Encuesta — el MÉTODO/PROCESO.** Método de investigación completo (diseño, recopilación,
   análisis e interpretación). NO es un objeto físico: es la estrategia global para obtener
   información.
2. **Cuestionario — el INSTRUMENTO.** El documento/soporte (físico o digital) estructurado que
   contiene la serie de preguntas. Es la herramienta tangible que se aplica dentro de la encuesta.
3. **Preguntas y Respuestas — los REACTIVOS y los DATOS.** Las **preguntas (ítems)** son los
   estímulos al participante; las **respuestas** son los datos primarios/valores que aporta.
4. **Análisis — el PROCESAMIENTO.** Tratamiento e interpretación de la información
   (**cuantitativo** o **cualitativo**).

### SECTION 02-TERMINOS

WRITE INFO: vocabulario canónico:

| Término | Capa | Significado | NO usar |
|---------|------|-------------|---------|
| **Encuesta** | método | El método/estudio que usa un cuestionario (p.ej. la encuesta *Visión Cero*). | para el documento de preguntas |
| **Cuestionario** | instrumento | El documento estructurado con la serie de preguntas (el instrumento). | «encuesta» |
| **Cuestionario respondido** | instrumento + datos | Una instancia completa del cuestionario (el conjunto de respuestas de un sujeto). | — |
| **Pregunta** (ítem/reactivo) | contenido | Cada formulación dirigida al participante. Cerradas (opción fija) · Abiertas (texto libre) · Mixtas (opción + «otros»). | — |
| **Respuesta** | datos | El valor primario de UNA pregunta aportado por el sujeto. | para el cuestionario entero |
| **Muestra** | método | Subgrupo representativo de la población. | — |
| **Tipo de conductor** | contenido | Perfil (`driverType`) que determina qué preguntas aplican (`appliesTo`/`showIf`). | — |
| **Segmento** | análisis | Agrupación por tipo de conductor. | — |
| **Canal / modalidad** | método | Medio de aplicación: `public` (en línea, CAWI); `kiosk`/`surveyor` (presencial, dispositivos móviles). | — |
| **Análisis cuantitativo** | análisis | Estadístico (frecuencias, porcentajes, correlaciones) de las preguntas cerradas. | — |
| **Análisis cualitativo** | análisis | Interpretativo/de contenido de las preguntas abiertas. | — |
| **Entrevista válida** | método | Cuestionario COMPLETO + pasa validación + no duplicado. | — |
| **Sumarización** | análisis | Cálculo de los read models (los datos cuantificados) a partir de la captura. | — |

### SECTION 03-RELACION

WRITE INFO: relación correcta (frase canónica):

> «Se aplica una **encuesta** (método) utilizando un **cuestionario** (instrumento) compuesto por
> **preguntas** (reactivos) que los participantes contestan con **respuestas** (datos), los cuales
> se someten finalmente a un **análisis** (procesamiento cuantitativo o cualitativo).»

### SECTION 04-MAPEO-AL-SISTEMA

WRITE INFO: mapeo en Visión Cero:

| Capa | En el sistema |
|------|---------------|
| Encuesta (método) | El estudio *Visión Cero* (canales public/kiosk/surveyor). |
| Cuestionario (instrumento) | `src/lib/survey-data.ts` (los 6 perfiles; 22–51 preguntas por perfil). |
| Preguntas (reactivos) | cerradas → `radio`/`select`/`checkbox`/`scale`; abiertas → `text`/`textarea`; mixtas → opción + «otros». |
| Respuestas (datos) | el JSON `answers` de cada fila de `legacy_survey_responses`. |
| Cuestionario respondido | una fila de `legacy_survey_responses`. |
| Análisis (procesamiento) | `analytics` (read models) + los paneles de la consola. |

### SECTION 05-APLICACION

WRITE INFO: aplicado en: título del Panel global («Panel global · Encuesta Visión Cero»), KPI
«**Cuestionarios**», la página «Datos de prueba» («Cuestionarios (Visión Cero)») y los logs del
seeder. La modalidad se registra en la columna `channel`.

WRITE RULE: en la UI, los KPI y los docs MUST nombrar el método («Encuesta Visión Cero») y usar
«**Cuestionarios**» para las instancias; «respuesta» se reserva para el valor de UNA pregunta. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando la UI/código/docs respetan las capas y la tabla de §02.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
