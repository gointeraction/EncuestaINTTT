---
file: encuestaintt-seed.md
doc-type: INSTANCE
level: L4
area: A2
position: 3
title: ENCUESTAINTTT_SEED
summary: (PLANNED) Seeder NestJS del back-office analítico — siembra, resetea y recarga datos
  simulados (incluida carga masiva por CSV) SOLO en el entorno `development`. Independiente de
  la captura y del back-office; no forma parte del perímetro público.
layer: backend
technology: nestjs
instance: (PLANNED) Seeder NestJS — datos simulados y de volumen para las pruebas del back-office.
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
path: analytics/seed/
entry-point: analytics/seed/src/main.ts
status: declared
ruleset: [encuestaintt-nestjs-analytics]
---

# Instance Pool — encuestaintt-seed (NestJS — PLANNED)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: 1. **instance** — el seeder de datos simulados: siembra, borra y recarga datos en la
base de datos de desarrollo para ejercitar el back-office y las pruebas de volumen.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS (aplicación STANDALONE, sin HTTP) · TECH=POSTGRESQL · TECH=CSV.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CLI_APPLICATION (sin servidor HTTP); ARCH_PATTERN=PORT_ADAPTER
(entrada = comandos; salida = base de datos).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=BULK_COPY (carga masiva por `COPY`); DESIGN_PATTERN=DETERMINISTIC_RNG
(semilla fija para reproducibilidad).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 02-instance-pool/backend/encuestaintt-seed.md
> Level: L4 · status: DECLARED

WRITE INFO: es una aplicación NestJS **standalone** (`NestFactory.createApplicationContext`, sin
`listen()`): su entrada son COMANDOS, no rutas. Vive en `analytics/seed/` (separada de
`analytics/api` y `analytics/console`).

## Fields

1. **instance** — seeder de datos simulados de EncuestaINTTT: `seed`, `reset`, `generate`,
   `summarize`.

2. **repo-location** — `EncuestaINTTT/analytics/seed/` (bounded context de pruebas; ver
   `00-manifest/source-layout.md`).

3. **entry-point** — `analytics/seed/src/main.ts` (CLI).

4. **naming** — comandos por acción (`seed`, `reset`, `generate`, `summarize`); perfiles de
   volumen `small|medium|large|xl` (`--profile`).

5. **version-reality** — NestJS 12 (misma versión que `analytics/api`), Prisma/pg para el acceso
   a datos.

6. **independent-core** — núcleo independiente: NO forma parte de la captura ni del
   back-office; NO está en el perímetro público; NO se despliega en producción.

## boundaries (ver `00-manifest/environments.md`)

- **Siembra (escribe)**: SOLO la base de datos de `development` (`intt_encuesta_dev`); tablas de
  la captura que alimentan la reportería (p.ej. `public.survey*`, `public.*responses`,
  `public.answers`) y, opcionalmente, ejecuta la sumarización para poblar los read models
  `analytics.global_dashboard` / `analytics.survey_summary_report`.
- **Borra (reset)**: SOLO las tablas sembradas, en orden de dependencias (`TRUNCATE`), en
  `development`.
- **Lee**: esquema de captura para conocer la forma esperada y el `api-sdk` para los contratos.
- **Nunca**: escribe en `production`; se publica al host; corre sin las guardas de entorno;
  commitea CSV de gran volumen.

## Datos y volumen

- **Fixtures** (muestras pequeñas, deterministas) versionados en git.
- **Generador** de CSV por RNG con semilla fija (`--seed <n>`, `--rows <n>`, `--profile <p>`) que
  escribe en `analytics/seed/data/` (GITIGNORED salvo fixtures).
- **Carga masiva** por `COPY ... FROM STDIN` (no inserts fila-a-fila) para millones de filas.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this
  guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa; se materializa al iniciar la fase del plan
en `00-manifest/analytics-platform.md`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
