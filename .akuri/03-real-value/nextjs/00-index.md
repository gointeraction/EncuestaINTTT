---
file: 00-index.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: 00_INDEX
summary: Non-technical guide to every capability of the EncuestaINTTT backend
  (Next.js route handlers + services) — index of the capability files.
category: nextjs
scope: the nextjs specification
---

# EncuestaINTTT — Capabilities Index

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Non-technical guide to every capability in the EncuestaINTTT backend. Each file
explains what the capability does, how it is implemented, and why it matters.

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

### SECTION 01-HOW-TO-READ

WRITE INFO: each capability file follows a consistent structure: what it is, what it does, how
it is implemented, why it matters, technical reasons.

### SECTION 02-INDEX

WRITE INFO: the capability groups are:

## Survey ingestion (Visión Cero)

| # | Capability | Summary |
|---|-----------|---------|
| 01 | Adaptive survey engine | `driverType` + `showIf`/`appliesTo` drive 22–51 questions per respondent |
| 02 | Geographic question | Dependent Estado/Municipio selector (24 federal entities) |
| 03 | Submission pipeline | 4-layer anti-bot → validate → transactional persist → code |

## Surveys management (SDD v1.2)

| # | Capability | Summary |
|---|-----------|---------|
| 04 | Survey CRUD + lifecycle | create/list/update/delete, publish/close/archive, slug + shortCode + QR |
| 05 | Question designer | 8 question types, validation rules, reorder, branching |
| 06 | Respondent eligibility | 4 access modes (anonymous/email/invitation/whitelist) validated before showing questions |
| 07 | Response ingestion | strict server-side validation (422), transactional write, duplicate prevention |
| 08 | Per-survey analytics | question-by-question breakdown (bars, weighted average, recent comments) |
| 09 | CSV export | RFC 4180 + UTF-8 BOM, PII masking for analyst/creator |

## Analytics & incentives

| # | Capability | Summary |
|---|-----------|---------|
| 10 | CQRS summarization | pre-aggregated `SurveySummary` (~46 metrics) for O(1) dashboard reads |
| 11 | Dashboard KPIs | 8 KPI cards + 6 radial perception indicators + 8 thematic modules |
| 12 | Incentive raffle | cédula/phone validation, uniqueness, unique participation code |
| 13 | Participants management | exported/inspectable official raffle list |

## Platform

| # | Capability | Summary |
|---|-----------|---------|
| 14 | Admin authentication | HMAC cookie + JWT cookie, interoperable |
| 15 | RBAC | `admin`/`creator`/`analyst`, `requireAuth`/`requireRoles` |
| 16 | Audit log | append-only `AuditLog` for every admin action |
| 17 | Anti-bot defence | Turnstile + Honeypot + rate-limit |
| 18 | Privacy hashing | SHA-256 + daily salt for IP/e-mail |
| 19 | Hybrid persistence | PostgreSQL with automatic local-store fallback |

### SECTION 03-RELATED

WRITE INFO: see `CAPABILITIES.md` in this folder for the status matrix.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
