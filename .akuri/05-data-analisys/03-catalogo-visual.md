---
file: 03-catalogo-visual.md
doc-type: SPEC
level: L2
area: A2
position: 3
title: CATALOGO_VISUAL
summary: Visual recomendado por tipo de pregunta (opción única, opción múltiple, escala,
  numérica, texto, geográfica) con sus reglas, más el inventario de las 55 preguntas del
  cuestionario y el visual asignado a cada una.
category: 05-data-analisys
scope: the 05-data-analisys specification set
---

# Catálogo visual (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: declara qué visual corresponde a cada tipo de pregunta para que la presentación
sea consistente y legible. Es el criterio único de decisión visual del conjunto.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=ANGULAR (consola) · TECH=ADL (sketch) · TECH=DATA_VIZ_TOKENS
(`shared/design/tokens/composites/data-viz.css`).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=HECHO_POR_DIMENSION.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=DATA_INK_RATIO; VISUAL_PATTERN=EVERY_GRAPH_SHOWS_N;
VISUAL_PATTERN=ORDERED_WHEN_ORDINAL.

## CHAPTER 3: CONTENT

### SECTION 01-PRINCIPIOS

WRITE INFO: reglas generales que aplican a todos los visuales:

WRITE RULE: cada gráfico MUST mostrar su `n` y sus porcentajes. — MUST

WRITE RULE: las categorías ordinales MUST respetar su orden lógico (no alfabético). — MUST

WRITE RULE: la forma MUST seguir al tipo de dato; MUST NOT forzarse todo a una dona. — MUST

### SECTION 02-POR-TIPO

WRITE INFO: el visual por tipo de pregunta:

| Tipo | Visual recomendado | Evitar |
|------|--------------------|--------|
| `radio`/`select` nominal (≥4 cat) | barras horizontales ordenadas por % | dona con muchas tajadas |
| `radio`/`select` ordinal (p. ej. `licencia`, `casco_usa`) | barras ordenadas por la escala + apilado 100 % | orden alfabético |
| `checkbox` (opción múltiple) | barras de % sobre la base (suman >100 %) + matriz de co-ocurrencia | dona |
| `scale` 1-5 | histograma de distribución + KPI de media y top-2-box | dona |
| `number` continua (`km`, `horas`, `años`) | histograma o caja + media y mediana | barra por valor crudo |
| `estado`/`municipio` | barras rankeadas + mapa coroplético | dona |
| `textarea`/`text` abierta | lista de citas codificadas + barra de temas top | solo nube de palabras |
| tipo de conductor | dona o barras de composición + eje de cruce | — |

### SECTION 03-INVENTARIO-DE-PREGUNTAS

WRITE INFO: las 55 preguntas del cuestionario y su visual asignado (clase entre paréntesis
cuando es filtro o de exclusión):

| id | tipo | visual |
|----|------|--------|
| `edad` | number | histograma + bandas (FILTRO) |
| `sexo` | radio | dona (FILTRO) |
| `ubicacion` | estado-municipio | barras rankeadas + mapa (FILTRO) |
| `ocupacion` | text | excluida del análisis (texto libre) |
| `nivel_educativo` | select | barras ordenadas (FILTRO) |
| `anos_conduciendo` | number | histograma + media y mediana |
| `licencia` | radio | barras ordenadas por estado |
| `categoria_licencia` | select | barras |
| `motivo_no_licencia` | textarea | citas codificadas |
| `frecuencia_conduccion` | radio | barras ordenadas |
| `dejo_conducir_razon` | textarea | citas codificadas |
| `uso_principal` | radio | barras |
| `uso_otro` | text | citas |
| `km_diarios` | number | histograma + mediana |
| `horas_diarias` | number | histograma + mediana |
| `plataforma_delivery` | text | barras tras normalizar |
| `pasajeros_dia` | number | histograma + mediana |
| `conduccion_nocturna` | radio | barras ordenadas |
| `clima_lluvia` | radio | barras |
| `casco_usa` | radio | barras ordenadas + top-2-box |
| `casco_tipo` | select | barras |
| `casco_certificado` | radio | barras |
| `motivo_no_casco` | textarea | citas codificadas |
| `equipamiento_adicional` | checkbox | barras de % (múltiple) |
| `elementos_moto` | checkbox | barras de % (múltiple) |
| `velocidad_opinion` | scale | histograma + media |
| `uso_celular` | radio | barras |
| `alcohol_conduccion` | radio | barras ordenadas |
| `pasajeros_extra` | radio | barras ordenadas |
| `rebases_peatones` | scale | histograma + media |
| `presion_tiempo` | radio | barras ordenadas |
| `fatiga` | radio | barras ordenadas |
| `ha_tenido_siniestro` | radio | barras |
| `siniestro_gravedad` | radio | barras ordenadas por gravedad |
| `siniestro_ano` | number | histograma por año |
| `siniestro_causas` | checkbox | barras de % (múltiple) |
| `siniestro_atencion` | radio | barras |
| `familiar_relacion` | select | barras |
| `familiar_siniestro_tipo` | radio | barras ordenadas |
| `causas_principales` | checkbox | barras de % (múltiple) |
| `medidas_efectivas` | checkbox | barras de % (múltiple) |
| `efectividad_control` | scale | histograma + media |
| `percepcion_seguridad` | scale | histograma + media |
| `estado_vias` | scale | histograma + media |
| `senalizacion` | scale | histograma + media |
| `iluminacion` | radio | barras |
| `problemas_via` | checkbox | barras de % (múltiple) |
| `conoce_limites_velocidad` | radio | barras |
| `conoce_alcoholemia` | radio | barras |
| `conoce_sanciones` | radio | barras |
| `recibio_capacitacion` | radio | barras |
| `propuesta_principal` | textarea | citas codificadas |
| `apoyo_vision_cero` | radio | barras ordenadas |
| `disposicion_participar` | radio | barras |
| `comentario_final` | textarea | citas codificadas |

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando cada tipo de pregunta tiene su visual y cada una de
las 55 preguntas aparece en el inventario con el suyo.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
