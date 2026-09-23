# Worklog — Visión Cero Encuesta App

Project: Next.js survey application for "Propuesta de Encuesta Mejorada: Hacia una Visión Cero en Siniestros de Motocicletas".

Key requirement: The app must detect which questions apply to the respondent based on the **tipo de conductor** (driver type), using both `appliesTo` (driver-type filtering) and `showIf` (answer-based branching).

---
Task ID: 1
Agent: main
Task: Design comprehensive survey data model with driver-type conditional logic.

Work Log:
- Defined 6 driver types: motociclista activo, delivery/mensajero, mototaxista, ex-motociclista, familiar de víctima, otro conductor.
- Designed 10 survey sections with conditional `appliesTo` rules and answer-based `showIf` branching.
- Authored `/src/lib/survey-data.ts` as the single source of truth for questions, sections, and driver types.

Stage Summary:
- Survey definition module created at `src/lib/survey-data.ts`.
- Supports question types: radio, checkbox, text, textarea, scale (1-5), select, number.
- Conditional logic implemented via `appliesTo` (driver type array or "all") and `showIf` (questionId + value match).
