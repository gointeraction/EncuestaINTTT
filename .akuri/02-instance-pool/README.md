---
file: README.md
doc-type: README
level: L2
area: A2
position: 1
title: README
summary: Index of the EncuestaINTTT instance pool — the concrete deployment of each
  declared technology (L3) in the repo, organized by physical layer: where it lives,
  how it is named, its entry points and which ruleset governs it.
---

# Instance Pool — EncuestaINTTT

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: This pool records the CONCRETE deployment of each declared technology (L3) in the
repo `EncuestaINTTT/`. Coherence: each instance doc matches the real repo; a mismatch is a model
bug fixed in A2, never by bending the code.

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

### SECTION 01-ACTIVE-INSTANCES

WRITE INFO: the ACTIVE instances (one codebase, multiple surfaces):

### frontend
- **encuestaintt-web** — see `frontend/encuestaintt-web.md`. Location `EncuestaINTTT/vision-cero/src/app/`;
  entry `src/app/layout.tsx` + `src/app/page.tsx`; the citizen portal, private dashboard and
  admin panel; talks to `backend.nextjs-api` (in-process route handlers).

### backend
- **encuestaintt-api** — see `backend/encuestaintt-api.md`. Location `EncuestaINTTT/vision-cero/src/app/api/`;
  entry per-resource `route.ts`; the API (legacy `/api/*` + SDD `/api/v1/*`); persistence via
  `persistence.postgresql` through `persistence.prisma`.

### persistence
- **postgresql-prisma** — see `persistence/postgresql-prisma.md`. Location `EncuestaINTTT/vision-cero/prisma/`
  (schema + migrations), database `intt_encuesta`; operational store. Local fallback:
  `db/local_surveys.json` + `db/sqlite_backup.json`.

### documentation
- **encuestaintt-docs** — see `documentation/encuestaintt-docs.md`. Location `EncuestaINTTT/docs/`
  (SDD, arquitectura, guía on-premises, sumarización) + `.akuri/docs/` (corpus funcional).

### SECTION 02-CHANGE-RULE

WRITE INFO: adding/renaming/removing any instance requires re-validating every feature that
references it (`used-by` is the impact index). When an instance doc is added/edited, re-run its
deterministic gate.

### SECTION 03-SINGLE-DEPLOYMENT-NOTE

WRITE INFO: EncuestaINTTT is a **single-repo, single-deployment** application delivered as ONE
`compose.yaml` (services `db` · `cache` · `migrate` · `app` · `proxy`). The frontend, the API and
the persistence run as containers on the same host; the "backend" is the Next.js server runtime.
PostgreSQL and Redis data live COLOCATED in `./.data/` (gitignored). The former host path
(Nginx + PM2 + native PostgreSQL) is OPTIONAL/legacy (`install.sh`).

WRITE INFO: el sistema corre en DOS entornos aislados — `development` y `production` — separados
por configuración (base de datos, ruta de datos y proyecto de compose distintos). Las pruebas y
el seeder (`encuestaintt-seed`) operan SOLO en `development`; ver `00-manifest/environments.md`.

### SECTION 04-PLANNED-INSTANCES

WRITE INFO: la capa analítica (ver `00-manifest/analytics-platform.md`) declara instancias
PLANNED que aún no existen en A3 — se materializan en las fases del plan:

| Instancia | Capa | Tecnología | Doc | Fase |
|-----------|------|-----------|-----|------|
| `encuestaintt-analytics-api` | backend | nestjs | `backend/encuestaintt-analytics-api.md` | F1 |
| `encuestaintt-admin` | frontend | angular | `frontend/encuestaintt-admin.md` | F2 |
| `encuestaintt-seed` | backend | nestjs | `backend/encuestaintt-seed.md` | F5 |

WRITE RULE: una instancia `planned` NO se construye sin actualizar su `status` y revalidar sus
gates; la captura (`encuestaintt-api`/`encuestaintt-web`) permanece sin cambios. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
