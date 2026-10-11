---
file: CAPABILITIES.md
doc-type: SPEC
level: L2
area: A2
position: 2
title: CAPABILITIES
summary: Status matrix of implemented capabilities of EncuestaINTTT (Visión Cero +
  SDD v1.2 + platform), with the real files that back each one.
category: nextjs
scope: the nextjs specification
---

# EncuestaINTTT — Capabilities Inventory

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: The current state of the EncuestaINTTT backend + frontend capabilities, with the
real files that implement them (declared = built).

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

### SECTION 01-EXECUTIVE-SUMMARY

WRITE INFO: executive summary:

| Metric | Value |
|--------|-------|
| Route handler files | ~20 (`src/app/api/**/route.ts`) |
| Service modules | ~12 (`src/lib/services/`) |
| Auth/privacy modules | 8 (`src/lib/auth/`, `admin-auth`, `rate-limit`, `turnstile`) |
| Prisma models | 10 (8 SDD + 2 legacy) |
| Survey questions catalog | ~55 across 10 sections / 6 driver profiles |
| Dashboard metrics | ~46 |
| UI primitives (shadcn) | ~50 |

### SECTION 02-VISION-CERO

WRITE INFO: **Visión Cero** (citizen portal):

| Capability | Status | Implementation |
|------------|:------:|----------------|
| Adaptive survey by profile | ✅ | `lib/survey-data.ts` (`DRIVER_TYPES`, `getSectionsForDriverType`, `getActiveQuestions`) |
| Conditional questions | ✅ | `showIf` in `survey-data.ts`, `components/survey/question-renderer.tsx` |
| Geographic selector (VE) | ✅ | `lib/venezuela-estados.ts` |
| Client drafts | ✅ | `store/survey-store.ts` (Zustand + localStorage) |
| Submission + anti-bot | ✅ | `api/survey/submit/route.ts` (rate-limit → honeypot → Turnstile → cédula) |
| Raffle code | ✅ | `lib/sorteo.ts` (`generateSorteoCode`) |
| Pre-aggregated dashboard | ✅ | `api/survey/stats/route.ts` + `SurveySummary` (CQRS) |
| Fallback store | ✅ | `lib/services/local-survey-store.ts`, `db/sqlite_backup.json` |

### SECTION 03-SDD-V12

WRITE INFO: **SDD v1.2** (survey management):

| Capability | Status | Implementation |
|------------|:------:|----------------|
| Survey CRUD | ✅ | `services/survey-service.ts`, `api/v1/surveys/[id]/route.ts` |
| Lifecycle (publish/close/archive) | ✅ | `services/deployment-service.ts`, `api/v1/surveys/[id]/{publish,close,archive}` |
| Slug + shortCode + QR | ✅ | `services/slug.ts`, `deployment-service.ts`, `api/v1/surveys/[id]/qr` |
| Questions CRUD + reorder | ✅ | `services/question-service.ts`, `api/v1/surveys/[id]/questions/**` |
| Eligibility (4 modes) | ✅ | `services/eligibility-service.ts`, `api/v1/public/surveys/[slug]/route.ts` |
| Response ingestion (422, dedupe) | ✅ | `services/response-service.ts`, `api/v1/public/surveys/[slug]/responses` |
| Per-survey analytics | ✅ | `services/analytics-service.ts`, `api/v1/surveys/[id]/analytics` |
| CSV export + PII mask | ✅ | `services/export-service.ts`, `api/v1/surveys/[id]/exports` |

### SECTION 04-PLATFORM

WRITE INFO: **Plataforma**:

| Capability | Status | Implementation |
|------------|:------:|----------------|
| Admin login (HMAC + JWT) | ✅ | `lib/admin-auth.ts`, `lib/auth/session.ts`, `api/admin/*` |
| RBAC | ✅ | `lib/auth/rbac.ts` (`requireAuth`, `requireRoles`, `hasMinimumRole`) |
| Password hashing | ✅ | `lib/auth/password.ts` |
| Audit log | ✅ | `AuditLog` model; `survey-service.update/delete` write audit rows |
| Privacy hashing | ✅ | `lib/services/ip-hash.ts`, `eligibility-service.hashEmail` |
| Turnstile + honeypot + rate-limit | ✅ | `lib/turnstile.ts`, `api/survey/submit` |
| Seed | ✅ | `api/survey/seed/route.ts` |
| Redis cache/rate-limit (shared) | ⚠️ Declared | provisioned in `docker-compose.yml`; rate-limit currently in-process |
| Email/SMS notifications | ❌ Out of scope | not declared |

### SECTION 05-FRONTEND

WRITE INFO: **Frontend**:

| Capability | Status | Details |
|------------|:------:|---------|
| Citizen portal | ✅ | `app/page.tsx` orchestration; `components/survey/*` |
| Survey manager | ✅ | `components/admin/survey-manager.tsx` |
| Admin login | ✅ | `components/admin/admin-login.tsx` |
| Dashboard | ✅ | `components/dashboard/dashboard.tsx`, `survey-analytics-view.tsx` |
| Design system | ✅ | `components/ui/*` (shadcn new-york) + INTT palette in `globals.css` |
| Charts | ✅ | `recharts` via `components/ui/chart.tsx` |
| Motion | ✅ | `framer-motion` |
| i18n | ❌ Spanish-only | institutional, single language |

### SECTION 06-SOURCE

WRITE INFO: *Generated from the real repo; declared = built. Update when code changes.*

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes and matches the repo.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
