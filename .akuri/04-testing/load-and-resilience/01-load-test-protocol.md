---
file: 01-load-test-protocol.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: 01_LOAD_TEST_PROTOCOL
summary: The load/capacity test protocol for EncuestaINTTT — prerequisites, the
  submission and read scenarios, steps and verdict, aligned to NFR-1..NFR-8.
category: 04-testing
scope: the load-and-resilience instruction set
---

# 01 — Load Test Protocol

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: declares how to run capacity and resilience tests against the EncuestaINTTT API and
how to decide the verdict.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=TYPESCRIPT (scripts) · TECH=PYTHON (gate) · TECH=NGINX/PM2/POSTGRESQL.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-PREREQUISITES

WRITE INFO: prerequisites: a running stack (PostgreSQL + Redis via `docker-compose up -d`, the
app via `npm run dev` or `npm run build && npm start`), a valid `TURNSTILE_SECRET_KEY` test key,
and a seeded survey.

### SECTION 02-SCENARIOS

WRITE INFO: the scenarios are:
- **S1 — public submission:** `POST /api/survey/submit` at steady rate, verifying p95 < 800 ms
  and no data loss (count == persisted rows).
- **S2 — SDD response ingestion:** `POST /api/v1/public/surveys/[slug]/responses` including 422 on
  invalid answers.
- **S3 — read dashboard:** `GET /api/survey/stats` served from the pre-aggregated summary (O(1)).
- **S4 — resilience:** stop PostgreSQL and assert the app falls back to `db/local_surveys.json` /
  `db/sqlite_backup.json` without 500.

### SECTION 03-STEPS

WRITE INFO: the steps are:
1. Provision and wait for readiness (`/api` root returns 200).
2. Seed a survey (`POST /api/survey/seed`).
3. Ramp S1 up to the target TPS; record p95 latency and error rate.
4. Run S2 and assert validation behaviour (422/409/429/403).
5. Run S3 repeatedly; assert constant, low latency.
6. Run S4: stop the DB, repeat S1/S3, assert graceful fallback, restart the DB.

### SECTION 04-VERDICT

WRITE INFO: the verdict is PASS when every threshold in `03-thresholds-and-verdict.md` holds;
FAIL otherwise, naming the scenario and the metric.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the protocol is closed when `deterministic/check.py` passes and the declared A3
scripts exist.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
