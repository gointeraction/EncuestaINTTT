---
file: transversal-acceso-datos-encuesta.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 2
title: Acceso a los datos de la encuesta
summary: Acceso de solo lectura del back-office a los datos de la encuesta — vistas y
  puertos de lectura sobre el esquema public, sin escritura alguna sobre la captura.
epic: analitica-reporteria
transversal: acceso-datos-encuesta
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: acceso-datos
routes: /analytics/sources/surveys
models: SurveyRead ResponseRead
---

# Transversal — Acceso a los datos de la encuesta (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como analista del INTT, quiero leer los datos de la encuesta sin tocar la captura, para poder analizarlos con total seguridad.
- **use-case:** UC-AN-01 (acceso de solo lectura a los datos de la encuesta).
- **ux-ui:** la consola ofrece un selector de fuente que lista las encuestas disponibles para analizar.

## SECTION 02-REGLAS

- **analitica-reporteria.acceso-datos-encuesta.R01:** el back-office accede al esquema `public` con un rol de solo lectura; nunca escribe en él.
- **analitica-reporteria.acceso-datos-encuesta.R02:** la lectura se expone mediante vistas de solo lectura en el esquema `analytics`, para mantener limpias las migraciones.
- **analitica-reporteria.acceso-datos-encuesta.R03:** ninguna consulta del back-office modifica los datos capturados.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveyRead` | vistas de solo lectura en `analytics` sobre `public` | encuestas disponibles |
| `ResponseRead` | vistas de solo lectura en `analytics` sobre `public` | respuestas por encuesta |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/integration/public-read` (hexagonal).
- **Rutas:**
  - `GET /analytics/sources/surveys` — lista las encuestas disponibles para analizar.
- **Permisos:** exige sesión de staff.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/dashboard/` (selector de fuente).
- **Estado:** la fuente seleccionada viaja al resto de la consola.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/acceso-datos-encuesta.adl

Componentes: selector de fuente y estado vacío.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: abrir la consola → elegir fuente → panel de esa encuesta.
- Estados: cargando, vacío y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| acceso-datos | `SurveyRead`, `ResponseRead` | public-read puertos/adaptadores | `/analytics/sources/surveys` | `modules/dashboard` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
