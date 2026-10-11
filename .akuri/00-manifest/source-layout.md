---
file: source-layout.md
doc-type: SPEC
level: L2
area: A2
position: 2
title: SOURCE_LAYOUT
summary: Every implementation layer scoped by the tech-stack has three canonical roots
  (core / modules / shared). This declares the MEANING of those roots in the
  EncuestaINTTT Next.js App Router codebase, both for the API (backend) and the UI.
category: 00-manifest
scope: the 00-manifest specification
---

# Source Layout — What Goes in core / modules / shared (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Every implementation layer scoped by the tech-stack has three canonical roots:

```
<layer>/
  core/     # what the SYSTEM needs to run, independent of business (bootstrap, DB client, config)
  modules/  # what the BUSINESS is: the domain/feature slices, grouped by supradomain
  shared/   # what is REUSED across modules: UI kit, utilities, hooks, contracts
```

A single artifact belongs in EXACTLY one root. The decision asks *"does the system need this
to exist, or a business capability?"* — not convenience.

WRITE INFO: **REPO ROOT**: the repo has GENERAL files at the first level and each IMPLEMENTATION
in its own folder:
- **Root** (general): `compose.yaml`, `install.sh`/`install.ps1`, `.akuri/` (corpus), `docs/`,
  `handover/`, `.env*`, `README.md`.
- **`vision-cero/`**: the Next.js **capture** app (Visión Cero) — `src/`, `public/`, `prisma/`,
  `db/`, `scripts/`, `tests/`, `deploy/`, `Dockerfile`, `Caddyfile`, `.zscripts/`, y sus
  `next.config.ts` / `tailwind.config.ts` / `package.json`.
- **`analytics/`**: la capa analítica — `analytics/api` (NestJS), `analytics/console` (Angular),
  `analytics/api-sdk` (Orval), `analytics/seed` (seeder).

Los paths internos de este documento (`src/app/...`, `prisma/...`) son RELATIVOS a
`vision-cero/`.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see `01-tech-stack/` (nextjs-16, react-19, tailwind-shadcn, zustand-5, prisma-6, postgresql-16).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=APP_ROUTER (Next.js file-system routing); ARCH_PATTERN=ROUTE_HANDLERS.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REGISTRY; DESIGN_PATTERN=SERVICE_LAYER (route → service → db).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-BACKEND-NEXT-API

WRITE INFO: the API is a set of Next.js **Route Handlers** under `src/app/api/**/route.ts`:
one folder per resource, one exported function per HTTP verb. Handlers stay THIN; the logic
lives in `src/lib/services/`.

| Root | Place here (WHAT) | Examples | Do NOT place here |
|------|-------------------|----------|-------------------|
| `src/lib/db.ts` | **core** — the Prisma/PG client singleton every request shares | `db.ts` | business rules |
| `src/lib/auth/` | **core** — session/JWT/RBAC plumbing (system, not business) | `jwt.ts`, `session.ts`, `rbac.ts`, `password.ts` | survey/quota rules |
| `src/lib/services/` | **modules** — the business services (survey CRUD, responses, analytics, export, eligibility, deployment) | `survey-service.ts`, `response-service.ts`, `analytics-service.ts`, `export-service.ts`, `eligibility-service.ts`, `question-service.ts`, `deployment-service.ts` | HTTP concerns |
| `src/app/api/**/route.ts` | **modules** — the thin HTTP boundary (validate → call service → respond) | `api/v1/surveys/route.ts`, `api/survey/submit/route.ts` | domain logic, SQL |
| `src/lib/` (misc) | **shared** — reusable, business-agnostic machinery | `rate-limit.ts`, `turnstile.ts`, `admin-auth.ts`, `survey-analytics.ts`, `utils.ts` | business entities |

### Rules (backend)
- `route.ts` handlers MUST delegate to a service in `src/lib/services/`; no business logic inline. — MUST
- `core` (db, auth) and `shared` MUST NOT import business `services`; dependency flows
  `route → service → db`. — MUST
- Validation is server-side and strict (422 on failure), never trusting the client. — MUST
- Every DB write that touches more than one row uses a Prisma `$transaction`. — MUST

### Decision rule (backend) — ask in order, first match wins
1. Does the process need it regardless of business (DB client, session, config)? → `core/`.
2. Is it reusable machinery without business logic (rate-limit, captcha, utils)? → `shared/`.
3. Is it a business capability (survey lifecycle, responses, analytics)? → `modules/` (`lib/services/` + `app/api/`).

### SECTION 02-FRONTEND-NEXT-APP

WRITE INFO: the UI is the Next.js **App Router** under `src/app/` (RSC by default), with client
components colocated in `src/components/`.

| Root | Place here (WHAT) | Examples | Do NOT place here |
|------|-------------------|----------|-------------------|
| `src/app/` | **core** — routing shell: `layout.tsx`, `page.tsx`, `globals.css`, API tree | `layout.tsx`, `page.tsx` | feature widgets |
| `src/components/survey/` | **modules** — feature UI: the citizen survey flow | `welcome.tsx`, `driver-type-selector.tsx`, `question-renderer.tsx`, `survey-form.tsx`, `sorteo-form.tsx`, `thank-you.tsx`, `turnstile-widget.tsx` | shared primitives |
| `src/components/dashboard/` | **modules** — feature UI: analytics dashboard | `dashboard.tsx`, `survey-analytics-view.tsx` | shared primitives |
| `src/components/admin/` | **modules** — feature UI: surveys manager + admin login | `admin-login.tsx`, `survey-manager.tsx` | shared primitives |
| `src/components/ui/` | **shared** — the shadcn/ui design-system primitives | `button.tsx`, `card.tsx`, `chart.tsx`, `table.tsx` | feature logic |
| `src/hooks/` `src/lib/utils.ts` | **shared** — reusable hooks/utilities | `use-mobile.ts`, `use-toast.ts`, `utils.ts` | business services |
| `src/store/` | **modules** — client state per feature (Zustand v5) | `survey-store.ts` | DB access |

### Rules (frontend)
- A feature widget lives under `src/components/<feature>/`; primitives under `src/components/ui/`. — MUST
- Client components that touch the store or browser APIs MUST declare `"use client"` at the top. — MUST
- Pages/components MUST NOT query the DB directly; they call the API routes. — MUST
- `ui/` primitives MUST NOT import survey/dashboard/admin feature code (no upward dependency). — MUST

### Layer mapping (backend ≠ frontend, same names ≠ same meaning)

| Folder | Backend (Route Handlers) | Frontend (App Router) |
|--------|--------------------------|-----------------------|
| `core` | db client + auth plumbing | routing shell (layout/page/globals) |
| `modules` | business services + API routes | feature widgets (survey/dashboard/admin) + Zustand store |
| `shared` | rate-limit, captcha, utils | ui kit + hooks + utils |

### SECTION 03-DECLARED-PLACEMENTS

WRITE INFO: current placements:

| Path | Root | Why |
|------|------|-----|
| `src/lib/db.ts` | core | single Prisma client for the whole app. |
| `src/lib/auth/*` | core | session/JWT/RBAC system plumbing. |
| `src/lib/services/*` | modules | business capability services. |
| `src/app/api/*` | modules | thin HTTP boundary. |
| `src/components/{survey,dashboard,admin}/*` | modules | feature UI. |
| `src/components/ui/*` | shared | design-system primitives. |
| `prisma/schema.prisma` | core | schema of record (generates the client). |
| `db/*` | core | local fallback stores (`local_surveys.json`, `sqlite_backup.json`). |
| `scripts/*` | shared | deterministic ops/tests (tsx). |

### SECTION 04-ANALYTICS-APPS

WRITE INFO: la capa de captura conserva su layout actual (Next.js en la raíz del repo). La capa
analítica se añade como aplicaciones HERMANAS dentro del mismo repo (monorepo aditivo), sin mover
la captura:

```
EncuestaINTTT/
├── (captura, sin cambios)     # Next.js: src/, prisma/, db/, compose.yaml en la raíz
├── analytics/                 # BOUNDED CONTEXT analítico (back-office)
│   ├── api/                   # NESTJS (hexagonal): src/{core,modules,shared}
│   ├── console/               # ANGULAR (standalone): src/app/{core,modules,shared}
│   └── api-sdk/               # cliente generado (orval) desde el OpenAPI de api/
└── deploy/  Dockerfile        # (compartidos)
```

WRITE INFO: la app NestJS sigue el layout canónico `core / modules / shared` del método
(ver invesnetwork como precedente); la consola Angular, `src/app/{core,modules,shared}`:

| Root | Place here | Do NOT place here |
|------|-----------|-------------------|
| `analytics/api/src/core/` | arranque, config, cliente Prisma (read-only sobre `public`, escritura en `analytics`), scheduling | módulos de negocio |
| `analytics/api/src/modules/` | slices hexagonales por supradominio (`platform`, `analytics`): entity → use-cases → port → adapter → controller | bootstrap, plumbing |
| `analytics/api/src/shared/` | contratos, DTOs, filtros, guards, políticas | negocio de un módulo |
| `analytics/console/src/app/core/` | singletons: config, http interceptor, guard de sesión, api base URL | páginas, design system |
| `analytics/console/src/app/modules/` | **módulos** con páginas: `modules/<modulo>/{<modulo>.routes.ts, pages/<pagina>/<pagina>.component.ts}` (login/dashboards/reportes) | api-sdk, design system |
| `analytics/console/src/app/shared/` | design system + `layouts/` (shell de páginas con header/logo INTT) + reexport del `api-sdk` | lógica de negocio |
| `analytics/api-sdk/` | el cliente tipado generado (orval) | código escrito a mano |

WRITE RULE: el back-office NO accede a la base de datos desde los controladores; pasa por
use-cases → puertos → adaptadores. — MUST

WRITE RULE: `analytics/console` accede a datos SOLO por `analytics/api-sdk`. — MUST

WRITE RULE: la captura NO importa nada de `analytics/**`, y viceversa; el único acoplamiento es
la base de datos (esquema/rol). — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
