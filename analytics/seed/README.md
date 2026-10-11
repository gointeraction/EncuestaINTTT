# analytics/seed — Seeder de datos simulados

Aplicación **NestJS standalone** (sin HTTP) que siembra datos simulados en la base de datos de
**desarrollo** para probar el back-office (KPI, reportería, volumen). Borra y recarga a voluntad.

> Emula la **forma REAL** de la encuesta Visión Cero: la tabla
> **`public.legacy_survey_responses`** (`driverType` + `answers` JSON + sorteo). Las respuestas
> se generan con la **definición REAL** de la encuesta (`src/core/survey-data.ts`, copia de
> `src/lib/survey-data.ts`): por tipo de conductor (`appliesTo`) y con la lógica condicional
> (`showIf`). Así cada respuesta contiene EXACTAMENTE las preguntas aplicables a su perfil
> (p.ej. Delivery/Mototaxista ~42 activas de 51; Familiar ~21 de 24).

> SOLO `development`. Las guardas abortan si `APP_ENV != development`, `SEED_ALLOW != 1` o la
> base conectada no está en la allowlist `*dev*`. Ver `.akuri/00-manifest/environments.md`.

## Comandos

| Comando | Efecto |
|---------|--------|
| `seed` | `TRUNCATE` acotado + carga del dataset (por `COPY`) |
| `reset` | `TRUNCATE` de las tablas sembradas |
| `generate` | escribe los CSV en `data/` (inspección / pruebas de volumen) |
| `summarize` | login staff + `POST /analytics/jobs/summarize` (puebla los read models) |

Flags: `--profile small|medium|large|xl` (filas), `--seed <n>` (semilla RNG, reproducible).

## Uso (vía compose, entorno dev)

```bash
# levantar dev
docker compose --env-file .env.development up -d --build db cache migrate api admin

# sembrar + sumarizar
docker compose --env-file .env.development run --rm seed seed --profile small --seed 42
docker compose --env-file .env.development run --rm seed summarize

# borrar
docker compose --env-file .env.development run --rm seed reset
```

## Interfaz visual (consola)

El seeder, sin argumentos, levanta un **servidor HTTP dev-only** en `:3161` (`GET /status`,
`POST /seed`, `POST /reset`, `POST /summarize`). La consola lo consume a través de **nginx**
(`/seed/` → `seed:3161`) en la página **"Datos de prueba"** (`/datos`): eliges perfil/conteos y
pulsas **Cargar / Sumarizar / Borrar**. Requiere el perfil `seed` activo:

```bash
docker compose --env-file .env.development --profile seed up -d --build seed
# luego, en la consola: menú «Datos» → /datos
```

## Variables

`APP_ENV`, `SEED_ALLOW`, `DATABASE_URL` (captura, esquema `public`), `API_BASE_URL` (por defecto
`http://api:3151`), `STAFF_ADMIN_EMAIL`, `STAFF_ADMIN_PASSWORD` (para `summarize`).

## Diseño

- **COPY** en streaming (no inserts fila-a-fila) para volumen grande.
- **RNG determinista** por fila → ids y valores reproducibles entre tablas (semilla fija).
- Tablas: `public.users` (upsert) · `surveys` · `questions` · `question_options` · `responses` ·
  `answers` · `legacy_survey_responses`.

## Salida CSV

`seed` (y `generate`) escriben **cada tabla a `data/<tabla>.csv`** mientras cargan por `COPY`.
En Docker, `./analytics/seed/data` se monta en `/app/data` (por eso quedan en el host, con tu
UID/GID). Esos CSV son la "data" del seeder: sirven para inspección y para recargar. Están
**gitignored** (volúmenes grandes); versiona solo fixtures pequeños en `data/fixtures/`.
