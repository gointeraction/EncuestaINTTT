---
file: seed-and-test-data.md
doc-type: SPEC
level: L3
area: A2
position: 1
title: SEED_AND_TEST_DATA
summary: Protocolo para sembrar, resetear y recargar datos simulados del back-office con el
  seeder NestJS (`analytics/seed`), por perfiles de volumen y SIEMPRE en el entorno
  `development`. Declara los comandos, las guardas y el veredicto.
category: 04-testing
scope: the 04-testing specification set
---

# Seed y datos de prueba (L3)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: declara cómo alimentar el back-office con datos simulados (incluida carga masiva por
CSV) para probar KPI, reportería y volúmenes grandes, pudiendo borrar y recargar. Es un protocolo
de PRUEBAS: se ejecuta SOLO en el entorno `development` (ver `00-manifest/environments.md`).

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NESTJS (standalone CLI) · TECH=POSTGRESQL · TECH=CSV.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=CLI_APPLICATION; ARCH_PATTERN=CONFIG_PER_ENV.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=BULK_COPY; DESIGN_PATTERN=DETERMINISTIC_RNG.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-PREREQUISITES

WRITE INFO: base de datos de desarrollo levantada (`docker compose --env-file .env.development
up -d db`) con migraciones aplicadas (`migrate`), y `APP_ENV=development` + `SEED_ALLOW=1`.

### SECTION 02-COMMANDS

WRITE INFO: el seeder expone cuatro comandos (instancia `encuestaintt-seed`):

| Comando | Efecto |
|---------|--------|
| `generate` | genera CSV en `analytics/seed/data/` (gitignored) según perfil/semilla |
| `seed` | carga los datos (por `COPY`) en la BD de desarrollo |
| `reset` | `TRUNCATE` de las tablas sembradas, en orden de dependencias |
| `summarize` | dispara la sumarización para poblar los read models del back-office |

WRITE INFO: ejemplos:

```
docker compose run --rm seed seed      --profile large --seed 42
docker compose run --rm seed reset
docker compose run --rm seed seed      --profile small
```

### SECTION 03-PROFILES

WRITE INFO: perfiles de volumen (filas de respuestas, aproximadas): `small` (1e3), `medium` (5e4),
`large` (1e6), `xl` (1e7). `large`/`xl` ejercitan la reportería bajo volumen.

### SECTION 04-GUARDAS

WRITE RULE: el seeder MUST abortar si `APP_ENV != development` o `SEED_ALLOW != 1`. — MUST

WRITE RULE: el seeder MUST verificar `current_database()` contra una allowlist de nombres dev
(`*_dev`) antes de escribir o borrar. — MUST

WRITE RULE: `reset` MUST acotarse a las tablas sembradas (nunca a toda la base). — MUST

### SECTION 05-VERDICT

WRITE INFO: el procedimiento cierra POSITIVO cuando, tras `seed` (+ `summarize`), los endpoints
`/api/analytics/global/dashboard` y `/api/analytics/surveys/:id/dashboard` devuelven los conteos
esperados del perfil, y `reset` deja las tablas vacías.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la declaración es válida cuando el seeder (A3 en `analytics/seed`) coincide con este
protocolo y sus guardas; en discrepancia, se corrige A2 — nunca se dobla A3.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
