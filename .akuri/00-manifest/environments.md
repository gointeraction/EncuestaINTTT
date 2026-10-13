---
file: environments.md
doc-type: SPEC
level: L2
area: A2
position: 8
title: ENVIRONMENTS
summary: Dos entornos aislados (development/production) de EncuestaINTTT — configuración,
  base de datos, ruta de datos, proyecto de compose y política del seeder. Las pruebas y
  los datos simulados se ejecutan SOLO en development; production nunca se siembra ni se
  resetea.
category: 00-manifest
scope: the 00-manifest specification
---

# Entornos (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: fija DOS entornos aislados — `development` y `production` — para que las pruebas
(carga, volumen, datos simulados) corran sin riesgo sobre producción. El aislamiento es por
CONFIGURACIÓN, no por disciplina: distinta base de datos, distinta ruta de datos y distinto
proyecto de compose.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=DOCKER · TECH=DOCKER-COMPOSE · TECH=POSTGRESQL.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=SINGLE_PERIMETER (una entrada pública; el resto por red interna);
ARCH_PATTERN=CONFIG_PER_ENV (la misma imagen, distinta configuración por entorno).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-ENTORNOS

WRITE INFO: dos entornos, una sola imagen. Todo se parametriza por entorno:

| Entorno | `APP_ENV` | `POSTGRES_DB` | `PGDATA` (bind) | `COMPOSE_PROJECT_NAME` | Seed |
|---------|-----------|---------------|-----------------|------------------------|------|
| development | `development` | **`intt_encuesta_dev`** | `./db/postgres` (inspeccionable) | `encuesta-intt-dev` | **permitido** (`SEED_ALLOW=1`) |
| production | `production` | **`intt_encuesta`** | `./.data/production/postgres` (ruta fijada por DevOps) | `encuesta-intt-prod` | **prohibido** |

WRITE INFO: la consola, la API y la captura son la MISMA imagen en ambos entornos; solo cambian
`DATABASE_URL`, `POSTGRES_DB`, la ruta de datos y el proyecto de compose.

### SECTION 02-AISLAMIENTO

WRITE INFO: el aislamiento se logra así:

1. **Archivos de entorno separados** (NUNCA versionados): `.env.development` y `.env.production`.
2. **Base de datos distinta** por `POSTGRES_DB` (ver §01).
3. **Ruta de datos** por `PG_DATA_DIR` (bind mount; **dev** → `./db/postgres`, dentro del repo e
   inspeccionable; **prod** → la ruta que fije DevOps, relativa o absoluta), sin volumen compartido.
4. **Proyecto de compose distinto** por `COMPOSE_PROJECT_NAME` → contenedores, red y volúmenes
   con prefijo propio (dev y prod no se pisan aunque corran en el mismo host).
5. **PostgreSQL y Redis no se publican** al host (red `intt-internal`); ver `ports.md`.
6. **Perímetro de exposición**: sólo `vision-cero` (la encuesta) es la cara pública y la única
   publicada en el borde (`intt-edge`). Todo `analytics/` (back-office `api` y consola `admin`)
   es privado de intranet: sólo en `intt-internal`, sin unirse al borde.

WRITE RULE: la cara pública MUST ser sólo `vision-cero`; el back-office analítico (`analytics/`)
MUST NOT exponerse fuera de la intranet. — MUST

### SECTION 03-POLITICA-DEL-SEEDER

WRITE INFO: el seeder (instancia `encuestaintt-seed`, ver
`02-instance-pool/backend/encuestaintt-seed.md`) es DESTRUCTIVO (borra y recarga datos
simulados). Su política es:

WRITE RULE: el seeder MUST abortar si `APP_ENV != development` o si `SEED_ALLOW != 1`. — MUST

WRITE RULE: el seeder MUST verificar `SELECT current_database()` contra una allowlist de nombres
de base de datos de desarrollo (p.ej. `*_dev`) antes de borrar o escribir. — MUST

WRITE RULE: el servicio `seed` MUST existir SOLO en la pila de development (en producción el
tooling no está presente). — MUST

WRITE RULE: `production` MUST NOT sembrarse, resetearse ni exponer credenciales de seeder. — MUST

WRITE INFO: las pruebas de volumen y los datos simulados se ejecutan EXCLUSIVAMENTE en
`development`.

### SECTION 04-CAMBIOS

WRITE INFO: la asignación se aplica en: `compose.yaml` (parametrización de `db`/`cache`/`migrate`
y de la ruta de datos), `.env.development` / `.env.production` / `.env.example`, y
`analytics/seed/` (CLI del seeder con guardas). El `install.sh` de producción usa el entorno
`production`.

WRITE RULE: `.env` reales (con contraseñas) MUST NOT versionarse; se versiona `.env.example`. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la separación es válida cuando `docker compose --env-file .env.development config`
y `--env-file .env.production config` resuelven a bases de datos, rutas de datos y proyectos de
compose distintos, y cuando el seeder aborta fuera de `development`.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
