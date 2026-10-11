---
file: README.md
doc-type: EPIC
level: L3
area: A2
position: 1
title: Analítica y reportería
summary: Épica de analítica y reportería — acceso de solo lectura a los datos de la
  encuesta, sumarización independiente (CQRS) y presentación eficiente de resultados,
  como transversales integrales que orientan la construcción y la auditoría.
epic: analitica-reporteria
project: encuestaintt
corpus-root: .akuri/docs
transversals: acceso-datos-encuesta sumarizacion-cqrs panel-encuesta panel-global exportacion-datos reportes-cruzados gestion-participantes
---

# Épica — Analítica y reportería (analitica-reporteria)

Cada transversal cubre todas las capas: descripción (relato de usuario / caso de uso / UX-UI),
reglas, persistencia, capa servidor, lógica de interfaz, capa visual (sketch ADL) y
experiencias visuales, más la trazabilidad documento↔código.

Esta épica modela el back-office analítico del INTT: acceso de solo lectura a los datos de la
encuesta, sumarización independiente (patrón CQRS) y presentación eficiente de resultados en
paneles y exportaciones. Todo el procesamiento ocurre fuera de la ruta de captura.

## Transversales

| Transversal | Archivo |
|---|---|
| Acceso a los datos de la encuesta | transversal-acceso-datos-encuesta.md |
| Sumarización (CQRS) | transversal-sumarizacion-cqrs.md |
| Panel por encuesta | transversal-panel-encuesta.md |
| Panel global | transversal-panel-global.md |
| Exportación de datos | transversal-exportacion-datos.md |
| Reportes cruzados | transversal-reportes-cruzados.md |
| Gestión de participantes | transversal-gestion-participantes.md |

## Modelo de análisis

Los transversales operan sobre **dos generaciones de datos** y un **registro de cuestionarios**
(ver `00-manifest/analytics-platform.md §11`):

- **Visión Cero (legacy, documental)** — `public.legacy_survey_responses`: el cuestionario
  respondido COMPLETO en un JSON (`answers`, keyed por pregunta-id) + envelope
  (`driverType`, `channel`, `completedAt`, sorteo).
- **SDD (normalizado)** — `surveys/questions/responses/answers` (motor genérico multi-cuestionario).

El **registro** (`00-manifest/questionnaires-registry.md`) declara, por cuestionario, fuente,
etiquetas (preguntas/tipos de conductor/canales), seed y análisis; la analítica es
**registry-driven**. El almacenamiento y el filtrado se especifican en
`00-manifest/answers-storage.md` y `00-manifest/analysis-filtering.md`.

## Cobertura

Toda funcionalidad de esta épica se documenta en exactamente un transversal (el índice se
mantiene en el campo `transversals` del frontmatter). Las reglas locales del proyecto viven en
`.akuri/rules/rules.yaml` y se componen sobre las normas base del pack (N01…N10).
