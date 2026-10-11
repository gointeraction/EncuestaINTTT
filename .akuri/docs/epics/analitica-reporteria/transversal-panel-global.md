---
file: transversal-panel-global.md
doc-type: TRANSVERSAL
level: L3
area: A2
position: 5
title: Panel global
summary: Panel global del programa Visión Cero — indicadores clave agregados,
  distribución por tipo de conductor y distribución por estado, sobre el resumen
  precalculado.
epic: analitica-reporteria
transversal: panel-global
project: encuestaintt
idioma: es
layers: descripcion reglas persistencia backend frontend-logica frontend-visual experiencias-visuales trazabilidad
flows: panel-global
routes: /analytics/global/dashboard
models: GlobalDashboard
---

# Transversal — Panel global (épica analitica-reporteria)

## SECTION 01-DESCRIPCION

- **user-story:** Como directivo del INTT, quiero una vista global del programa Visión Cero para tomar decisiones sobre la campaña.
- **use-case:** UC-AN-04 (consulta del panel global).
- **ux-ui:** panel con las tarjetas de indicadores principales, un gráfico por tipo de conductor y un mapa o tabla por estado.

## SECTION 02-REGLAS

- **analitica-reporteria.panel-global.R01:** el panel presenta los indicadores clave agregados del programa (respuestas totales y los indicadores de percepción definidos).
- **analitica-reporteria.panel-global.R02:** el panel incluye la distribución por tipo de conductor y la distribución por estado.
- **analitica-reporteria.panel-global.R03:** el panel es de solo lectura y se sirve desde el resumen precalculado.

## SECTION 03-PERSISTENCIA

| Modelo | Almacén | Rol |
|---|---|---|
| `GlobalDashboard` | esquema `analytics` | vista precalculada global del programa |

## SECTION 04-BACKEND

- **Módulo:** `analytics/api/src/modules/analytics/reporting` (hexagonal).
- **Rutas:**
  - `GET /analytics/global/dashboard` — devuelve los indicadores y distribuciones globales.
- **Permisos:** exige sesión.

## SECTION 05-FRONTEND-LOGICA

- **Páginas:** `analytics/console/src/app/modules/dashboard/` (panel global).
- **Estado:** refresco manual contra el resumen vigente.
- **Datos:** consume el contrato generado (api-sdk).

## SECTION 06-FRONTEND-VISUAL

- **sketch:** sketches/panel-global.adl

Componentes: rejilla de indicadores, gráfico de distribución y tabla por estado.

## SECTION 07-EXPERIENCIAS-VISUALES

- Flujo feliz: abrir el panel global → revisar indicadores → filtrar por estado.
- Estados: cargando, vacío y error.
- Adaptación: escritorio y móvil.

## SECTION 08-TRAZABILIDAD

Top-down:

| F | Persistencia | Backend | Rutas | Interfaz |
|---|---|---|---|---|
| panel-global | `GlobalDashboard` | reporting use-cases | `/analytics/global/dashboard` | `modules/dashboard` |

Bottom-up (inverso): cada elemento anterior pertenece únicamente a este transversal; no se comparte con los demás.
