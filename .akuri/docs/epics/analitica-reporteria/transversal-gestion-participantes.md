---
file: transversal-gestion-participantes.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 8
title: Gestión de participantes
summary: Lista restringida de participantes del sorteo — lectura de solo lectura de
  los inscritos en la captura, con enmascaramiento de datos personales por rol y
  exportación reservada.
epic: analitica-reporteria
transversal: gestion-participantes
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: gestion-participantes
routes: /analytics/participants
models: SurveyResponse
---

# Transversal — Gestión de participantes (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como administrador del INTT, quiero revisar la lista oficial de participantes del sorteo para auditar el registro.
- **use-case:** UC-AN-07 (consulta de la lista de participantes).
- **ux-ui:** lista paginada con filtros; la exportación queda reservada y avisada.

## SECTION 02-REGLAS

- **analitica-reporteria.gestion-participantes.R01:** la lista de participantes proviene de la captura en solo lectura; el back-office nunca la modifica.
- **analitica-reporteria.gestion-participantes.R02:** los datos personales se enmascaran por rol en el servidor (el rol `analista` no ve el valor real).
- **analitica-reporteria.gestion-participantes.R03:** la exportación de la lista queda reservada a `admin`.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveyResponse` | `public.legacy_survey_responses` (filas `participaSorteo = true`) | inscrito en el sorteo (cédula única) |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/reporting` (hexagonal).
- **Rutas:**
  - `GET /analytics/participants` — lista los inscritos en el sorteo (paginado).
- **Permisos:** exige sesión; la exportación queda reservada a `admin`.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/analytics/` (lista de participantes).
- **Estado:** lista paginada con filtros.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/gestion-participantes.adl

Componentes: filtros, tabla de participantes y paginación.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: abrir la lista → filtrar → revisar participantes.
- Estados: cargando, vacío y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| gestion-participantes | `ParticipantEntry` | reporting use-cases | `/analytics/participants` | `modules/analytics` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
