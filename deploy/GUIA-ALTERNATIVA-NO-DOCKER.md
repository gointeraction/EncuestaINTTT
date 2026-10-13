# Alternativa de despliegue SIN Docker (nativa) — Encuesta Visión Cero (INTT)

Guía para desplegar en **una VM** **sin contenedores**, instalando PostgreSQL, Node.js, Redis y
Nginx directamente en el sistema operativo, con **PM2** como gestor de procesos del cluster Node.

> Úsala **sólo** cuando no se permita Docker en el servidor (política institucional, imágenes no
> autorizadas, etc.). El despliegue **recomendado y por defecto** es Docker Compose
> (`deploy/GUIA-DESPLIEGUE.md`). Esta guía preserva el mismo **perímetro**: `vision-cero` es la
> única cara pública; `analytics/` (back-office + consola) es **privado de intranet**.

---

## 0. Diferencias frente a Docker y frente a `install.sh`

- **Sin Docker:** los procesos corren con **PM2** sobre el Node del host, y Nginx sirve directamente
  los estáticos. PostgreSQL y Redis son servicios del sistema.
- **`install.sh`** (incluido en el repo) automatiza **sólo la captura** (`vision-cero`) sobre
  PostgreSQL nativo + PM2 + Nginx. **No** despliega el back-office (`analytics/api`) ni la consola
  (`analytics/console`). Esta guía cubre **todo** el sistema; puedes ejecutar `install.sh` para las
  Fases 0–2 y completar a mano las Fases 3–4, o seguir la guía completa manualmente.
- **`install.ps1`** es un asistente para **Windows (sólo desarrollo local)**; no es para producción.

Puertos (mismo esquema que el despliegue Docker, ver `.akuri/00-manifest/ports.md`):

| Componente | Puerto | Exposición |
|-----------|--------|------------|
| Captura (Next.js, PM2) | 3001 | interna (Nginx público en `80`/`443`) |
| Back-office (NestJS, PM2) | 3151 | **interna** (`127.0.0.1`, sólo intranet) |
| Consola (Angular, Nginx) | 4301 | **intranet** (bind a la IP LAN) |
| PostgreSQL | 5451 | **interna** (`127.0.0.1`) |
| Redis | 6379 | **interna** (`127.0.0.1`) |

---

## 1. Arquitectura nativa

```
Internet ─▶ Firewall/UFW ─▶ Nginx :80/:443 (SSL, gzip, rate-limit, Zero-Trust)
                                 │  proxy_pass 127.0.0.1:3001
                                 ▼
                        PM2 cluster → vision-cero (Next.js 3001)
                                 │  DATABASE_URL (esquema public)
                                 ▼
                        PostgreSQL :5451  ◀── Redis :6379
                                 ▲
Intranet ─▶ Nginx :4301 (consola Angular) ─▶ /api/ → 127.0.0.1:3151
                                 │
                        PM2 → analytics/api (NestJS 3151, esquema analytics)
```

---

## 2. Requisitos

- **SO:** Ubuntu Server 22.04/24.04 LTS o Debian 12 (`amd64`).
- **Hardware:** 16 vCPU · 32 GB RAM · 240 GB SSD NVMe · 1 Gbps (ver `RECOMENDACION_DEPLOY.md`).
- **Node.js 22 o 24 LTS** y `npm`.
- **PostgreSQL 16**, **Redis 7**, **Nginx**, **certbot** y **PM2**.
- **1 IP pública estática** + DNS.

---

## 3. Fase 0 — Paquetes base

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw nginx postgresql postgresql-contrib \
                    redis-server certbot python3-certbot-nginx openssl

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2
node -v && npm -v && psql --version && redis-server --version
```

---

## 4. Fase 1 — PostgreSQL

```bash
sudo -u postgres psql
```
```sql
CREATE USER intt_user WITH PASSWORD 'TuContrasenaSegura2026!' SUPERUSER;
CREATE DATABASE intt_encuesta OWNER intt_user;
GRANT ALL PRIVILEGES ON DATABASE intt_encuesta TO intt_user;
\q
```

**Tuning + puerto 5451** (edita `/etc/postgresql/16/main/postgresql.conf`):

```ini
shared_buffers = 4GB            # ~25% de la RAM
effective_cache_size = 12GB     # ~75% de la RAM
work_mem = 16MB
random_page_cost = 1.1          # SSD/NVMe
max_connections = 200
port = 5451                     # mismo puerto que el despliegue Docker
listen_addresses = '127.0.0.1'  # nunca exponer PostgreSQL
```
```bash
sudo systemctl restart postgresql
```

> Si prefieres el puerto estándar `5432`, ajusta `DATABASE_URL` en todas las fases siguientes.

**Redis** (sólo local): en `/etc/redis/redis.conf` deja `bind 127.0.0.1 ::1` y `sudo systemctl restart redis-server`.

---

## 5. Fase 2 — Captura (`vision-cero`, Next.js)

```bash
sudo mkdir -p /var/www/encuesta-intt && sudo chown -R "$USER:$USER" /var/www/encuesta-intt
cd /var/www/encuesta-intt
git clone <URL_DEL_REPOSITORIO> .
cd vision-cero
```

**Env de la captura** — `vision-cero/.env` (`chmod 600`). `NEXT_PUBLIC_*` se incrustan en **tiempo de
build**:

```env
DATABASE_URL="postgresql://intt_user:TuContrasenaSegura2026!@127.0.0.1:5451/intt_encuesta?schema=public"
NEXT_PUBLIC_APP_URL="https://encuesta.intt.gob.ve"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."      # clave real de Cloudflare
TURNSTILE_SITE_KEY="0x4AAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAA..."
ADMIN_PASSWORD="<clave del panel privado de la captura>"
ADMIN_SECRET="<hex de 64 caracteres>"
AUTH_SECRET="<hex de 64 caracteres>"
SEED_SUBMIT_SECRET="<secreto fuerte>"              # protege el canal `seed`
```

```bash
npm ci                                  # o: npm install --production=false
npx prisma generate
npx prisma db push --accept-data-loss   # crea el esquema `public` (captura)

# Esquema `analytics` + rol + índices (los aplica el `migrate` de Docker; aquí a mano):
psql "postgresql://intt_user:TuContrasenaSegura2026!@127.0.0.1:5451/intt_encuesta" -v ON_ERROR_STOP=1 -f deploy/sql/00-analytics.sql
psql "postgresql://intt_user:TuContrasenaSegura2026!@127.0.0.1:5451/intt_encuesta" -v ON_ERROR_STOP=1 -f deploy/sql/01-capture-answers-index.sql
psql "postgresql://intt_user:TuContrasenaSegura2026!@127.0.0.1:5451/intt_encuesta" -v ON_ERROR_STOP=1 -f deploy/sql/02-capture-unique-cedula.sql

# Contraseña del rol del back-office (el rol lo crea 00-analytics.sql):
psql "postgresql://intt_user:TuContrasenaSegura2026!@127.0.0.1:5451/intt_encuesta" \
  -c "ALTER ROLE intt_analytics WITH PASSWORD '<ANALYTICS_DB_PASSWORD>';"

# Opcional: datos históricos y primer resumen del dashboard
npm run db:import-backup || true
npm run survey:summarize || true

# Compilar (standalone)
npm run build
```

**PM2** — `vision-cero/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: "encuesta-intt",
    script: ".next/standalone/server.js",
    cwd: __dirname,
    instances: "max",
    exec_mode: "cluster",
    env: { NODE_ENV: "production", PORT: 3001, HOSTNAME: "127.0.0.1" },
    max_memory_restart: "1G",
    autorestart: true,
    max_restarts: 10,
  }],
};
```
```bash
cd /var/www/encuesta-intt/vision-cero
pm2 start ecosystem.config.js && pm2 save && pm2 startup   # ejecuta la línea que imprime
```

---

## 6. Fase 3 — Back-office analítico (`analytics/api`, NestJS)

> El `api` **sólo** debe escuchar en `127.0.0.1` y ser **privado de intranet**. Se accede a él a
> través del proxy `/api/` de la consola.

El `api` lee el `.env` de la **raíz del repo** (`analytics/api/src/main.ts` resuelve `../../../.env`).
Crea `/var/www/encuesta-intt/.env` (`chmod 600`):

```env
APP_ENV="production"
PORT=3151
DATABASE_URL="postgresql://intt_analytics:<ANALYTICS_DB_PASSWORD>@127.0.0.1:5451/intt_encuesta?schema=analytics"
REDIS_URL="redis://127.0.0.1:6379"
STAFF_ADMIN_EMAIL="admin@intt.gob.ve"
STAFF_ADMIN_PASSWORD="<clave fuerte de staff>"
TURNSTILE_SECRET_KEY="0x4AAAAAA..."     # Turnstile del login de la consola
```

```bash
cd /var/www/encuesta-intt/analytics/api
npm ci
npx prisma generate
npx prisma db push --schema prisma/schema.prisma --skip-generate --accept-data-loss   # tablas del esquema `analytics`
npm run build
```

**PM2** — `analytics/api/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: "encuesta-api",
    script: "dist/main.js",
    cwd: __dirname,
    instances: 1,
    env: {
      NODE_ENV: "production",
      PORT: 3151,
      APP_ENV: "production",
      DATABASE_URL: "postgresql://intt_analytics:<ANALYTICS_DB_PASSWORD>@127.0.0.1:5451/intt_encuesta?schema=analytics",
      REDIS_URL: "redis://127.0.0.1:6379",
      STAFF_ADMIN_EMAIL: "admin@intt.gob.ve",
      STAFF_ADMIN_PASSWORD: "<clave fuerte de staff>",
      TURNSTILE_SECRET_KEY: "0x4AAAAAA...",
    },
    max_memory_restart: "1G",
    autorestart: true,
  }],
};
```
```bash
cd /var/www/encuesta-intt/analytics/api
pm2 start ecosystem.config.js && pm2 save
curl -sS http://127.0.0.1:3151/health    # { status, db, redis }
```

---

## 7. Fase 4 — Consola analítica (`analytics/console`, Angular)

```bash
cd /var/www/encuesta-intt/analytics/console
npm ci
npm run build            # genera dist/console/browser
```

**Nginx de la consola** — `/etc/nginx/sites-available/consola-intt` (bind a la **IP de la intranet**,
nunca a `0.0.0.0`; `/api/` → back-office interno):

```nginx
server {
    listen <IP-Intranet>:4301;
    server_name _;
    root /var/www/encuesta-intt/analytics/console/dist/console/browser;
    index index.html;

    add_header Cache-Control "no-store, must-revalidate" always;

    location /api/ {
        proxy_pass http://127.0.0.1:3151/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / { try_files $uri /index.html; }
    location ~* \.html$ { add_header Cache-Control "no-store, must-revalidate" always; }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/consola-intt /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> La consola **no** expone el proxy `/seed/` de desarrollo: ese bloque existe sólo en el entorno
> Docker de desarrollo. En producción no se sirve el seeder.

---

## 8. Fase 5 — Nginx perimetral (captura, público) + TLS

Crea `/etc/nginx/sites-available/encuesta-intt` (basado en `vision-cero/deploy/nginx/default.conf`,
apuntando a `127.0.0.1:3001`):

```nginx
limit_req_zone $binary_remote_addr zone=survey_submit:10m rate=10r/m;

server {
    listen 80;
    server_name encuesta.intt.gob.ve;

    client_max_body_size 2m;
    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6; gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    location = /api/survey/submit {
        limit_req zone=survey_submit burst=5 nodelay;
        proxy_pass http://127.0.0.1:3001;
    }

    # ZERO-TRUST: admin/stats/participants/seed + panel /admin sólo desde intranet/VPN
    location ~ ^/(api/admin|api/survey/stats|api/survey/participants|api/survey/seed|admin) {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        # allow <IP_PUBLICA_FIJA>;   # si autorizas una IP fija
        deny all;
        proxy_pass http://127.0.0.1:3001;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/encuesta-intt /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo certbot --nginx -d encuesta.intt.gob.ve        # HTTPS + redirección 80→443
```

---

## 9. Fase 6 — Firewall y perímetro

```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp        # SSH (restringir a VPN / IP de administración)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**Nunca** abras a Internet `3001`, `3151`, `4301`, `5451` ni `6379`. El `4301` de la consola debe
escuchar **sólo** en la IP de la intranet (§7); el `3151` y la base sólo en `127.0.0.1`.

---

## 10. Fase 7 — Respaldos, sumarización y operación

**Respaldo diario** (crontab de `postgres`, 02:00, retención 30 días):

```bash
sudo mkdir -p /var/backups/encuesta-intt
sudo crontab -u postgres -e
```
```cron
0 2 * * * pg_dump -U intt_user -h 127.0.0.1 -p 5451 -Fc intt_encuesta | gzip > /var/backups/encuesta-intt/encuesta_$(date +\%F).dump.gz
15 2 * * * find /var/backups/encuesta-intt -name '*.dump.gz' -mtime +30 -delete
```

**Sumarización horaria** (dashboard CQRS), en el crontab de root:

```cron
0 * * * * cd /var/www/encuesta-intt/vision-cero && /usr/bin/npm run survey:summarize >> /var/log/encuesta-summarize.log 2>&1
```

**Operación con PM2:**

```bash
pm2 status
pm2 logs encuesta-intt encuesta-api
pm2 reload encuesta-intt     # recarga sin caída (zero-downtime)
pm2 monit
```

**Actualización:**

```bash
cd /var/www/encuesta-intt
git pull
# Captura
cd vision-cero && npm ci && npx prisma db push --accept-data-loss && npm run build && pm2 reload encuesta-intt
# Back-office
cd ../analytics/api && npm ci && npx prisma db push --schema prisma/schema.prisma --skip-generate --accept-data-loss && npm run build && pm2 reload encuesta-api
# Consola
cd ../console && npm ci && npm run build     # (Nginx sirve el nuevo dist automáticamente)
```

**Rollback:** `git checkout <tag-o-commit-anterior>` y repetir la actualización; restaura el respaldo
si cambió el esquema.

---

## 11. Verificación

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost/            # 200 (captura)
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3151/health # 200 (api interno)
pm2 status                                                            # procesos "online"
```

- Desde **fuera** de las redes privadas, `http://<IP-pública>/api/admin/` debe responder **403**.
- Desde la **intranet**, abrir `http://<IP-Intranet>:4301` y entrar con `STAFF_ADMIN_*`.
- Prueba de humo: `API=http://<IP-Intranet>:4301/api node vision-cero/tests/smoke-backoffice.mjs`.

## 12. Endurecimiento (checklist)

- [ ] `POSTGRES_PASSWORD`, `ANALYTICS_DB_PASSWORD`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `AUTH_SECRET`,
      `SEED_SUBMIT_SECRET` fuertes y distintos de los ejemplos.
- [ ] `STAFF_ADMIN_PASSWORD` cambiado.
- [ ] `TURNSTILE_*` reales.
- [ ] `.env` (`vision-cero/.env` y raíz) con `chmod 600` y fuera de control de versiones.
- [ ] `listen_addresses = '127.0.0.1'` en PostgreSQL; Redis en `127.0.0.1`.
- [ ] Consola (`:4301`) enlazada a la IP de intranet; `:3151` sólo en `127.0.0.1`.
- [ ] El seeder (`analytics/seed`) **no** se despliega en producción.

## 13. Alternativa automatizada (`install.sh` / `install.ps1`)

- **`install.sh`** (Linux, requiere `sudo`): asistente que instala paquetes, configura PostgreSQL
  (puerto `5451`), crea el `.env` de la captura, sincroniza Prisma, compila el standalone, arranca
  **PM2** en cluster, escribe el Nginx perimetral con **Zero-Trust**, habilita UFW y programa
  respaldos/sumarización por cron. Cubre **Fases 0–2, 5–6 y parte de la 7** para **la captura**;
  **no** despliega el back-office ni la consola (Fases 3–4 de esta guía).
- **`install.ps1`** (Windows): asistente de instalación **local** para desarrollo
  (`npm run dev` / `npm run build` + `npm start`); no es para producción.
- Guía nativa de referencia (más detallada en la parte de la captura):
  `docs/GUIA_IMPLEMENTACION_ONPREMISES.md`. **Nota:** esa guía usa el puerto `5432`; este repositorio
  adopta `5451` (ver `.akuri/00-manifest/ports.md`). Ajusta `DATABASE_URL` y `postgresql.conf` en
  consecuencia, o mantén el `5432` en todo el sistema de forma coherente.
