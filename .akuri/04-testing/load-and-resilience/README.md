---
file: README.md
doc-type: README
level: L2
area: A2
position: 0
title: ENCUESTAINTTT_LOAD_RESILIENCE
summary: Load-and-resilience instruction set for the EncuestaINTTT API (Nest-free
  Next.js route handlers). Declares protocol, endpoints and thresholds, and points to
  the A3 deterministic tests.
---

# EncuestaINTTT — Load & Resilience

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Measure real capacity of the EncuestaINTTT submission path under campaign peaks,
and verify the hybrid-persistence resilience (PostgreSQL outage → local fallback).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=TYPESCRIPT · TECH=PYTHON (gate) · TECH=NGINX/PM2.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: Instructions to run load tests on the public submission endpoint and the read
dashboard, and to verify the fallback path.

## Instruction set

| # | Document | What it declares |
|---|----------|------------------|
| 01 | [01-load-test-protocol.md](./01-load-test-protocol.md) | The protocol |
| 02 | [02-endpoint-inventory.md](./02-endpoint-inventory.md) | Endpoint catalog |
| 03 | [03-thresholds-and-verdict.md](./03-thresholds-and-verdict.md) | Thresholds and verdict |

## Deterministic tool

- `deterministic/check.py` — set gate.

## How to read it

1. To **understand scope** → this README.
2. To **run** → `01` (protocol) → `03` (thresholds).
3. For **specific endpoints** → `02`.
4. To **verify A2=A3** → `deterministic/check.py`.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
