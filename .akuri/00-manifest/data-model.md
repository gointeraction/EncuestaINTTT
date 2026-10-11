---
file: data-model.md
doc-type: SPEC
level: L2
area: A2
position: 4
title: DATA_MODEL
summary: The EncuestaINTTT domain model — two coexisting generations (SDD v1.2 for
  dynamic multi-survey management and the legacy "Visión Cero" store), their entities,
  invariants, privacy rules and the hybrid-persistence fallback.
category: 00-manifest
scope: the 00-manifest specification
---

# Data Model — EncuestaINTTT (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: This declares WHAT data the system owns, its invariants and privacy rules.
The schema of record is `prisma/schema.prisma` (A3); this document fixes the MEANING.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=PRISMA (schema) · TECH=POSTGRESQL 16 (`@db.Text` for JSON) · TECH=ZUSTAND (client drafts).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CQRS (write path + pre-aggregated read model `SurveySummary`).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REPOSITORY (services wrap the Prisma client).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-TWO-GENERATIONS

WRITE INFO: the project coexists two data generations (coherence MUST hold between them):

| Generation | Purpose | Models |
|------------|---------|--------|
| **SDD v1.2** (dynamic) | multiple independent surveys with CRUD, access modes, analytics | `User`, `Survey`, `Question`, `QuestionOption`, `Response`, `Answer`, `Invitation`, `AuditLog` |
| **Visión Cero (legacy)** | the single "Visión Cero" survey + raffle + fast dashboard | `SurveyResponse`, `SurveySummary` |

### SECTION 02-SDD-ENTITIES

WRITE INFO: the SDD entities and key fields:

| Entity | Owns | Key fields |
|--------|------|-----------|
| `User` | administrative identity (RBAC) | `email` (unique), `passwordHash`, `role` (`admin`/`creator`/`analyst`) |
| `Survey` | one survey + lifecycle | `slug`/`shortCode` (unique), `status` (`draft`→`published`→`closed`→`archived`), `accessMode`, `allowPartial`, `maxResponses`, `startsAt`/`endsAt`, `consentText` |
| `Question` | one question | `type` (8 kinds), `required`, `position`, `validationRules` (JSON), `branchingRules` (JSON) |
| `QuestionOption` | an option of a choice question | `label`, `value`, `position` |
| `Response` | one survey submission | `respondentToken`, `emailHash`, `status`, `device` (JSON), `channel`, `ipHash` |
| `Answer` | one answer | `valueText`/`valueNumeric`/`valueOptions` (JSON), unique `(responseId, questionId)` |
| `Invitation` | one single-use invitation token | `token` (unique), `email`, `status` (`pending`/`used`/`expired`) |
| `AuditLog` | append-only administrative audit | `actorId`, `action`, `entityType`, `entityId`, `payload` (JSON) |

### SECTION 03-VISION-CERO-ENTITIES

WRITE INFO: the legacy "Visión Cero" entities:

| Entity | Owns | Key fields |
|--------|------|-----------|
| `SurveyResponse` | one citizen submission of the Visión Cero survey | `driverType`, `answers` (`@db.Text` JSON), `participaSorteo`, `nombre`, `cedula`, `telefono`, `codigoSorteo` |
| `SurveySummary` | the pre-aggregated read model (CQRS) | `id="latest"`, `calculatedAt`, `totalCount`, `summaryData` (`@db.Text` JSON, ~46 metrics) |

### SECTION 04-INVARIANTS

WRITE INFO: invariants (each MUST hold):

- **I1 — Transactional write.** A `Response` and all its `Answer` rows are written together
  in a `$transaction`, or not at all. — MUST
- **I2 — One answer per question per response.** Enforced by `@@unique([responseId, questionId])`. — MUST
- **I3 — Raffle uniqueness.** A `cedula` participates at most once (`cedulaYaParticipa`). — MUST
- **I4 — Server-side validation.** Every answer is validated against its question rules before
  persistence; failure → HTTP 422. — MUST
- **I5 — Append-only audit.** `AuditLog` is never mutated or deleted. — MUST
- **I6 — Read model is derived.** `SurveySummary` is a cache computed from `SurveyResponse`;
  it is never the source of truth. — MUST

### SECTION 05-PRIVACY

WRITE INFO: privacy rules (NFR-7):

- The IP is stored only as `ipHash` = SHA-256 + rotating daily salt (`services/ip-hash.ts`); the
  raw IP is never persisted. — MUST
- `emailHash` stores a hash of the respondent e-mail, never the plain address. — MUST
- CSV/XLSX exports mask PII irreversibly by default (`mask_pii: true`) for roles Analyst/Creator;
  unmasked export is Admin-only (`export-service.ts`). — MUST

### SECTION 06-HYBRID-PERSISTENCE

WRITE INFO: fallback (NFR-8, D-5): when PostgreSQL is unavailable, the app falls back to a local
structured store (`db/local_surveys.json` via `local-survey-store.ts`) and the dashboard falls
back to `db/sqlite_backup.json`. The fallback is resilience, not a second source of truth: when
PostgreSQL returns, it is authoritative again. — MUST

### SECTION 07-TWO-SCHEMAS

WRITE INFO: con la capa analítica (ver `analytics-platform.md`) el modelo se parte en DOS esquemas
dentro de la misma instancia PostgreSQL, cada uno con dueño y mecanismo de acceso propios:

| Esquema | Fuente de verdad de | Dueño (escritura) | Acceso del otro lado |
|---------|---------------------|-------------------|----------------------|
| `public` | captura: `User`, `Survey`, `Question`, `Response`, `Answer`, `Invitation`, `AuditLog`, `legacy_survey_*` | Captura (Next.js / Prisma) | back-office: SOLO LECTURA (`intt_analytics`) |
| `analytics` | derivados: `report_*` / read models, estado de sumarización, identidad de staff, `access_audit` | Back-office (NestJS) | ninguno (privado del back-office) |

WRITE INFO: cada esquema tiene su PROPIA capa de acceso (Prisma) y su rol de BD:
  - **Captura**: `EncuestaINTTT/vision-cero/prisma/schema.prisma` (datasource `public`) con el rol `intt_user`
    (dueño); sus migraciones gobiernan `public`.
  - **Back-office**: `analytics/api/prisma/schema.prisma` (propio, `multiSchema`); sus migraciones
    gobiernan SOLO `analytics`. El acceso a `public` se hace con un rol de solo lectura
    (`intt_analytics`: `USAGE` + `SELECT`) o, preferido, mediante **vistas de solo lectura en
    `analytics`** sobre `public` (mantiene limpias las migraciones del back-office). El back-office
    NO comparte el esquema Prisma de la captura.

WRITE RULE: `public` es escrito ÚNICAMENTE por la captura; `analytics` ÚNICAMENTE por el
back-office. — MUST

WRITE RULE: los datos de `analytics` son DERIVADOS de `public` y nunca su fuente de verdad; se
recomputan (I6 se extiende a todo el esquema `analytics`). — MUST

WRITE RULE: el enmascaramiento de PII (`access_audit`, exportaciones) es responsabilidad del
back-office y se aplica en el servidor, nunca en el cliente. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes and the model matches `prisma/schema.prisma`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
