---
file: ports.md
doc-type: SPEC
level: L2
area: A2
position: 7
title: PORTS
summary: Asignación de puertos del sistema EncuestaINTTT — captura (Next.js) 3001,
  back-office (NestJS) 3151, consola (Angular) 4301 y PostgreSQL 5451 (no estándar),
  con el perímetro de exposición y su justificación de seguridad.
category: 00-manifest
scope: the 00-manifest specification
---

# Puertos del sistema (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: fija el puerto de cada componente y su exposición, para que el despliegue
(Docker y las instalaciones nativas) sea coherente y no exponga servicios sensibles.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: TECH=NGINX · TECH=DOCKER · TECH=POSTGRESQL · TECH=REDIS.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=SINGLE_PERIMETER (una sola entrada pública; el resto por red interna).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: NONE here.

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-ASIGNACION

WRITE INFO: asignación de puertos (servicio interno → exposición):

| Componente | Puerto | Exposición | Notas |
|-----------|--------|-----------|-------|
| Captura (Next.js) | **3001** | público vía el perímetro `proxy` (Nginx, host `${HTTP_PORT:-80}`) | servicio interno `app:3001` |
| Back-office (NestJS) | **3151** | NO expuesto al host; se accede tras la consola | servicio interno `api:3151` |
| Consola (Angular) | **4301** | host `4301:4301` | Nginx interno en `:4301`; su `/api` proxya a `api:3151` |
| PostgreSQL | **5451** | interna (NUNCA publicada) | no estándar (no 5432); red `intt-internal` |
| Redis | 6379 | interna (NUNCA publicada) | caché / rate-limit |
| Nginx perímetro | 80 | host `${HTTP_PORT:-80}` | entrada pública de la captura |

### SECTION 02-JUSTIFICACION

WRITE INFO: PostgreSQL en **5451** (no 5432): puerto **no estándar**, no colisiona con puertos
conocidos (5432/5433, 6432 de PgBouncer, 3306) y reduce el escaneo automatizado. Encaja con el
esquema del proyecto `…51` (3001 / 3151 / 4301). Además, la base de datos y Redis **no se publican
al host**: viven en la red `intt-internal`, con acceso solo desde los contenedores.

### SECTION 03-CAMBIOS

WRITE INFO: la asignación se aplica en: `compose.yaml` (servicios `db`/`app`/`api`/`admin` +
anclas `DATABASE_URL`), `Dockerfile` (raíz, `analytics/api`, `analytics/console`), los Nginx
(`deploy/nginx/default.conf`, `analytics/console/deploy/nginx-console.conf`), el `Caddyfile`
(dev), `package.json` (dev de la captura), `analytics/api/src/main.ts`, `angular.json` (serve),
`install.sh` (on-prem: `postgresql.conf port=5451`, `DATABASE_URL`, `pg_dump -p 5451`),
`install.ps1` (dev Windows) y `.zscripts/*` (dev). El smoke test usa `http://localhost:4301/api`.

WRITE RULE: la base de datos y Redis MUST NOT publicarse al host; se accede a ellos solo por la
red interna. — MUST

WRITE RULE: el back-office (NestJS) MUST alcanzarse solo a través de la consola. — MUST

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: la asignación es válida cuando `docker compose config` resuelve y ningún puerto de
`db`/`cache` aparece publicado.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
