---
file: docker-compose.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: DOCKER_COMPOSE
summary: Docker Compose — the SINGLE unit of deployment of EncuestaINTTT. One
  `compose.yaml` runs db (PostgreSQL 16) · cache (Redis 7) · migrate (one-shot Prisma)
  · app (Next.js standalone) · proxy (Nginx), with data colocated in ./.data/.
category: docker-compose
scope: the docker-compose specification
---

# Tech-Stack — Docker Compose (infrastructure)

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

WRITE INFO: > File: 01-tech-stack/infrastructure/docker-compose/docker-compose.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `infrastructure.docker-compose` — the deployment orchestrator of the whole stack.

2. **major-version** — Compose spec — `compose.yaml` at the repo root (single file; supersedes the former `docker-compose.yml`).

3. **layer** — infrastructure.

4. **scope-role** — declares the FIVE services: `db` (PostgreSQL 16, tuned), `cache` (Redis 7), `migrate` (one-shot Prisma schema sync), `app` (Next.js 16 standalone), `proxy` (Nginx). The stack is self-contained and fully decoupled: `docker compose up -d --build` brings the whole system up.

5. **capabilities** — healthchecks + `depends_on` ordering (`migrate` waits for `db` healthy; `app` waits for `migrate` to complete; `proxy` fronts `app`); two networks (`intt-internal` for data/app, `intt-edge` for the proxy); env-driven config via `.env`.

6. **depends-on** — `infrastructure.docker` (app + migrator images), `infrastructure.nginx` (proxy).

7. **canonical-files** — `compose.yaml`, `.env` (from `.env.example`), `Dockerfile`, `deploy/migrate-entrypoint.sh`, `deploy/nginx/default.conf`.

8. **compliance** — infrastructure: **single-source-of-deployment** (one compose), data-colocated (`./.data/` bind mounts, gitignored), internal-only DB/Redis (no host ports), migrate-before-app, declared-config (everything from `.env`).

## Data location (colocated with the repo)

| Service | Volume | Host path |
|---------|--------|-----------|
| `db` | `/var/lib/postgresql/data` | `./.data/postgres` |
| `cache` | `/data` | `./.data/redis` |
| `app` | `/app/db` (fallback store) | `./db` |

`.data/` is gitignored: the database travels with the repo folder but is never committed. To move or copy the whole system, copy the repo including `./.data/`.

## Operations

```bash
cp .env.example .env      # once; set POSTGRES_PASSWORD and Admin/Turnstile secrets
docker compose up -d --build
docker compose logs -f app
docker compose down        # keeps ./.data (add -v to wipe)
```

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
