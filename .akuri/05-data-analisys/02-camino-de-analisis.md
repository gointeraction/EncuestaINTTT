---
file: 02-camino-de-analisis.md
doc-type: SPEC
level: L2
area: A2
position: 2
title: CAMINO_DE_ANALISIS
summary: Camino por capas para leer los resultados — ficha técnica, universo y
  segmentación, univariado por pregunta, bivariado pregunta×filtro, geoespacial,
  verbátims e índices compuestos — con su orden de prioridad.
category: 05-data-analisys
scope: the 05-data-analisys specification set
---

# Camino de análisis (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: declara el ORDEN con que se recorre la presentación: primero el retrato del
universo, luego cada pregunta, luego los cruces con los filtros. Es el «mejor camino» para
convertir respuestas en hallazgos accionables.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=POSTGRESQL · TECH=NESTJS (read models) · TECH=ANGULAR (consola).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CQRS; ARCH_PATTERN=READ_MODEL.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=HECHO_POR_DIMENSION.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=DATA_INK_RATIO; VISUAL_PATTERN=EVERY_GRAPH_SHOWS_N.

## CHAPTER 3: CONTENT

### SECTION 01-CAPAS

WRITE INFO: el camino tiene siete capas; el orden es una prioridad, no una obligación:

| Capa | Qué responde | Salida |
|------|--------------|--------|
| L0 Ficha técnica | ¿Cuán sólida es la muestra? | n total, n válidos, % finalización, % abandono, periodo |
| L1 Universo | ¿Quién respondió? | composición de cada filtro |
| L2 Univariado | ¿Qué dice cada pregunta? | un visual por pregunta (ver `03-catalogo-visual.md`) |
| L3 Bivariado | ¿Qué segmento está peor? | pregunta sustantiva × filtro |
| L4 Geoespacial | ¿Dónde ocurre? | estado → municipio |
| L5 Verbátims | ¿Qué dicen en sus palabras? | temas codificados + citas |
| L6 Índices | ¿Cuál es el resumen compuesto? | índices de riesgo, equipo y percepción |

### SECTION 02-L0-FICHA-TECNICA

WRITE INFO: abre la presentación; sin base muestral las cifras no son interpretables.
Contiene n total de respuestas, n válidos, tasa de finalización, tasa de abandono, periodo
de recolección y origen del dato.

### SECTION 03-L1-UNIVERSO

WRITE INFO: retrata QUIÉN respondió con la composición de cada filtro: bandas de edad,
sexo, estado (y municipio al desplegar), nivel educativo y tipo de conductor. Es la capa
que da contexto a todo lo demás.

### SECTION 04-L2-UNIVARIADO

WRITE INFO: presenta cada pregunta sustantiva con el visual de su tipo (ver
`03-catalogo-visual.md`): opción única, opción múltiple, escala 1-5, numérica, texto o
geográfica.

### SECTION 05-L3-BIVARIADO

WRITE INFO: es el corazón del análisis. Se cruza cada pregunta sustantiva clave contra los
filtros de segmentación; el resultado responde «qué segmento está peor». Formato sugerido:
`pregunta × filtro` como barras agrupadas cuando el filtro es ordinal, y como barras apiladas
al 100 % cuando se comparan proporciones entre categorías.

WRITE RULE: el cruce MUST usar como denominador de cada celda la base aplicable de esa
pregunta dentro de esa categoría del filtro. — MUST

WRITE RULE: un cruce MUST ocultar las celdas con `n < 30`. — MUST

### SECTION 06-L4-GEOESPACIAL

WRITE INFO: despliega `estado` en barras rankeadas y, opcionalmente, en mapa coroplético;
el `municipio` se muestra solo dentro del estado elegido, nunca agregado entre estados.

### SECTION 07-L5-VERBATIMS

WRITE INFO: presenta las respuestas abiertas como temas codificados (una barra de
frecuencia de temas) más una lista navegable de citas. La nube de palabras NO es el visual
principal.

### SECTION 08-L6-INDICES

WRITE INFO: opcional. Agrupa preguntas afines en índices compuestos (comportamiento de
riesgo, equipamiento de protección, percepción de seguridad) para un resumen de una cifra;
solo se construye cuando el análisis por pregunta ya está consolidado.

### SECTION 09-PRIORIDAD

WRITE INFO: el mínimo viable es L0 + L1 + L3 sobre los filtros top (`banda_edad`, `sexo`,
`estado`, `tipo_conductor`). L2 y L4-L6 se añaden por fases.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando cada capa tiene su salida declarada y el cruce
bivariado respeta la base aplicable.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
