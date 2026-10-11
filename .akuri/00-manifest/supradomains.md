---
file: supradomains.md
doc-type: SPEC
level: L2
area: A2
position: 3
title: SUPRADOMAINS
summary: Supradomains are defined per layer because each layer answers a different
  architecture. Backend groups business services by responsibility; frontend groups UI
  by route/feature surface. Declares WHY a service/component lives where it lives.
category: 00-manifest
scope: the 00-manifest specification
---

# Supradomains — Organization by Layer (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Supradomains are defined **per layer** because each layer answers a different
architecture:

- **Backend (Next.js Route Handlers)** — services grouped by *business/technical
  responsibility*. Grouping is navigational; it does NOT create an import layer.
- **Frontend (App Router)** — UI grouped by *route/feature surface*; it does NOT mirror the
  backend groups.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see `01-tech-stack/` (nextjs-16, prisma-6, postgresql-16).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=LAYERED (route → service → db); ARCH_PATTERN=SUPRADOMAIN_GROUPING.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-BACKEND-SUPRADOMAINS

WRITE INFO: services and their API routes grouped by responsibility:

| Supradomain | Place here (WHAT goes) | Services / routes | Do NOT place here |
|-------------|------------------------|-------------------|-------------------|
| `platform` | **MUST-have platform capabilities** — identity, admin session, audit, config. | `lib/auth/*`, `lib/admin-auth.ts`, `api/admin/{login,logout,session}`, `AuditLog` use | survey/quota business rules |
| `survey` | **Survey domain** — the core business: surveys, questions, responses, answers. | `survey-service.ts`, `question-service.ts`, `response-service.ts`, `eligibility-service.ts`, `deployment-service.ts`, `api/v1/surveys/**`, `api/v1/public/surveys/**` | analytics aggregation, sorteo |
| `incentives` | **Incentivos y sorteo** — the citizen incentive capability. | `lib/sorteo.ts`, `api/survey/participants`, submission `sorteo` branch | survey CRUD |
| `analytics` | **Dashboards y analítica** — read-only aggregation (CQRS). | `analytics-service.ts`, `survey-analytics.ts`, `api/v1/surveys/[id]/analytics`, `api/survey/stats`, `api/v1/surveys/[id]/exports` | write paths, survey lifecycle |
| `integration` | **Reusable technical integration** — anti-bot, rate-limit, privacy hashing, fallback store. | `rate-limit.ts`, `turnstile.ts`, `services/ip-hash.ts`, `services/local-survey-store.ts`, `slug.ts` | business entities |

### Decision rule (backend) — ask in order; first matching group wins
1. **Would ANY new survey application need this to exist and run?** → `platform`
   (identity, admin session, audit, config).
2. **Is it the survey domain proper** (surveys, questions, responses, answers, eligibility,
   publication/QR)? → `survey`.
3. **Is it the incentive/sorteo capability** (cédula/teléfono validation, uniqueness, code)? → `incentives`.
4. **Is it read-only aggregation/visualization over recorded answers?** → `analytics`.
5. **Is it business-agnostic technical machinery** (rate-limit, captcha, IP hashing, local
   fallback store, slug)? → `integration`.

### SECTION 02-FRONTEND-SUPRADOMAINS

WRITE INFO: UI grouped by how the app navigates:

| Supradomain | Place here | Examples |
|-------------|-----------|----------|
| `core` | routing shell (layout, page, globals, API tree) | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` |
| `survey` | citizen survey feature UI | `components/survey/*` |
| `dashboard` | private analytics feature UI | `components/dashboard/*` |
| `admin` | surveys manager + admin login UI | `components/admin/*` |
| `shared` | design-system primitives + hooks | `components/ui/*`, `hooks/*`, `lib/utils.ts` |

### Frontend ↔ backend mapping (traceability, NOT identity)

A frontend page may consume several backend groups (e.g. the dashboard reads `analytics` and
`survey`). That is correct: the frontend groups by UI surface, the backend by responsibility.
The API is the only coupling point.

### SECTION 03-DECLARED-PLACEMENTS

WRITE INFO:

| Service / route | Supradomain | Why |
|-----------------|-------------|-----|
| `lib/auth/*`, `lib/admin-auth.ts` | `platform` | identity + admin session for the whole app. |
| `api/admin/{login,logout,session}` | `platform` | administrative auth boundary. |
| `lib/services/{survey,question,response,eligibility,deployment}-service.ts` | `survey` | survey domain. |
| `api/v1/surveys/**`, `api/v1/public/surveys/**` | `survey` | survey domain boundary. |
| `lib/sorteo.ts`, `api/survey/participants` | `incentives` | raffle capability. |
| `lib/services/analytics-service.ts`, `lib/survey-analytics.ts`, `api/survey/stats`, `.../analytics`, `.../exports` | `analytics` | read-only aggregation. |
| `lib/rate-limit.ts`, `lib/turnstile.ts`, `services/ip-hash.ts`, `services/local-survey-store.ts` | `integration` | business-agnostic machinery. |

### SECTION 04-BACKOFFICE-SUPRADOMAINS

WRITE INFO: la capa analítica (back-office NestJS, ver `analytics-platform.md`) usa sus PROPIOS
supradominios — no los de la captura — porque responde a un dominio distinto (analítica y acceso):

| Supradominio | Place here (WHAT goes) | Do NOT place here |
|-------------|------------------------|-------------------|
| `platform` | identidad del staff, sesión, RBAC/ABAC (guards), auditoría de acceso (`access_audit`), configuración | reportes, read models, captura |
| `analytics` | read models y reportería read-only: sumarización CQRS, KPIs, tablas cruzadas, exportación (con enmascaramiento PII), puertos `*_REPORTING_QUERY` | escritura de captura, identidad |
| `integration` | adaptadores hacia el esquema `public` (rol read-only), cliente Prisma/consulta, jobs (cron/scheduler) | lógica de negocio analítica, política de acceso |

### Decision rule (back-office) — ask in order; first matching group wins
1. **Identidad, roles o auditoría de acceso?** → `platform`.
2. **Lectura/agregación/reportes sobre datos capturados?** → `analytics`.
3. **Mecanismo técnico de acceso a datos o scheduling?** → `integration`.

WRITE RULE: la capa de captura y la capa analítica MUST NOT compartir supradominios ni módulos
de negocio; se comunican SOLO por la base de datos (esquema/rol) y por el contrato de API. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
