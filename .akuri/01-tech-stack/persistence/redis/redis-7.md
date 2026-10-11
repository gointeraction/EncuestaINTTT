---
file: redis-7.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: REDIS_7
summary: Redis 7 — declared cache and rate-limit store of EncuestaINTTT (statistics
  cache and anti-spam counters); provisioned via docker-compose.
category: redis
scope: the redis specification
---

# Tech-Stack — Redis 7 (persistence)

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

WRITE INFO: > File: 01-tech-stack/persistence/redis/redis-7.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `persistence.redis` — Redis, the in-memory cache / rate-limit store.

2. **major-version** — 7 — `redis:7-alpine` in `docker-compose.yml` (port 6379).

3. **layer** — persistence.

4. **scope-role** — runs as the `cache` service of the compose stack (appendonly persistence in `./.data/redis`); declared as the cache for dashboard statistics and shared rate-limit store. In the current A3 the rate-limit is still in-process (`lib/rate-limit.ts`), so Redis runs but is not yet wired.

5. **capabilities** — key TTLs, atomic counters (INCR) for rate-limit windows, cache of the pre-aggregated stats.

6. **depends-on** — `infrastructure.docker-compose` (`cache` service); consumed by `lib/rate-limit.ts` (target) and the stats path (target).

7. **canonical-files** — `compose.yaml` (cache service).

8. **compliance** — persistence: cache-is-not-source-of-truth (I6); when wired, the DB remains authoritative.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
