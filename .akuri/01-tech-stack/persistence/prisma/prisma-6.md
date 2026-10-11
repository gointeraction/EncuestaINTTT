---
file: prisma-6.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: PRISMA_6
summary: Prisma ORM 6 — the data-access layer of EncuestaINTTT. Schema of record
  (prisma/schema.prisma), typed client, transactional writes.
category: prisma
scope: the prisma specification
---

# Tech-Stack — Prisma 6 (persistence)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: Fill this form to produce a conforming tech-stack artifact.

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

WRITE INFO: > File: 01-tech-stack/persistence/prisma/prisma-6.md
> Produced by: how-to-write-a-tech-stack.template.md
> Level: L3

## Fields

1. **technology** — `persistence.prisma` — Prisma ORM, the data-access layer.

2. **major-version** — 6 — `prisma ^6.11.1`, `@prisma/client ^6.11.1` in `package.json`.

3. **layer** — persistence.

4. **scope-role** — schema of record for the operational entities; the generated typed client is the ONLY DB access path used by `src/lib/services/`.

5. **capabilities** — typed queries/`createMany`/`upsert`, `$transaction` for atomic multi-row writes, migrations (`prisma migrate`), `db push` for on-prem provisioning.

6. **depends-on** — `persistence.postgresql`.

7. **canonical-files** — `prisma/schema.prisma`, `prisma/migrations/**`, `src/lib/db.ts` (client singleton).

8. **compliance** — persistence: schema-of-record, transactional-write, unique-constraints, audit-fields (append-only `AuditLog`), privacy-hash (no raw IP/e-mail).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
