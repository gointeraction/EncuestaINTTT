---
file: 03-thresholds-and-verdict.md
doc-type: SPEC
level: L2
area: A2
position: 3
title: 03_THRESHOLDS_AND_VERDICT
summary: Thresholds, report format and verdict for the EncuestaINTTT load tests, mapped
  to NFR-1..NFR-8.
category: 04-testing
scope: the load-and-resilience instruction set
---

# 03 — Thresholds and Verdict

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: fixes the numeric thresholds and the report format that decide PASS/FAIL.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=TYPESCRIPT · TECH=PYTHON.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-THRESHOLDS

WRITE INFO: thresholds (NFR-1..NFR-8):

| ID | Metric | Threshold |
|----|--------|-----------|
| T1 | Submission throughput | sustained 30–50 TPS, zero data loss |
| T2 | Edge throughput | 350–600 RPS at Nginx |
| T3 | Persistence latency | p95 < 800 ms |
| T4 | Dashboard read latency | < 5 ms from pre-aggregated summary |
| T5 | Availability | 99.9% uptime during the window |
| T6 | Error rate | < 0.1% 5xx under peak |
| T7 | Resilience | fallback path serves without 5xx when PostgreSQL is down |

### SECTION 02-REPORT

WRITE INFO: the report format is:

```
scenario | TPS/RPS | p95(ms) | errors% | verdict
```

### SECTION 03-VERDICT

WRITE INFO: VERDICT = PASS when T1..T7 hold; FAIL otherwise, naming the failed threshold.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document is closed when `deterministic/check.py` passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
