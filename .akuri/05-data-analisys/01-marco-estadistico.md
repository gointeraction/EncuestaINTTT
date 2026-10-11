---
file: 01-marco-estadistico.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: MARCO_ESTADISTICO
summary: Marco conceptual de la presentación estadística — las tres clases de pregunta
  (filtro, sustantiva, estructural), la regla de aislamiento de los filtros, el catálogo
  de dimensiones con su tratamiento (bandas de edad, jerarquía estado→municipio) y las
  reglas de rigor (base aplicable, celdas pequeñas, multirrespuesta).
category: 05-data-analisys
scope: the 05-data-analisys specification set
---

# Marco estadístico (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: este documento declara qué significa «presentar los resultados como
estadísticas» en EncuestaINTTT y, sobre todo, separa las preguntas que describen al
encuestado (FILTROS) de las que miden lo que declara (MEDIDAS). Es el contrato conceptual
del conjunto 05-data-analisys.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=POSTGRESQL (origen) · TECH=NESTJS (read models) · TECH=ANGULAR (consola)
· TECH=ADL (sketch).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CQRS; ARCH_PATTERN=READ_MODEL.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=HECHO_POR_DIMENSION.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-PROBLEMA

WRITE INFO: el cuestionario es ADAPTATIVO: cada pregunta declara `appliesTo` (a qué tipo de
conductor aplica) y algunas un `showIf` (dependen de una respuesta previa). Presentar un
porcentaje sobre el total cuando la pregunta solo aplica a un subconjunto es el error más
grave posible. Además, los datos de identificación del encuestado (edad, sexo, ubicación)
NO son «resultados»: son los EJES con los que se leen los resultados.

WRITE RULE: toda cifra publicada MUST declarar su base (el `n` del subconjunto que aplica). — MUST

### SECTION 02-TRES-CLASES

WRITE INFO: cada pregunta del cuestionario recibe exactamente UNA clase:

| Clase | Definición | Preguntas (survey-data.ts) |
|-------|-----------|----------------------------|
| **FILTRO** (dimensión) | Describe QUIÉN es el encuestado; estable, baja cardinalidad, independiente de otras respuestas | `edad`, `sexo`, `ubicacion`, `nivel_educativo`, `ocupacion` |
| **ESTRUCTURAL** (no es pregunta) | Define la forma del cuestionario y es eje de primera clase | `driverType` (6 tipos, se guarda en la respuesta) |
| **SUSTANTIVA** (medida) | Mide QUÉ hace, usa, piensa o propone el encuestado | experiencia, uso, equipamiento, comportamiento, siniestros, percepción, infraestructura, normativas, propuestas |

WRITE RULE: una pregunta MUST NOT ser a la vez filtro y medida. — MUST

### SECTION 03-REGLA-DE-AISLAMIENTO

WRITE INFO: el aislamiento significa TRATAMIENTO, no borrado: las preguntas de filtro
siguen en el cuestionario de captura (que no se toca), pero en la presentación se extraen a
una capa de SEGMENTACIÓN y nunca se muestran como si fueran hallazgos.

WRITE RULE: los filtros MUST moverse a la capa de segmentación; las medidas MUST moverse a
la capa de resultados. — MUST

WRITE RULE: el cuestionario de captura MUST permanecer intacto; el aislamiento ocurre en la
presentación, no en la captura. — MUST

### SECTION 04-CATALOGO-DE-FILTROS

WRITE INFO: cada filtro se normaliza antes de segmentar; el valor crudo se conserva solo
para media/mediana cuando el tipo es numérico.

| Pregunta | Tipo origen | Dimensión analítica | Tratamiento | Composición visual |
|----------|-------------|---------------------|-------------|--------------------|
| `edad` | number (14–90) | `banda_edad` | bandas 14-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+ | histograma + barra de bandas |
| `sexo` | radio (3) | `sexo` | nominal tal cual | dona o barras |
| `ubicacion` | estado-municipio | `estado` + `municipio` (jerárquico) | dos dimensiones; municipio solo tras elegir estado | barras rankeadas + mapa |
| `nivel_educativo` | select (8) | `nivel_educativo` | ordinal (respetar el orden, no alfabético) | barras ordenadas |
| `ocupacion` | text | — (no es filtro) | texto libre: NO segmentar sin normalizar | — |
| `driverType` | estructural (6) | `tipo_conductor` | nominal; además gobierna `appliesTo` | dona o barras |

WRITE RULE: `ubicacion` MUST separarse en dos dimensiones (`estado`, `municipio`); el
municipio MUST NOT agregarse sin su estado. — MUST

### SECTION 05-RIGOR-ESTADISTICO

WRITE INFO: reglas que toda cifra presentada debe cumplir:

WRITE RULE: el porcentaje MUST calcularse sobre la BASE APLICABLE (quienes responden esa
pregunta según `appliesTo`/`showIf`), nunca sobre el total de la encuesta. — MUST

WRITE RULE: las preguntas de opción múltiple (`checkbox`) MUST reportarse como % de selección
sobre la base; es correcto que sumen más de 100 %. — MUST

WRITE RULE: las celdas con `n < 30` MUST suprimirse y marcarse como «n<30» (privacidad y
ruido). — MUST

WRITE RULE: los promedios MUST NOT mezclar subconjuntos con bases distintas. — MUST

WRITE RULE: toda cifra MUST mostrar su `n`. — MUST

### SECTION 06-ALCANCE

WRITE INFO: quedan fuera de este conjunto la identidad, el sorteo y la exportación con
enmascaramiento, que tienen sus propios transversales. Aquí se declara únicamente la
PRESENTACIÓN estadística de los resultados.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando cada pregunta del cuestionario tiene una clase
declarada y todo filtro tiene su normalización y su composición visual.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
