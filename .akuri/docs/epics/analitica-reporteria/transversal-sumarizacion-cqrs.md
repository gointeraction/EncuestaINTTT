---
file: transversal-sumarizacion-cqrs.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 3
title: Sumarización (CQRS)
summary: Sumarización independiente de los datos de la encuesta — read models
  precalculados y un trabajo (job) propio del back-office que nunca compite con la
  captura; recalculable y descartable.
epic: analitica-reporteria
transversal: sumarizacion-cqrs
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: sumarizacion
routes: /analytics/jobs/summarize /analytics/jobs/summarize/status
models: SurveySummaryReport SummarizationRun
---

# Transversal — Sumarización (CQRS) (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como analista, quiero que los indicadores estén precalculados para que el panel responda al instante aunque haya millones de respuestas.
- **use-case:** UC-AN-02 (cálculo y refresco de resúmenes precalculados).
- **ux-ui:** la consola muestra el momento del último cálculo y permite solicitar un recálculo.

## SECTION 02-REGLAS

- **analitica-reporteria.sumarizacion-cqrs.R01:** los read models son derivados de `public` y nunca su fuente de verdad; se pueden descartar y recalcular.
- **analitica-reporteria.sumarizacion-cqrs.R02:** la sumarización corre como un trabajo independiente del back-office; la captura no ejecuta agregaciones.
- **analitica-reporteria.sumarizacion-cqrs.R03:** un recálculo manual se registra y no bloquea la lectura del resumen vigente.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `SurveySummaryReport` | esquema `analytics` | resumen precalculado por encuesta |
| `SummarizationRun` | esquema `analytics` | registro de cada ejecución del trabajo |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/read-model` + `modules/integration/scheduler`.
- **Rutas:**
  - `POST /analytics/jobs/summarize` — dispara el recálculo del resumen.
  - `GET /analytics/jobs/summarize/status` — estado de la última ejecución.
- **Permisos:** exige sesión; el disparo exige rol `admin` o `analista`.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/dashboard/` (indicador de frescura).
- **Estado:** `vigente | recalculando | desactualizado`.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/sumarizacion-cqrs.adl

Componentes: indicador de estado, botón de recálculo y aviso.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: el panel muestra el resumen vigente; si se solicita, aparece "recalculando" y luego "vigente".
- Estados: vigente, recalculando, desactualizado y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| sumarizacion | `SurveySummaryReport`, `SummarizationRun` | read-model + scheduler | `/analytics/jobs/summarize`, `/analytics/jobs/summarize/status` | `modules/dashboard` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
