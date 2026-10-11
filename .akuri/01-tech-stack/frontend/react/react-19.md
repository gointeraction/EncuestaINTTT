---
file: react-19.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: REACT_19
summary: React 19 — the rendering runtime of the EncuestaINTTT UI (client components,
  hooks, concurrent rendering).
category: react
scope: the react specification
---

# Tech-Stack — React 19 (frontend)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/frontend/react/react-19.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `frontend.react.ui` — React, the UI runtime consumed through Next.js.

2. **major-version** — 19 — `react ^19.0.0`, `react-dom ^19.0.0` in `package.json`.

3. **layer** — frontend.

4. **scope-role** — renders the survey flow, dashboard charts and admin UI; local component state and hooks; form state via `react-hook-form` + `zod`.

5. **capabilities** — client components (`"use client"`), hooks (`useState`/`useEffect`), context, Suspense, portals (dialogs/sheets from shadcn).

6. **depends-on** — `frontend.nextjs.app`; `frontend.tailwind-shadcn` (primitives); `frontend.zustand` (global state).

7. **canonical-files** — `src/components/**/*.tsx`, `src/hooks/*.ts`.

8. **compliance** — frontend: source-layout, no-console-log; a component that uses hooks/browser APIs MUST declare `"use client"`.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
