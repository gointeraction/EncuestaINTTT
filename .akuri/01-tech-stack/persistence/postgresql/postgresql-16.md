---
file: postgresql-16.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: POSTGRESQL_16
summary: PostgreSQL 16/18 — the operational database of EncuestaINTTT, with @db.Text
  columns for JSON payloads and JSONB-capable storage; sized for 1M responses.
category: postgresql
scope: the postgresql specification
---

# Tech-Stack — PostgreSQL 16 (persistence)

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

WRITE INFO: > File: 01-tech-stack/persistence/postgresql/postgresql-16.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `persistence.postgresql` — PostgreSQL, the operational relational DB.

2. **major-version** — 16 — `postgres:16-alpine` in `docker-compose.yml`; target production 16/18.

3. **layer** — persistence.

4. **scope-role** — durable storage of surveys/responses/answers and the pre-aggregated `SurveySummary`; `@db.Text` for JSON payloads (`answers`, `summaryData`, `device`, `payload`).

5. **capabilities** — ACID transactions, unique constraints (anti-fraud, `(responseId, questionId)`), indexes on hot predicates (`surveyId,status`, `cedula`, `completedAt`), tuned `shared_buffers`/`max_connections`/`random_page_cost`.

6. **depends-on** — reached via `persistence.prisma`.

7. **canonical-files** — `docker-compose.yml` (postgres service), `prisma/schema.prisma` (`@@map`/`@db.Text`), `install.sh` (provision + `postgresql.conf` tuning).

8. **compliance** — persistence: schema-of-record, index-on-hot-predicate, transactional-write, no-raw-pii (hashes only).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
