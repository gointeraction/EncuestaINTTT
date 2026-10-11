---
file: encuestaintt-admin.md
doc-type: INSTANCE
level: L4
area: A2
position: 1
title: ENCUESTAINTTT_ADMIN
summary: (PLANNED) Consola Angular del personal autorizado de EncuestaINTTT — análisis,
  reportería, exportación y autenticación de staff. Consume el back-office solo por el
  api-sdk generado.
layer: frontend
technology: angular
instance: (PLANNED) Consola Angular de análisis y autenticación del personal (back-office).
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: apps/admin-web/
entry-point: apps/admin-web/src/main.ts
status: planned
ruleset: [encuestaintt-angular-admin]
---

# Instance Pool — encuestaintt-admin (Angular — PLANNED)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — la consola Angular del personal autorizado (análisis y auth).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=STANDALONE_COMPONENTS.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=API_SDK_ONLY; DESIGN_PATTERN=GUARD.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/frontend/encuestaintt-admin.md
> Produced by: how-to-write-a-instance-pool.template.md
> Level: L4 · status: PLANNED (F2+ del plan en `00-manifest/analytics-platform.md`)

## Fields

1. **instance** — la consola de análisis y autenticación del personal: login de staff,
   dashboards, reportes y exportación.

2. **repo-location** — `EncuestaINTTT/apps/admin-web/` (monorepo aditivo).

3. **entry-point** — `apps/admin-web/src/main.ts`.

4. **naming** — app `admin-web`; páginas bajo `src/app/modules/` (login, dashboard, reports).

5. **version-reality** — Angular (última estable, a fijar en el scaffold); declarado en
   `01-tech-stack/frontend/angular/angular.md`.

6. **independent-core** — núcleo independiente; NO consulta la base de datos. Habla con el
   back-office SOLO por `packages/api-sdk` (generado por orval desde el OpenAPI).

## boundaries (ver `00-manifest/analytics-platform.md`)

- **Consume**: `backend.nestjs.analytics` vía `library.orval` (api-sdk).
- **Nunca**: accede a la BD; accede a la captura; renderiza PII no autorizada (el enmascaramiento
  es server-side).

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa; se materializa al iniciar la fase F2.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
