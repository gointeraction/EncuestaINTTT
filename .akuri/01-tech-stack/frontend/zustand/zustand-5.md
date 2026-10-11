---
file: zustand-5.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: ZUSTAND_5
summary: Zustand v5 — the client state store of EncuestaINTTT (survey answers,
  navigation between profiles/questions, client-side drafts before submit).
category: zustand
scope: the zustand specification
---

# Tech-Stack — Zustand 5 (frontend)

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

WRITE INFO: DESIGN_PATTERN=STORE.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/frontend/zustand/zustand-5.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `frontend.zustand` — Zustand, the global client store.

2. **major-version** — 5 — `zustand ^5.0.6` in `package.json`.

3. **layer** — frontend.

4. **scope-role** — holds the in-progress survey state (selected `driverType`, answers per question, current step) so navigation is reactively driven and no server round-trip is needed for drafts (D-3, autosave in `localStorage`).

5. **capabilities** — a typed store (`src/store/survey-store.ts`) with selectors; persisted to `localStorage` for partial answers.

6. **depends-on** — `frontend.react.ui`. It MUST NOT import `lib/services` or touch the DB directly.

7. **canonical-files** — `src/store/survey-store.ts`.

8. **compliance** — frontend: source-layout (state per feature under `src/store/`), no-console-log; the store is client-only (`"use client"` consumers).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
