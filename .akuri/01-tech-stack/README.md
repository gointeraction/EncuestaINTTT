---
file: README.md
doc-type: README
level: L2
area: A2
position: 1
title: README
summary: Index of the EncuestaINTTT tech-stack — declares the engineering elements
  (element-ids) per layer (persistence, backend, frontend, infrastructure, security)
  and points to each L3 technology file. Versions read from the real repo.
---

# Tech-Stack — EncuestaINTTT

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: This index declares the engineering elements (element-ids) and points to each L3
technology file. Declared versions read from the real repo (`EncuestaINTTT/`).

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

### SECTION 01-STRUCTURE

WRITE INFO: each layer holds technologies; each technology is a **folder**; each version is a
**document** named `<tech>-<major>.md`:

```
01-tech-stack/
├── README.md                 ← declaration of elements (L2) + this index
├── persistence/              ← LAYER: prisma/ postgresql/ redis/
├── backend/                  ← LAYER: nextjs-api/ nestjs/ (back-office)
├── frontend/                 ← LAYER: nextjs/ react/ tailwind-shadcn/ zustand/ angular/ orval/
├── infrastructure/           ← LAYER: docker/ docker-compose/ nginx/ pm2/
└── security/                 ← LAYER: turnstile/
```

### SECTION 02-DECLARED-ELEMENTS

WRITE INFO: each element declared once, with its `element-id` as the binding key:

| element-id | layer | role / purpose |
|------------|-------|----------------|
| `frontend.nextjs.app` | frontend | Next.js 16 App Router application (RSC + client components) |
| `frontend.react.ui` | frontend | React 19 rendering runtime |
| `frontend.tailwind-shadcn` | frontend | Tailwind CSS v4 + shadcn/ui design system (new-york) |
| `frontend.zustand` | frontend | Client state management (survey answers, navigation) |
| `backend.nextjs-api` | backend | Next.js Route Handlers (`src/app/api/**/route.ts`) — capa de CAPTURA |
| `backend.nestjs.analytics` | backend | (planned) NestJS 12 — back-office analítico/reportería/acceso (ver `analytics-platform.md`) |
| `frontend.angular.admin` | frontend | (planned) Angular 22 — consola de análisis y auth del personal |
| `library.orval` | frontend | (planned) generador del `api-sdk` desde el OpenAPI del back-office |
| `persistence.prisma` | persistence | Prisma ORM 6 (schema of record, transactional client) |
| `persistence.postgresql` | persistence | PostgreSQL 16/18 operational DB (`@db.Text` JSON) |
| `persistence.redis` | persistence | Redis 7 cache + rate-limit store (declared in docker-compose) |
| `infrastructure.docker` | infrastructure | App container image (multi-stage Dockerfile → Next.js standalone) |
| `infrastructure.docker-compose` | infrastructure | **SSOT of the deployment** — one `compose.yaml` (db · cache · migrate · app · proxy), data colocated in `./.data/` |
| `infrastructure.nginx` | infrastructure | Nginx 1.24+ reverse proxy in-compose (Brotli/Gzip, Zero-Trust, rate-limit) |
| `infrastructure.pm2` | infrastructure | PM2 v5 cluster — **optional/legacy** (superseded by the container runtime) |
| `security.turnstile` | security | Cloudflare Turnstile + Honeypot + IP rate-limit (anti-bot) |

### SECTION 03-CHANGE-RULE

WRITE INFO: adding or removing ANY element requires re-validating EVERY feature that lists it in
its dependencies. Reads real versions from the repo (declared = built): Next.js 16, React 19,
TypeScript 5, Tailwind v4, Zustand 5, Prisma 6, PostgreSQL 16, Redis 7, Nginx 1.24, PM2 5.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
