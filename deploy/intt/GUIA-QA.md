# Guía de instalación — Entorno QA (calidad)

Despliegue del entorno **QA** (`APP_ENV=qa`, rama **`calidad`**) en los servidores del INTT, según el
dimensionamiento del cliente. QA es un entorno **completo y aislado** (su propia base de datos y su
propio proyecto de compose), pero **no** es producción: usa claves de prueba de Turnstile y puede
reconstruirse.

- Rama: `calidad` · `APP_ENV=qa` · base de datos `intt_encuesta_qa` · proyecto `encuesta-intt-qa`.
- Guía de producción: [`GUIA-PRODUCCION.md`](./GUIA-PRODUCCION.md).

---

## 0. Requisitos

- **VM(s)** con Ubuntu Server 22.04/24.04 LTS o Debian 12 (`amd64`). Mínimo sugerido para QA:
  - **1 VM (todo-en-uno):** 8 vCPU · 16 GB RAM · 120 GB SSD.
  - **2 VMs (consolidado):** `VM-WEB-APP` 12 vCPU/24 GB · `VM-DATABASE` 8 vCPU/24 GB (como la imagen del cliente).
- Docker Engine 24+ con plugin `docker compose` v2 (lo instala `install.sh --with-docker`).
- **Git** y acceso de **lectura** al repositorio (rama `calidad`).
- Puertos: `80` público en el borde; el resto internos.

---

## 1. Preparar el host

```bash
# Locale/hostname/firewall mínimos
sudo hostnamectl set-hostname qa-encuesta
sudo ufw default deny incoming
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp          # y 443/tcp si terminas TLS en el Nginx de borde
sudo ufw enable
```

> **Nunca** abras a Internet `3151` (api), `4301` (consola), `5451` (PostgreSQL) ni `6379` (Redis).

---

## 2. Instalar y desplegar

### Opción A — 1 VM (todo-en-uno, recomendado para QA)

```bash
sudo deploy/intt/scripts/install.sh --env qa --role all --with-docker \
     --repo https://git.<cliente>/…/EncuestaINTTT.git \
     --dir /opt/encuesta-intt/qa
```

Al no existir `.env.qa`, el instalador lo crea desde `deploy/intt/env/qa.env.example` y **se detiene**
pidiéndote que lo completes:

```bash
nano /opt/encuesta-intt/qa/repo/.env.qa     # claves CAMBIA_*; en QA puedes dejar Apache/PG locales
# y vuelve a lanzar el MISMO comando anterior (ahora continúa).
```

### Opción B — 2 VMs (consolidado: base de datos separada)

En **VM-DATABASE**:

```bash
sudo deploy/intt/scripts/install.sh --env qa --role database --with-docker \
     --repo https://git.<cliente>/…/EncuestaINTTT.git --dir /opt/encuesta-intt/qa
# .env.qa: PG_DATA_DIR=/var/lib/encuesta-intt/qa/postgres  (ruta absoluta)
```

En **VM-WEB-APP** (aplicación, BD/Redis remotos):

```bash
sudo deploy/intt/scripts/install.sh --env qa --role webapp --with-docker \
     --repo https://git.<cliente>/…/EncuestaINTTT.git --dir /opt/encuesta-intt/qa
# .env.qa: DB_HOST=<IP VM-DATABASE>, REDIS_HOST=<IP VM-DATABASE>
```

Para QA también se admite el reparto ideal de la imagen (`database` + `webapp` ×2 + `lb`); con dos
app VMs, ajusta `APP01`/`APP02` en `.env.qa`.

---

## 3. Variables clave de `.env.qa`

| Variable | Valor en QA |
|----------|-------------|
| `APP_ENV` | `qa` |
| `COMPOSE_PROJECT_NAME` | `encuesta-intt-qa` |
| `POSTGRES_DB` | `intt_encuesta_qa` |
| `POSTGRES_PASSWORD` / `ANALYTICS_DB_PASSWORD` | claves de QA |
| `TURNSTILE_*` | claves de prueba `1x…` (siempre pasan) |
| `NEXT_PUBLIC_APP_URL` | `http://qa.encuesta.intt.gob.ve` |
| `HTTP_PORT` | `80` |
| `ADMIN_BIND` | `127.0.0.1` (o IP LAN si la consola debe verse desde otras máquinas) |
| `DB_HOST` / `REDIS_HOST` | sólo en despliegue partido (IP de VM-DATABASE) |
| `SEED_ALLOW` | **no definir** |

---

## 4. Verificación

```bash
deploy/intt/scripts/health.sh --env qa --role all
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost/          # 200 (captura)
docker compose --env-file .env.qa -f compose.yaml config             # db/cache/api sin "ports"
```

- Consola analítica: `http://<ADMIN_BIND>:4301` (login `STAFF_ADMIN_*`).
- El panel privado de la captura: `http://localhost/?admin=1`.

---

## 5. Datos de prueba en QA

El **seeder es sólo de `development`** (aborta si `APP_ENV != development`); **no** siembra QA por
diseño. Para poblar QA:

- usa la encuesta como usuario real (o el bot `survey-bot/`), o
- importa un respaldo histórico al crear el esquema:

  ```bash
  IMPORT_BACKUP=1 docker compose --env-file .env.qa -f compose.yaml \
    up -d --build --wait migrate
  ```

---

## 6. Operación

```bash
deploy/intt/scripts/deploy.sh --env qa --role all --pull     # actualizar a la última `calidad`
deploy/intt/scripts/rollback.sh --env qa --role all --ref v1.0.0-qa
deploy/intt/scripts/backup.sh --env qa --role all            # respaldo puntual
docker compose --env-file .env.qa -f compose.yaml logs -f --tail=100 app api
```

QA puede reconstruirse desde cero: `docker compose --env-file .env.qa down` y borrar
`PG_DATA_DIR`/`./.data/qa` si se requiere un estado limpio.
