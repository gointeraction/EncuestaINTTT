---
file: transversal-reportes-cruzados.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 7
title: Reportes cruzados
summary: Tablas cruzadas entre dos preguntas de una encuesta — cruce de respuestas
  servido desde los read models, con paginación y solo lectura.
epic: analitica-reporteria
transversal: reportes-cruzados
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: reportes-cruzados
routes: /analytics/surveys/:id/cross-tab
models: SurveyCrossTab
---

# Transversal — Reportes cruzados (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como analista, quiero cruzar dos preguntas de una encuesta para descubrir relaciones entre las respuestas.
- **use-case:** UC-AN-06 (consulta de una tabla cruzada).
- **ux-ui:** dos selectores de pregunta y una tabla cruzada con conteos; el resultado queda legible en pantallas pequeñas.

## SECTION 02-REGLAS

- **analitica-reporteria.reportes-cruzados.R01:** el cruce combina las respuestas de dos preguntas de la misma encuesta y presenta el conteo de cada par de valores.
- **analitica-reporteria.reportes-cruzados.R02:** el resultado se sirve desde los read models; el cálculo pesado no ocurre en la captura.
- **analitica-reporteria.reportes-cruzados.R03:** el resultado se entrega paginado y es de solo lectura.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveyCrossTab` | esquema `analytics` | cruce precalculado de pares de preguntas |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/reporting` (hexagonal).
- **Rutas:**
  - `GET /analytics/surveys/:id/cross-tab` — devuelve la tabla cruzada entre dos preguntas.
- **Permisos:** exige sesión.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/analytics/` (tabla cruzada).
- **Estado:** dos selectores de pregunta y el resultado paginado.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/reportes-cruzados.adl

Componentes: selectores de pregunta, tabla cruzada y paginación.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: elegir dos preguntas → ver el cruce.
- Estados: cargando, vacío y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| reportes-cruzados | `SurveyCrossTab` | reporting use-cases | `/analytics/surveys/:id/cross-tab` | `modules/analytics` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
