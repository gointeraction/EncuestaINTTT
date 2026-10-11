---
file: encuestaintt-analytics-api.md
doc-type: INSTANCE
level: L4
area: A2
position: 1
title: ENCUESTAINTTT_ANALYTICS_API
summary: (PLANNED) Backend NestJS del back-office analítico de EncuestaINTTT — API de
  analítica, reportería y acceso restringido. Lee el esquema public en solo-lectura y
  escribe el esquema analytics. Dueño de la identidad del personal.
layer: backend
technology: nestjs
instance: (PLANNED) Back-office NestJS — analítica, reportería y control de acceso restringido de EncuestaINTTT.
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: apps/analytics-api/
entry-point: apps/analytics-api/src/main.ts
status: planned
ruleset: [encuestaintt-nestjs-analytics]
---

# Instance Pool — encuestaintt-analytics-api (NestJS — PLANNED)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — el backend NestJS del back-office (analítica, reportería, acceso).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=HEXAGONAL; ARCH_PATTERN=CQRS (lectura).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=PORT_ADAPTER; DESIGN_PATTERN=READ_MODEL.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/backend/encuestaintt-analytics-api.md
> Produced by: how-to-write-a-instance-pool.template.md
> Level: L4 · status: PLANNED (F1 del plan en `00-manifest/analytics-platform.md`)

## Fields

1. **instance** — el back-office analítico de EncuestaINTTT: API de analítica, reportería y
   control de acceso restringido; dueño de la identidad del personal (admin/analista/auditor).

2. **repo-location** — `EncuestaINTTT/apps/analytics-api/` (monorepo aditivo; ver
   `00-manifest/source-layout.md`).

3. **entry-point** — `apps/analytics-api/src/main.ts`.

4. **naming** — módulos por supradominio (`platform`, `analytics`); endpoints bajo `/api`
   (back-office), expuestos SOLO a la consola y bajo Zero-Trust.

5. **version-reality** — NestJS 11 (a fijar en el scaffold); declarado en
   `01-tech-stack/backend/nestjs/nestjs-11.md`.

6. **independent-core** — núcleo independiente de la captura. Comparte PostgreSQL pero con
   **dueño de esquema distinto**: lee `public` con el rol `intt_analytics_ro` (solo-lectura) y
   escribe exclusivamente en `analytics`. Nunca importa código de la captura.

## boundaries (ver `00-manifest/analytics-platform.md`)

- **Escribe**: esquema `analytics` (read models `report_*`, estado de sumarización, identidad de
  staff, `access_audit`).
- **Lee**: esquema `public` (rol `intt_analytics_ro`).
- **Nunca**: escribe `public`; ejecuta lógica de captura; expone datos sin autorizar.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa; se materializa al iniciar la fase F1.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
