# Guía de Desarrollo y Pruebas — Encuesta Visión Cero (INTT)

Entorno **autocontenido** en un solo host con **Docker Compose**: base de datos, caché, migración
de esquema, captura, back-office y consola. Todas las pruebas y los datos simulados (seeder) corren
**exclusivamente** en este entorno de desarrollo; producción nunca se siembra.

> Referencias normativas: `.akuri/00-manifest/environments.md` (entornos) y
> `.akuri/00-manifest/ports.md` (puertos y perímetro).

---

## 1. Requisitos

- **Docker Engine 24+** con el plugin **`docker compose` v2** (`docker compose version`).
- **Git**.
- **8 GB de RAM** mínimo; 16 GB recomendado si vas a sembrar datasets grandes (`--profile xl`).
- Puertos libres en el host: `80` (o el que definas en `HTTP_PORT`) y `4301` (o `ADMIN_PORT`).

Opcional, sólo si vas a ejecutar piezas **sin Docker**:

- Node.js 20+ y `npm` (la captura y el back-office usan Node 24 en las imágenes).
- PostgreSQL 16 en `localhost:5451` y Redis en `6379`.

---

## 2. Estructura del repositorio

```
EncuestaINTTT/
├── compose.yaml            # pila completa (dev/prod por configuración)
├── scripts/                # dev.sh · dev-down.sh (atajos)
├── vision-cero/            # CAPTURA — Next.js 16 (pública, tras el proxy Nginx)
│   ├── prisma/             # esquema Prisma (esquema public)
│   └── db/                 # almacén local de respaldo (resiliencia)
├── analytics/
│   ├── api/                # BACK-OFFICE — NestJS (privado, :3151)
│   ├── console/            # CONSOLA — Angular (privada, :4301)
│   ├── api-sdk/            # SDK Orval generado
│   └── seed/               # SEEDER de datos simulados (sólo dev)
└── .akuri/                 # corpus de especificaciones (fuente de verdad)
```

---

## 3. Preparar el entorno

```bash
git clone <url-del-repo> EncuestaINTTT
cd EncuestaINTTT

cp .env.example .env.development      # .env.development NO se versiona
chmod 600 .env.development
```

Edita `.env.development` y define como mínimo:

| Variable | Valor en desarrollo |
|----------|---------------------|
| `APP_ENV` | `development` |
| `POSTGRES_DB` | `intt_encuesta_dev` |
| `COMPOSE_PROJECT_NAME` | `encuesta-intt-dev` |
| `SEED_ALLOW` | `1` (habilita el seeder **destructivo**) |
| `POSTGRES_PASSWORD` | tu clave local |
| `ANALYTICS_DB_PASSWORD` | clave del rol `intt_analytics` |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | claves de **prueba** `1x…` (siempre pasan) |

El resto de los valores del `.env.example` sirven tal cual para desarrollo.

---

## 4. Levantar el entorno

```bash
scripts/dev.sh up          # o el atajo desde la raíz: ./dev.sh up
```

> Los scripts `scripts/dev.sh` / `scripts/dev-down.sh` tienen atajos en la **raíz** del repo
> (`./dev.sh`, `./dev-down.sh`) para no tener que escribir la carpeta. Ejecútalos desde la raíz
> del repo o con **ruta absoluta** (si tu shell quedó en un directorio inexistente, `cd` primero
> a la raíz).

Equivale a:

```bash
docker compose --env-file .env.development up -d --build --wait
```

`--wait` deja el comando cuando todos los servicios están sanos (o el `migrate`, que es de un solo
uso, terminó con éxito).

### Servicios

| Servicio | Rol | Red | Publicado al host |
|----------|-----|-----|-------------------|
| `db` | PostgreSQL 16 (esquemas `public` + `analytics`) | `intt-internal` | no (`5451` interno) |
| `cache` | Redis 7 | `intt-internal` | no (`6379` interno) |
| `migrate` | Sincroniza Prisma + crea esquema/rol analytics (one-shot) | `intt-internal` | — |
| `app` | Captura Next.js (`vision-cero`) | `intt-internal` | no (`3001` interno) |
| `proxy` | Nginx perimetral → captura | `intt-internal` + `intt-edge` | **sí** (`HTTP_PORT`, def. `80`) |
| `api` | Back-office NestJS | `intt-internal` | no (`3151` interno) |
| `admin` | Consola Angular (Nginx estático) | `intt-internal` | sí, **sólo** en `ADMIN_BIND` (def. `127.0.0.1:4301`) |
| `seed` | Seeder (perfil `seed`, **no** arranca con `up`) | `intt-internal` | no (`3161` interno) |

### URLs

- **Encuesta (pública):** http://localhost:80 — o `http://localhost:${HTTP_PORT}`.
- **Consola analítica (privada):** http://localhost:4301 — login `admin@intt.gob.ve` / `StaffAdmin2026!`
  (valores de `STAFF_ADMIN_*`; cámbialos en entornos reales).
- **Swagger del back-office** (vía proxy de la consola): http://localhost:4301/api/openapi

> La consola se enlaza por defecto al **loopback** (`ADMIN_BIND=127.0.0.1`): sólo accesible desde el
> propio host. Para verla desde otras máquinas, define `ADMIN_BIND=0.0.0.0` **sólo** si el host es de
> desarrollo aislado, o `ADMIN_BIND=<IP-LAN>` en una intranet.

---

## 5. Comandos del día a día

```bash
scripts/dev.sh ps           # estado de los servicios
scripts/dev.sh logs         # logs en vivo (o: scripts/dev.sh logs api app admin)
scripts/dev.sh restart      # reinicia los contenedores
scripts/dev.sh reset        # down + up (reinicio limpio conservando la data)
scripts/dev.sh down         # detiene (incluye el perfil seed y huérfanos); conserva los datos

scripts/dev-down.sh --volumes   # además elimina volúmenes nombrados de Docker
```

Reconstruir **un** servicio tras un cambio:

```bash
docker compose --env-file .env.development up -d --build api
```

La data de **PostgreSQL** persiste en **`./db/postgres`** (dentro del repo, para inspección; ver
`PG_DATA_DIR` en `.env.development`); la de **Redis** en `./.data/development/redis` (ambas
gitignored). Para empezar de cero: `scripts/dev.sh down` y borra `./db/postgres` y
`./.data/development/`.

---

## 6. Seeder de datos simulados (sólo desarrollo)

El seeder es **destructivo** (borra y recarga). Aborta si `APP_ENV != development` o
`SEED_ALLOW != 1`, y verifica que la base sea de desarrollo.

```bash
# CLI (perfil grande, semilla reproducible):
docker compose --env-file .env.development run --rm seed seed --profile large --seed 42
```

Perfiles (`analytics/seed/src/profiles.ts`): `small` · `medium` · `large` · `xl`.
Comandos: `seed` · `reset` · `generate` · `summarize` · `fixtures` · `datasets` · `load`.

Para usar la página **Datos** de la consola (genera/descarga/carga CSV), levanta el servidor dev del
seeder (la consola proxya `/seed/` → `seed:3161`):

```bash
docker compose --env-file .env.development --profile seed up -d seed
```

Los CSV quedan en `analytics/seed/data/` (montados en el host).

---

## 7. Pruebas

Con el stack arriba:

```bash
# Smoke del back-office + consola (a través del proxy de la consola)
node vision-cero/tests/smoke-backoffice.mjs
#   API=http://localhost:3151 node vision-cero/tests/smoke-backoffice.mjs   # directo al api
#   STAFF_EMAIL=… STAFF_PASSWORD=… node …                                   # otros credenciales

# Back-office — unit / e2e (Vitest)
cd analytics/api && npm test
cd analytics/api && npm run test:e2e

# Consola — unit (Vitest)
cd analytics/console && npm test

# Captura — lint y viaje e2e
cd vision-cero && npm run lint
cd vision-cero && npm run test:sdd
```

---

## 8. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `algún servicio no alcanzó estado saludable` | un contenedor falló al arrancar | `scripts/dev.sh ps` y `scripts/dev.sh logs <servicio>` |
| La consola no carga `/api` | `api` no está sano | la consola espera a `api`; revisa `logs api` |
| `defina POSTGRES_PASSWORD en .env` | falta el `.env.development` o la variable | repite el paso 3 |
| El seeder aborta | `APP_ENV != development` o `SEED_ALLOW != 1` | revisa `.env.development` |
| Puerto 80 ocupado | otro servicio usa el 80 | `HTTP_PORT=8080 scripts/dev.sh up` |
| Cambios no se ven en la consola | build estático | reconstruye: `… up -d --build admin` |
