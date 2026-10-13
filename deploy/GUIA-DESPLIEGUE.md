# Guía de Despliegue (DevOps) — Encuesta Visión Cero (INTT)

Despliegue **on-premises** en una **única VM** con **Docker Compose**. El despliegue recomendado
por defecto es este (una máquina, `docker compose up -d`); la arquitectura de 5 VMs del SAD queda
como plan de escalamiento futuro (`docs/deploy/RECOMENDACION_DEPLOY.md`).

> **Regla de oro del perímetro:** `vision-cero` (la encuesta, tras el proxy Nginx) es la **única
> cara pública**. Todo `analytics/` (back-office `api` y consola `admin`) es **privado de intranet**:
> no se une a la red de borde `intt-edge` y no se publica al exterior. Norma:
> `.akuri/00-manifest/ports.md`.

---

## 1. Arquitectura y exposición

```
Internet ──▶ [Firewall/UTM] ──▶ :80 proxy (Nginx) ──▶ app (Next.js 3001) ──┐
                                                                          │
Intranet / VPN INTT ──▶ admin (consola Angular, ADMIN_BIND:4301) ──▶ api (NestJS 3151)
                                                                          │
                                       db (PostgreSQL 5451) ◀─────────────┘
                                       cache (Redis 6379)
```

| Componente | Puerto | Exposición |
|-----------|--------|------------|
| Captura (Next.js) | 3001 | pública **sólo** vía `proxy` (`HTTP_PORT`, def. `80`) |
| Back-office (NestJS) | 3151 | **interna** — nunca publicada; se accede tras la consola |
| Consola (Angular) | 4301 | **intranet** — host, sólo interfaz `${ADMIN_BIND}` |
| PostgreSQL | 5451 | **interna** (`intt-internal`) |
| Redis | 6379 | **interna** (`intt-internal`) |

---

## 2. Requisitos del servidor

- **SO:** Ubuntu Server 22.04/24.04 LTS o Debian 12 (`amd64`).
- **Hardware recomendado:** 16 vCPU · 32 GB RAM · 240 GB SSD NVMe · NIC 1 Gbps.
- **Docker Engine 24+** con plugin **`docker compose` v2**.
- **1 IP pública estática** y DNS (p. ej. `encuesta.intt.gob.ve`).
- Enlace simétrico (mín. 300 Mbps sin CDN; ver `RECOMENDACION_DEPLOY.md` §4.3).

---

## 3. Configurar el entorno de producción

```bash
git clone <url-del-repo> EncuestaINTTT
cd EncuestaINTTT
cp .env.example .env.production
chmod 600 .env.production
```

`.env.production` **debe** fijar:

| Variable | Valor en producción | Notas |
|----------|---------------------|-------|
| `APP_ENV` | `production` | define ruta de datos y base |
| `COMPOSE_PROJECT_NAME` | `encuesta-intt-prod` | separa de dev en el mismo host |
| `POSTGRES_DB` | `intt_encuesta` | **nunca** `*_dev` |
| `POSTGRES_PASSWORD` | fuerte, única | obligatoria (Docker la exige) |
| `ANALYTICS_DB_PASSWORD` | fuerte, única | obligatoria (rol `intt_analytics`) |
| `STAFF_ADMIN_EMAIL` / `STAFF_ADMIN_PASSWORD` | credenciales reales de staff | login de la consola |
| `ADMIN_PASSWORD` / `ADMIN_SECRET` | fuertes | panel de administración de la captura |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | **claves reales de Cloudflare** | vacío/`1x…` = sin exigir (ver §6) |
| `NEXT_PUBLIC_APP_URL` | `https://encuesta.intt.gob.ve` | se incrusta en el build |
| `ADMIN_BIND` | **IP LAN de la intranet** (o `127.0.0.1`) | nunca `0.0.0.0` |
| `HTTP_PORT` | `80` | entrada pública |
| `PG_DATA_DIR` | ruta de datos de PostgreSQL | relativa al repo o **absoluta** (la elige DevOps; p.ej. `./.data/production/postgres`) |
| `SEED_ALLOW` | **omitir** (no definir) | prohibido sembrar en producción |
| `SEED_SUBMIT_SECRET` | secreto fuerte | el `app` acepta envíos con canal `seed` con él |

> `NEXT_PUBLIC_*` se inyecta en tiempo de **build** (arg del `Dockerfile`). Si cambia la URL pública,
> hay que **reconstruir** la imagen de `app`/`proxy`.

---

## 4. Validar y desplegar

**Validar la configuración** (no arranca nada): comprueba que `db`/`cache` no se publican y que
`admin` se enlaza sólo a `ADMIN_BIND`.

```bash
docker compose --env-file .env.production config
#   · admin  → host_ip: <ADMIN_BIND>, networks: [intt-internal]
#   · proxy  → networks: [intt-edge, intt-internal], publicado sólo en HTTP_PORT
#   · db/cache/api → sin "ports"
```

**Desplegar:**

```bash
docker compose --env-file .env.production up -d --build --wait
```

`--wait` espera a que cada servicio esté sano y a que `migrate` (de un solo uso) termine con éxito.

### Migración de esquema (`migrate`)

El servicio `migrate` sincroniza el esquema Prisma y crea el esquema `analytics` + el rol, y termina.
Variables relevantes en `.env.production`:

| Variable | Uso |
|----------|-----|
| `DB_SYNC` | `push` (por defecto) = `prisma db push`; `deploy` = `prisma migrate deploy` (si hay migraciones versionadas) |
| `IMPORT_BACKUP` | `1` = importa `vision-cero/db/sqlite_backup.json` (datos históricos) |
| `SUMMARIZE` | `1` = precalcula el resumen del dashboard una vez |

Para una primera puesta en marcha con datos legados:

```bash
IMPORT_BACKUP=1 SUMMARIZE=1 docker compose --env-file .env.production up -d --build --wait migrate
```

---

## 5. Red, TLS y firewall

- **TLS (pendiente de infraestructura):** en `compose.yaml` el `proxy` sólo publica `HTTP_PORT` (80).
  Termina **HTTPS 443** delante (balanceador/UTM con certificado) o **extiende** el Nginx del
  `proxy` con el certificado y publica `443`, redirigiendo `80 → 443`. No expongas el 80 a Internet
  sin redirección.
- **Firewall (UFW):** permitir **sólo** lo necesario y denegar el resto.

  ```bash
  ufw default deny incoming
  ufw allow 22/tcp            # SSH (restringir a la VPN / IP fija de administración)
  ufw allow 80/tcp            # entrada pública (y 443/tcp si terminas TLS aquí)
  ufw enable
  ```

  **Nunca** abras `3151`, `4301`, `5451` ni `6379` a Internet. Si `ADMIN_BIND` es la IP de la
  intranet, la consola queda accesible sólo desde esa red.
- **Zero-Trust de la captura:** el Nginx perimetral restringe `/api/admin*`, `/api/survey/stats`,
  `/api/survey/participants`, `/api/survey/seed` y `/admin` a `127.0.0.1` y subredes privadas
  (`10/8`, `172.16/12`, `192.168/16`); el resto recibe **403**. Añade IPs fijas autorizadas con
  `allow <ip>;` si hace falta.

---

## 6. Endurecimiento (checklist)

- [ ] `POSTGRES_PASSWORD` y `ANALYTICS_DB_PASSWORD` fuertes y distintas de cualquier valor de ejemplo.
- [ ] `STAFF_ADMIN_PASSWORD` **cambiado** (no dejar el default `StaffAdmin2026!`).
- [ ] `ADMIN_PASSWORD` / `ADMIN_SECRET` fuertes.
- [ ] `TURNSTILE_*` **reales** (con las de prueba el anti-bot **no** se exige).
- [ ] `SEED_SUBMIT_SECRET` fuerte (no `dev-seed-secret`): protege el canal `seed` de la captura.
- [ ] `SEED_ALLOW` **ausente**; el servicio `seed` no está en la pila de producción.
- [ ] `ADMIN_BIND` = IP de intranet (o `127.0.0.1`), **nunca** `0.0.0.0`.
- [ ] `.env.production` con `chmod 600` y fuera de control de versiones.

---

## 7. Verificación post-despliegue

```bash
docker compose --env-file .env.production ps          # todos "healthy"
docker compose --env-file .env.production config      # db/cache/api sin "ports"; admin sólo en ADMIN_BIND
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost/   # 200 (captura)
```

- Comprobar la restricción **desde un cliente fuera de las redes privadas** (Internet): a
  `http://<IP-pública>/api/admin/` debe responder **403**. Desde `127.0.0.1` o la intranet la ruta
  está *permitida*, así que esa comprobación no da 403 desde el propio host.
- Desde la **intranet**, abrir `http://<ADMIN_BIND>:4301` y entrar con `STAFF_ADMIN_*`; la consola
  proxya `/api/` al back-office interno.
- Prueba de humo del back-office:

  ```bash
  API=http://<ADMIN_BIND>:4301/api node vision-cero/tests/smoke-backoffice.mjs
  ```

---

## 8. Operación

```bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f --tail=100 api app admin
docker compose --env-file .env.production restart app
docker compose --env-file .env.production up -d --build      # reconstruir/recrear
```

- Política de reinicio: `restart: unless-stopped` (los contenedores vuelven tras un reinicio del host).
- `migrate` no queda corriendo: es one-shot y debe salir con éxito.

## 9. Respaldos y sumarización

- **Respaldo diario de PostgreSQL** (`pg_dump` por el puerto interno `5451`), retención 30 días:

  ```bash
  docker compose --env-file .env.production exec -T db \
    pg_dump -U intt_user -p 5451 intt_encuesta | gzip \
    > /var/backups/encuesta-intt/backup_$(date +%F).sql.gz
  ```

  Programarlo por cron a las 02:00 y purgar los `.sql.gz` con más de 30 días
  (ejemplo completo en `install.sh` §11).
- **Sumarización del dashboard (CQRS):** recalcula el resumen pre-agregado. La imagen `runner` de
  la captura es un *standalone* mínimo (no incluye `scripts/` ni `tsx`), por lo que la sumarización
  se ejecuta reutilizando la imagen del `migrate` con `SUMMARIZE=1`:

  ```bash
  0 * * * * cd /opt/EncuestaINTTT && SUMMARIZE=1 docker compose --env-file .env.production \
    run --rm migrate >> /var/log/encuesta-summarize.log 2>&1
  ```

  (Idealmente, dedicar un servicio/tarea de sumarización; hoy se reutiliza `migrate`, que es
  idempotente.) Con `SUMMARIZE=1` en el arranque (§4) ya se precalcula una vez.

- Ajusta `shared_buffers` / `effective_cache_size` de PostgreSQL a la RAM real del servidor
  (`compose.yaml`, servicio `db`).

## 10. Actualización y rollback

```bash
# Actualizar
git pull
docker compose --env-file .env.production up -d --build --wait

# Rollback (volver a un estado conocido)
git checkout <tag-o-commit-anterior>
docker compose --env-file .env.production up -d --build --wait
```

Antes de actualizar, respalda la base (§9). Los datos de PostgreSQL viven en `PG_DATA_DIR` (por
defecto `./.data/production/postgres`) y **no** se borran al recrear contenedores.

## 11. Escalabilidad futura

| Fase | Configuración | Cuándo |
|------|---------------|--------|
| **0 (actual)** | 1 VM, Docker Compose | campaña inicial |
| **1** | 2 VMs: `WEB+APP` + `DB` | > 600 RPS sostenidos o aislar la BD |
| **2** | Matriz SAD de 5 VMs (LB + 2×App + DB + Cache) | política institucional de aislamiento físico |

En cualquier fase: rate-limit a Redis y pooler PgBouncer en la capa de datos.
Ver `docs/deploy/RECOMENDACION_DEPLOY.md` §7.

## 12. Alternativa sin Docker (nativa)

Si el servidor **no permite Docker**, usa [`GUIA-ALTERNATIVA-NO-DOCKER.md`](./GUIA-ALTERNATIVA-NO-DOCKER.md):
instalación nativa con **PostgreSQL + Node + PM2 + Nginx** (y el asistente `install.sh` / `install.ps1`
del repo). Conserva el mismo perímetro público/intranet. El despliegue recomendado y soportado por
defecto sigue siendo **Docker Compose** (esta guía).
