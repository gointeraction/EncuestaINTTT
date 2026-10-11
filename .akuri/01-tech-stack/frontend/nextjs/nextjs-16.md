---
file: nextjs-16.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: NEXTJS_16
summary: Next.js 16 App Router — the frontend application framework of EncuestaINTTT
  (RSC + client components, file-system routing, standalone output).
category: nextjs
scope: the nextjs specification
---

# Tech-Stack — Next.js 16 (frontend)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=APP_ROUTER.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REGISTRY.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/frontend/nextjs/nextjs-16.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `frontend.nextjs.app` — Next.js, the App Router framework of the citizen portal, dashboard and admin UI.

2. **major-version** — 16 — `next ^16.1.1` in `package.json` (`output: "standalone"` in `next.config.ts`).

3. **layer** — frontend.

4. **scope-role** — server-rendered citizen survey (public, low-bandwidth mobile), private dashboard, and the admin panel; file-system routing under `src/app/`.

5. **capabilities** — RSC + client components, route handlers (`route.ts`), `layout.tsx`/`page.tsx`, metadata, standalone build for PM2.

6. **depends-on** — `frontend.react.ui`, `frontend.tailwind-shadcn`, `frontend.zustand`, `backend.nextjs-api`.

7. **canonical-files** — `package.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.

8. **compliance** — frontend: app-router, source-layout, no-console-log; routing shell only in `src/app/`.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
