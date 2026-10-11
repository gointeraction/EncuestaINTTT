---
file: transversal-panel-encuesta.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 4
title: Panel por encuesta
summary: Panel analítico de una encuesta — indicadores clave y desglose pregunta a
  pregunta (conteos, porcentajes, promedios y comentarios recientes) servidos desde el
  resumen precalculado.
epic: analitica-reporteria
transversal: panel-encuesta
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: panel-encuesta
routes: /analytics/surveys/:id/dashboard
models: SurveyDashboard
---

# Transversal — Panel por encuesta (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como analista, quiero ver el panel de una encuesta concreta con sus indicadores y el detalle por pregunta para entender sus resultados.
- **use-case:** UC-AN-03 (consulta del panel de una encuesta).
- **ux-ui:** panel con tarjetas de indicadores arriba y, debajo, el desglose por pregunta; el estado de frescura queda visible.

## SECTION 02-REGLAS

- **analitica-reporteria.panel-encuesta.R01:** el panel presenta los indicadores clave de la encuesta: total de respuestas, tasa de finalización y tasa de abandono.
- **analitica-reporteria.panel-encuesta.R02:** el desglose por pregunta muestra conteos y porcentajes en las de opción, promedio y distribución en las de escala, y los comentarios recientes en las de texto.
- **analitica-reporteria.panel-encuesta.R03:** el panel es de solo lectura y se sirve desde el resumen precalculado.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveyDashboard` | esquema `analytics` | vista precalculada por encuesta |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/reporting` (hexagonal).
- **Rutas:**
  - `GET /analytics/surveys/:id/dashboard` — devuelve los indicadores y el desglose de la encuesta.
- **Permisos:** exige sesión.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/dashboard/` (panel por encuesta).
- **Estado:** carga perezosa del desglose por pregunta.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/panel-encuesta.adl

Componentes: rejilla de indicadores, gráfico de barras, tabla y lista de comentarios.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: elegir encuesta → ver indicadores → explorar el desglose.
- Estados: cargando, vacío y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| panel-encuesta | `SurveyDashboard` | reporting use-cases | `/analytics/surveys/:id/dashboard` | `modules/dashboard` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
