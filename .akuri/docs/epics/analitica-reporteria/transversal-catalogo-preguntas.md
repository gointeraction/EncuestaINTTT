---
file: transversal-catalogo-preguntas.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 9
title: Catálogo de preguntas
summary: Inventario de las preguntas del cuestionario — tabla navegable con la base
  respondida de cada pregunta, que enlaza (drill-down) al panel de esa pregunta.
epic: analitica-reporteria
transversal: catalogo-preguntas
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: catalogo-preguntas
routes: /analytics/surveys/:id/dashboard
models: SurveySummaryReport
---

# Transversal — Catálogo de preguntas (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como analista, quiero ver el inventario de todas las preguntas del cuestionario con cuántas respuestas tiene cada una, para explorar y elegir cuál analizar.
- **use-case:** UC-AN-08 (consulta del catálogo de preguntas).
- **ux-ui:** tabla con buscador y filtro por tipo; cada fila (pregunta · tipo · forma visual · base) es un enlace al panel de esa pregunta.

## SECTION 02-REGLAS

- **analitica-reporteria.catalogo-preguntas.R01:** el catálogo se sirve desde el resumen precalculado de la encuesta; no ejecuta consultas pesadas.
- **analitica-reporteria.catalogo-preguntas.R02:** cada fila enlaza al detalle con la pregunta seleccionada (`/panel?q=<preguntaId>`).
- **analitica-reporteria.catalogo-preguntas.R03:** la navegación es de solo lectura y no altera la captura.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveySummaryReport` | esquema `analytics` | resumen precalculado por encuesta (preguntas + base) |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/read-model` (reutiliza el resumen).
- **Rutas:**
  - `GET /analytics/surveys/:id/dashboard` — resumen con las preguntas y su base.
- **Permisos:** exige sesión de staff.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/analytics/pages/preguntas/` (catálogo).
- **Estado:** búsqueda y tipo de pregunta; filas enlazan al detalle.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/panel-encuesta.adl

Componentes: tabla de preguntas (con buscador y filtro) y estado vacío.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: abrir el catálogo → buscar/filtrar → elegir una pregunta → ver su detalle en el panel.
- Estados: cargando, vacío y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| catalogo-preguntas | `SurveySummaryReport` | read-model (resumen) | `/analytics/surveys/:id/dashboard` | `pages/preguntas` (+ detalle en `/panel?q=`) |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
