# Guía de instalación — Entorno de Producción

Despliegue del entorno **PRODUCCIÓN** (`APP_ENV=production`, rama **`produccion`**, protegida) en los
servidores del INTT, según el dimensionamiento del cliente. Diferencias esenciales respecto a QA:

- **Rama `produccion` protegida**: sólo el administrador de despliegue la publica (ver `BRANCHES.md`).
- `TURNSTILE_*` **reales**; `SEED_ALLOW` **ausente**; secretos fuertes.
- **Respaldos** y **sumarización** programados por cron.
- Contracción de perímetro y TLS.

---

## 0. Requisitos y topología

- **5 VMs (ideal):** `VM-WEB-LB01` (4/8/60) · `VM-APP01` y `VM-APP02` (6/12/80) · `VM-DB01` (8/24/200 NVMe) · `VM-CACHE01` (2/4/40).
- **2 VMs (consolidado):** `VM-WEB-APP` (12/24) + `VM-DATABASE` (8/24).
- **1 VM (todo-en-uno):** válido mientras la carga no exija separar roles (`docs/deploy/RECOMENDACION_DEPLOY.md`).
- Docker Engine 24+ y plugin `docker compose` v2.
- 1 IP pública estática + DNS (`encuesta.intt.gob.ve`). Enlace simétrico ≥300 Mbps (o 50 Mbps con CDN).

---

## 1. Preparar los hosts

```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp            # restringir a VPN / IP fija de administración
sudo ufw allow 80/tcp            # y 443/tcp si terminas TLS aquí
sudo ufw enable
```

Reglas de red internas del stack (no publicar nunca a Internet): `3151` (api), `4301` (consola),
`5451` (PostgreSQL), `6379` (Redis).

---

## 2. Instalar y desplegar por rol

Crea el `.env.production` a partir de `deploy/intt/env/produccion.env.example` en **cada** VM (con los
valores que correspondan a su rol) y despliega:

### 5 VMs (ideal)

```bash
# VM-DB01
sudo deploy/intt/scripts/install.sh --env production --role database   --with-docker --repo <url>
# VM-CACHE01 → se despliega el caché junto con la base si Redis va aparte:
#   el rol `database` arranca `db cache`; si Redis vive en su propia VM,
#   ejecuta en VM-CACHE01:  deploy.sh --env production --role database   (y ajusta REDIS_HOST en las demás)
# VM-APP01 y VM-APP02
sudo deploy/intt/scripts/install.sh --env production --role webapp     --with-docker --repo <url>
# VM-WEB-LB01
sudo deploy/intt/scripts/install.sh --env production --role lb         --with-docker --repo <url>
```

### 2 VMs (consolidado)

```bash
# VM-DATABASE (PostgreSQL + Redis)
sudo deploy/intt/scripts/install.sh --env production --role database --with-docker --repo <url>
# VM-WEB-APP (migrate + app + api + admin), apuntando a VM-DATABASE
sudo deploy/intt/scripts/install.sh --env production --role webapp   --with-docker --repo <url>
#   .env.production: DB_HOST=<IP VM-DATABASE>, REDIS_HOST=<IP VM-DATABASE>
```

> En el consolidado, *VM-WEB-APP* incluye Nginx+apps. Si prefieres un borde dedicado (o poner el
> balanceador delante del UTM), añade un `--role lb` en su VM y deja `webapp` en la de aplicación.

### 1 VM (todo-en-uno)

```bash
sudo deploy/intt/scripts/install.sh --env production --role all --with-docker --repo <url>
```

`.env.production` **debe** fijar (además de `APP_ENV=production`, `POSTGRES_DB=intt_encuesta`,
`COMPOSE_PROJECT_NAME=encuesta-intt-prod`):

| Variable | Valor en producción |
|----------|---------------------|
| `POSTGRES_PASSWORD`, `ANALYTICS_DB_PASSWORD` | fuertes y distintas de cualquier ejemplo |
| `STAFF_ADMIN_PASSWORD` | cambiada (no el default) |
| `ADMIN_PASSWORD`, `ADMIN_SECRET` | fuertes |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **reales de Cloudflare** |
| `SEED_SUBMIT_SECRET` | fuerte (no `dev-seed-secret`) |
| `NEXT_PUBLIC_APP_URL` | `https://encuesta.intt.gob.ve` |
| `ADMIN_BIND` | IP LAN de la intranet (o `127.0.0.1`), **nunca** `0.0.0.0` |
| `PG_DATA_DIR` | ruta **absoluta** en VM-DB01 (p.ej. `/var/lib/encuesta-intt/production/postgres`) |
| `SEED_ALLOW` | **ausente** |

---

## 3. TLS y perímetro

- **TLS 443:** terminado en el UTM/balanceador externo del INTT (recomendado) o en el Nginx de borde
  (`proxy`), publicando `443` y redirigiendo `80 → 443`. No expongas el `80` a Internet sin redirección.
- **Zero-Trust:** el Nginx de borde ya restringe `/api/admin*`, `/api/survey/stats`,
  `/api/survey/participants`, `/api/survey/seed` y `/admin` a `127.0.0.1` y subredes privadas
  (`10/8`, `172.16/12`, `192.168/16`); el resto recibe **403**. Añade IPs fijas con `allow <ip>;` si hace falta.
- Comprueba el 403 **desde fuera** de las redes privadas: `curl -I http://<IP-pública>/api/admin/`.

---

## 4. Verificación post-despliegue

```bash
deploy/intt/scripts/health.sh --env production --role all
docker compose --env-file .env.production -f compose.yaml ps          # todo "healthy"
docker compose --env-file .env.production -f compose.yaml config      # db/cache/api sin "ports"
curl -sS -o /dev/null -w '%{http_code}\n' https://encuesta.intt.gob.ve/
```

- Desde la intranet: abrir `http://<ADMIN_BIND>:4301` y entrar con `STAFF_ADMIN_*`.

---

## 5. Respaldos y sumarización (cron)

**Respaldo diario** (en la VM de base de datos), retención 30 días:

```cron
0 2 * * * /opt/encuesta-intt/production/repo/deploy/intt/scripts/backup.sh \
          --env production --role database --keep-days 30 >> /var/log/encuesta-backup.log 2>&1
```

**Sumarización del dashboard (CQRS)** — recalcula el resumen pre-agregado (la captura es un *standalone*
mínimo; se reutiliza la imagen de `migrate` con `SUMMARIZE=1`):

```cron
0 * * * * cd /opt/encuesta-intt/production/repo && \
  SUMMARIZE=1 docker compose --env-file .env.production -f compose.yaml \
  run --rm migrate >> /var/log/encuesta-summarize.log 2>&1
```

---

## 6. Actualización y rollback

```bash
# Actualizar a la última `produccion` (protegida)
deploy/intt/scripts/deploy.sh --env production --role all --pull

# Rollback a un tag conocido
deploy/intt/scripts/rollback.sh --env production --role all --ref v1.0.0
```

Antes de actualizar, **respalda** (§5). Los datos viven en `PG_DATA_DIR` (bind mount) y **no** se borran
al recrear contenedores.

---

## 7. Endurecimiento (checklist final)

- [ ] Secretos fuertes y distintos de los ejemplos (§2).
- [ ] `TURNSTILE_*` reales.
- [ ] `SEED_ALLOW` ausente y sin servicio `seed`.
- [ ] `ADMIN_BIND` = intranet/loopback.
- [ ] `.env.production` con `chmod 600` y fuera de control de versiones.
- [ ] `docker compose config` sin exponer `db`/`cache`/`api`.
- [ ] Cron de respaldo y sumarización activos.
- [ ] 403 verificado desde Internet en las rutas administrativas.
