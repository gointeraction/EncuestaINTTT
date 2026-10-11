---
file: postgresql-prisma.md
doc-type: INSTANCE
level: L4
area: A2
position: 1
title: POSTGRESQL_PRISMA
summary: The EncuestaINTTT operational database — PostgreSQL 16 (intt_encuesta) accessed
  through Prisma 6, with the local JSON fallback stores.
layer: persistence
technology: postgresql
instance: PostgreSQL 16 database intt_encuesta accessed via Prisma 6, plus local JSON fallback.
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: prisma/
entry-point: vision-cero/prisma/schema.prisma
status: declared
ruleset: [encuestaintt-prisma]
---

# Instance Pool — postgresql-prisma (PostgreSQL 16 + Prisma 6 — REAL)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — the operational PostgreSQL 16 database `intt_encuesta` accessed via Prisma 6.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=REPOSITORY.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/persistence/postgresql-prisma.md
> Produced by: how-to-write-a-instance-pool.template.md
> Level: L4

## Fields

1. **instance** — the PostgreSQL 16 database `intt_encuesta` (user `intt_user`), accessed only
   through the Prisma 6 client singleton (`src/lib/db.ts`). Local fallback stores:
   `db/local_surveys.json` (via `local-survey-store.ts`) and `db/sqlite_backup.json` (stats fallback).

2. **repo-location** — schema + migrations in `EncuestaINTTT/vision-cero/prisma/`; the **running instance** is the
   `db` service of `compose.yaml`, with PGDATA colocated at `./.data/postgres` (bind mount, gitignored)
   and init scripts in `./db/init/`. Schema is synced by the one-shot `migrate` service
   (`prisma db push` by default). Local fallback stores remain `db/local_surveys.json` and
   `db/sqlite_backup.json`.

3. **entry-point** — `prisma/schema.prisma`; client connected in `src/lib/db.ts`.

4. **naming** — DB `intt_encuesta`, user `intt_user`; tables mapped snake_case via `@@map`
   (`users`, `surveys`, `questions`, `responses`, `answers`, `legacy_survey_responses`, …).

5. **version-reality** — `postgres:16-alpine` in `compose.yaml` (service `db`); `prisma ^6.11.1` in
   `package.json` — matches the L3 docs.

6. **independent-core** — single operational DB core; the JSON stores are resilience fallbacks,
   never a second source of truth.

## schema (declared)

- SDD: `User`, `Survey`, `Question`, `QuestionOption`, `Response`, `Answer`, `Invitation`, `AuditLog`.
- Visión Cero (legacy): `SurveyResponse`, `SurveySummary` (pre-aggregated CQRS read model, id `latest`).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
