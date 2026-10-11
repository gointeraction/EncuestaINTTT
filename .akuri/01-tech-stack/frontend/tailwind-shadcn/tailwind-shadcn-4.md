---
file: tailwind-shadcn-4.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: TAILWIND_SHADCN_4
summary: Tailwind CSS v4 + shadcn/ui (new-york, neutral base) — the design system of
  EncuestaINTTT, with institutional INTT palette in globals.css and primitives in
  src/components/ui/.
category: tailwind-shadcn
scope: the tailwind-shadcn specification
---

# Tech-Stack — Tailwind CSS v4 + shadcn/ui (frontend)

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

WRITE INFO: DESIGN_PATTERN=DESIGN_SYSTEM.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/frontend/tailwind-shadcn/tailwind-shadcn-4.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `frontend.tailwind-shadcn` — Tailwind CSS (utility CSS) + shadcn/ui (component kit).

2. **major-version** — 4 — `tailwindcss ^4`, `@tailwindcss/postcss ^4`; shadcn config `components.json` (`style: new-york`, `baseColor: neutral`, `rsc: true`, icon library `lucide`).

3. **layer** — frontend.

4. **capabilities** — 50+ accessible primitives in `src/components/ui/` (button, card, dialog, table, chart, form, …); Radix-based; class merging via `cn()`.

5. **depends-on** — `frontend.react.ui`; `@radix-ui/*`, `lucide-react`, `recharts` (charts), `framer-motion` (motion).

6. **canonical-files** — `components.json`, `src/app/globals.css` (design tokens + INTT palette), `src/components/ui/*.tsx`, `src/lib/utils.ts`.

7. **compliance** — frontend: source-layout (primitives in `ui/`), no-console-log; global tokens live in `globals.css` (single source of truth), not duplicated per component.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
