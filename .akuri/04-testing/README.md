---
file: README.md
doc-type: README
level: L2
area: A2
position: 0
title: ENCUESTAINTTT_TESTING
summary: Index of the testing instruction set of EncuestaINTTT — load/capacity and
  resilience of the Next.js API. Declares the protocol, the endpoint inventory and the
  thresholds, and points to the real A3 deterministic tests.
---

# EncuestaINTTT — Testing (04-testing)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Instructions to run capacity/load and resilience tests against the EncuestaINTTT
API, verifying the NFRs (1M responses in 15 days; 30–50 TPS; 350–600 RPS; p95 < 800 ms).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=PYTHON (gates) · TECH=TYPESCRIPT (A3 scripts) · TECH=NGINX/PM2 (edge + cluster).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: NONE here.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: A2 **declares**; A3 **builds**. This set declares the protocol and verifies that
reality (the tests in `EncuestaINTTT/scripts/`) matches the declaration. On mismatch, fix A2 —
never bend A3.

## Instruction set

| # | Document | What it declares |
|---|----------|------------------|
| 01 | `load-and-resilience/01-load-test-protocol.md` | The protocol: purpose, prerequisites, steps, verdict |
| 02 | `load-and-resilience/02-endpoint-inventory.md` | Endpoint catalog and expected status |
| 03 | `load-and-resilience/03-thresholds-and-verdict.md` | Thresholds, report format and verdict |

## Deterministic tools

- `load-and-resilience/deterministic/check.py` — set gate: frontmatter + structure + A2↔A3 coherence.

## Source of truth (A3)

| Artifact | Path |
|----------|------|
| Deterministic functional tests | `EncuestaINTTT/scripts/test-*.ts` |
| End-to-end journey | `EncuestaINTTT/scripts/test-e2e-journey.ts` |
| Summarization batch | `EncuestaINTTT/scripts/summarize.ts` |

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
