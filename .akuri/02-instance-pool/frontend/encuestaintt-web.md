---
file: encuestaintt-web.md
doc-type: INSTANCE
level: L4
area: A2
position: 1
title: ENCUESTAINTTT_WEB
summary: The EncuestaINTTT web application — citizen survey portal, private analytics
  dashboard and admin panel, built with Next.js 16 App Router.
layer: frontend
technology: nextjs
instance: The EncuestaINTTT web application (citizen portal + dashboard + admin), one Next.js 16 App Router app.
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: src/app/
entry-point: src/app/layout.tsx, src/app/page.tsx
status: declared
ruleset: [encuestaintt-nextjs-page]
---

# Instance Pool — encuestaintt-web (Next.js — REAL)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — the EncuestaINTTT web application (citizen portal + dashboard + admin).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=APP_ROUTER.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/frontend/encuestaintt-web.md
> Produced by: how-to-write-a-instance-pool.template.md
> Level: L4

## Fields

1. **instance** — the EncuestaINTTT web application: the public citizen survey (`/`), the private
   dashboard (`/?admin=1`) and the survey manager/admin panel (`/admin`).

2. **repo-location** — `/mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT`; the app is
   `src/app/` with components in `src/components/`.

3. **entry-point** — `src/app/layout.tsx` (root layout, Georama typography) and `src/app/page.tsx`
   (orchestrator that renders survey vs dashboard by `?admin=1`).

4. **naming** — package `nextjs_tailwind_shadcn_ts`; instance named `encuesta-intt` in PM2; aliases
   `@/components`, `@/lib`, `@/hooks`, `@/store`.

5. **version-reality** — `next ^16.1.1`, `react ^19.0.0`, `tailwindcss ^4`, `zustand ^5.0.6` match
   the L3 tech-stack docs.

6. **independent-core** — single app core; the dashboard and the admin are routes/components of the
   SAME app, not separate deployments.

## routes (declared)

- `/` — citizen portal: welcome → `driver-type-selector` → `survey-form` (adaptive) → `sorteo-form`
  → `thank-you`.
- `/?admin=1` — private dashboard (`components/dashboard/dashboard.tsx`).
- `/admin` — survey manager + admin login (`components/admin/*`), redirecting to `/?admin=1&tab=surveys`.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
