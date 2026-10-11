---
file: docker.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: DOCKER
summary: Docker — the application image of EncuestaINTTT: a multi-stage Dockerfile that
  builds the Next.js 16 standalone server plus a one-shot migrator (Prisma CLI + tsx).
category: docker
scope: the docker specification
---

# Tech-Stack — Docker (infrastructure)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=MULTI_STAGE_BUILD.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 01-tech-stack/infrastructure/docker/docker.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `infrastructure.docker` — the container image(s) of the application.

2. **major-version** — Docker 29 (BuildKit); base image `node:24-bookworm-slim` (Node 24 — required to build this Next 16.3 / React 19.3 app; Node 22 fails at prerender).

3. **layer** — infrastructure.

4. **scope-role** — one Dockerfile, two targets: `runner` (the Next.js standalone app) and `migrator` (one-shot schema sync with the Prisma CLI + `tsx`).

5. **capabilities** — multi-stage (base → deps → builder → runner | migrator); non-root user (`nextjs`); Prisma engine copied into the runner; `NEXT_PUBLIC_*` inlined via build args; `.dockerignore` keeps the context small.

6. **depends-on** — `backend.nextjs-api`, `persistence.prisma`, `frontend.nextjs.app`.

7. **canonical-files** — `Dockerfile`, `.dockerignore`, `deploy/migrate-entrypoint.sh`.

8. **compliance** — infrastructure: non-root-runtime, reproducible-lockfile (`npm ci` + `package-lock.json`), no-secrets-in-image (env at runtime), single-source-of-build-args (from compose).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes; verify with `docker build --check .`
and `docker compose build`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
