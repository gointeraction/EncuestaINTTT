---
file: 02-endpoint-inventory.md
doc-type: SPEC
level: L2
area: A2
position: 2
title: 02_ENDPOINT_INVENTORY
summary: Catalog of EncuestaINTTT endpoints under test (public and admin), with
  expected status codes for the load scenarios.
category: 04-testing
scope: the load-and-resilience instruction set
---

# 02 — Endpoint Inventory

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: catalogs the endpoints exercised by the load scenarios and their expected status.

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

### SECTION 01-PUBLIC

WRITE INFO: public endpoints:

| Endpoint | Method | Expected |
|----------|--------|----------|
| `/api` | GET | 200 (readiness) |
| `/api/survey/submit` | POST | 200 ok / 400 missing / 403 turnstile / 409 duplicate cédula / 429 rate-limited |
| `/api/v1/public/surveys/[slug]` | GET | 200 / 404 |
| `/api/v1/public/surveys/[slug]/responses` | POST | 201 / 422 invalid answers |

### SECTION 02-ADMIN

WRITE INFO: admin endpoints (intranet/VPN; 403 from public via Nginx):

| Endpoint | Method | Expected |
|----------|--------|----------|
| `/api/admin/login` | POST | 200 / 401 wrong password |
| `/api/admin/session` | GET | 200 authenticated / 401 |
| `/api/admin/logout` | POST | 200 |
| `/api/survey/stats` | GET | 200 (precomputed or live) / 401 |
| `/api/survey/participants` | GET | 200 / 401 |
| `/api/v1/surveys/**` | GET/POST/PATCH/DELETE | 200/201 / 401 / 403 |

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the inventory matches the real route handlers under `src/app/api/`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
