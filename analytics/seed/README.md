# analytics/seed — Seeder de datos simulados

Aplicación **NestJS standalone** (sin HTTP) que siembra datos simulados en la base de datos de
**desarrollo** para probar el back-office (KPI, reportería, volumen). Borra y recarga a voluntad.

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

## Variables

`APP_ENV`, `SEED_ALLOW`, `DATABASE_URL` (captura, esquema `public`), `API_BASE_URL` (por defecto
`http://api:3151`), `STAFF_ADMIN_EMAIL`, `STAFF_ADMIN_PASSWORD` (para `summarize`).

## Diseño

- **COPY** en streaming (no inserts fila-a-fila) para volumen grande.
- **RNG determinista** por fila → ids y valores reproducibles entre tablas (semilla fija).
- Tablas: `public.users` (upsert) · `surveys` · `questions` · `question_options` · `responses` ·
  `answers` · `legacy_survey_responses`.
