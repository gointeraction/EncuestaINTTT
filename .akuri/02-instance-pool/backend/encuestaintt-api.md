---
file: encuestaintt-api.md
doc-type: INSTANCE
level: L4
area: A2
position: 1
title: ENCUESTAINTTT_API
summary: The EncuestaINTTT API — Next.js Route Handlers (src/app/api) exposing the
  legacy Visión Cero endpoints and the SDD v1 endpoints.
layer: backend
technology: nextjs-api
instance: The EncuestaINTTT API (Next.js Route Handlers), one backend for the whole app.
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: vision-cero/src/app/api/
entry-point: vision-cero/src/app/api/**/route.ts
status: declared
ruleset: [encuestaintt-nextjs-api]
---

# Instance Pool — encuestaintt-api (Next.js Route Handlers — REAL)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — the EncuestaINTTT API (Next.js Route Handlers).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=ROUTE_HANDLERS.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=SERVICE_LAYER.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/backend/encuestaintt-api.md
> Produced by: how-to-write-a-instance-pool.template.md
> Level: L4

## Fields

1. **instance** — the EncuestaINTTT API: one backend for the whole app, implemented as Next.js
   Route Handlers; persistence via `persistence.postgresql` through `persistence.prisma`.

2. **repo-location** — `EncuestaINTTT/vision-cero/src/app/api/`; services in `EncuestaINTTT/vision-cero/src/lib/services/`.

3. **entry-point** — one `route.ts` per resource (`GET`/`POST`/`PATCH`/`DELETE`); logic in the
   service layer.

4. **naming** — routes under `/api` (legacy) and `/api/v1` (SDD); services `*-service.ts`.

5. **version-reality** — same Next.js 16 runtime as the app; declared 16 matches real.

6. **independent-core** — a single API core; there is no separate backend service.

## endpoint families (declared)

| Family | Routes | Auth |
|--------|--------|------|
| Visión Cero — submit | `POST/GET /api/survey/submit` | public (anti-bot) |
| Visión Cero — stats | `GET/POST /api/survey/stats` | admin |
| Visión Cero — participants | `GET /api/survey/participants` | admin (intranet) |
| Visión Cero — seed | `POST /api/survey/seed` | admin |
| Admin | `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session` | — |
| SDD — surveys | `GET/POST /api/v1/surveys`, `GET/PATCH/DELETE /api/v1/surveys/[id]` | `requireAuth` |
| SDD — questions | `GET/POST /api/v1/surveys/[id]/questions`, `GET/PATCH/DELETE .../[questionId]` | `requireAuth` |
| SDD — lifecycle | `POST .../{publish,close,archive}`, `GET .../qr` | `requireAuth` |
| SDD — analytics/exports | `GET .../analytics`, `GET/POST .../exports` | `requireAuth`/roles |
| SDD — public | `GET /api/v1/public/surveys/[slug]`, `POST .../responses` | public (anti-bot) |

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
