---
file: transversal-exportacion-datos.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 6
title: Exportación de datos
summary: Exportación de resultados a CSV — formato RFC 4180 con BOM, con enmascaramiento
  de datos personales decidido por rol en el servidor y registro de cada exportación.
epic: analitica-reporteria
transversal: exportacion-datos
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: exportacion
routes: /analytics/surveys/:id/export
models: SurveyExport
---

# Transversal — Exportación de datos (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como analista, quiero descargar los resultados de una encuesta en CSV para trabajar con ellos fuera de la consola.
- **use-case:** UC-AN-05 (exportación de los datos de una encuesta).
- **ux-ui:** botón de descarga con confirmación; un aviso indica si lleva enmascaramiento de datos personales.

## SECTION 02-REGLAS

- **analitica-reporteria.exportacion-datos.R01:** la exportación usa el formato CSV RFC 4180 con BOM UTF-8, para abrirse directo en hoja de cálculo.
- **analitica-reporteria.exportacion-datos.R02:** el enmascaramiento de datos personales se decide por rol en el servidor; el rol `analista` siempre recibe datos enmascarados.
- **analitica-reporteria.exportacion-datos.R03:** cada exportación queda registrada con actor, encuesta y momento.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveyExport` | esquema `analytics` | registro de cada exportación (actor, encuesta, momento) |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/export` (hexagonal).
- **Rutas:**
  - `GET /analytics/surveys/:id/export` — genera y entrega el archivo CSV.
- **Permisos:** exige sesión; requiere rol `admin` o `analista`.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/export/` (botón de descarga).
- **Estado:** preparando archivo, descargando y error.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/exportacion-datos.adl

Componentes: filtros, botón de descarga y diálogo de confirmación.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: elegir encuesta → confirmar → descarga del archivo.
- Estados: preparando, descargando, error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| exportacion | `SurveyExport` | export use-cases | `/analytics/surveys/:id/export` | `modules/export` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
