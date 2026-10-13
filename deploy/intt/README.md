# deploy/intt/ — Despliegue en la infraestructura del cliente (INTT)

Instrucciones y scripts para **crear y actualizar dos entornos** en máquinas propias del INTT,
respetando el **dimensionamiento del cliente** y el modelo de ramas acordado:

| Entorno | Rama que despliega | `APP_ENV` | Base de datos | Guía |
|---------|--------------------|-----------|---------------|------|
| **QA / Calidad** | `calidad` | `qa` | `intt_encuesta_qa` | [`GUIA-QA.md`](./GUIA-QA.md) |
| **Producción** | `produccion` (protegida) | `production` | `intt_encuesta` | [`GUIA-PRODUCCION.md`](./GUIA-PRODUCCION.md) |

> Modelo de ramas, promoción y protección en GitLab: [`BRANCHES.md`](./BRANCHES.md).
> Migración al **GitLab propio del cliente**: los scripts reciben `--repo <url-git>`, así que
> sólo cambia la URL; no hay ninguna dependencia de GitHub.

---

## 1. Dimensionamiento del cliente (imagen de aprovisionamiento)

**Infraestructura ideal — 5 VMs**

| VM | Rol | vCPU | RAM | Almacenamiento | Servicios |
|----|-----|------|-----|----------------|-----------|
| **VM-WEB-LB01** | Borde / balanceo | 4 | 8 GB | 60 GB SSD | Nginx (LB) → APP01/APP02 |
| **VM-APP01** | Aplicación (nodo 1) | 6 | 12 GB | 80 GB SSD | `migrate` · `app` · `api` · `admin` |
| **VM-APP02** | Aplicación (nodo 2) | 6 | 12 GB | 80 GB SSD | `migrate` · `app` · `api` · `admin` |
| **VM-DB01** | Datos | 8 | 24 GB | 200 GB SSD NVMe | PostgreSQL |
| **VM-CACHE01** | Caché | 2 | 4 GB | 40 GB SSD | Redis |

**Total recomendado: 26 vCPU · 60 GB RAM · 460 GB** · Red: enlace simétrico **300 Mbps** (o 50 Mbps con CDN frontal).

**Escenario consolidado — 2 VMs** (datacenter con restricciones de hardware)

| VM | vCPU | RAM | Servicios |
|----|------|-----|-----------|
| **VM-WEB-APP** | 12 | 24 GB | Nginx + las 2 apps (o PM2 8 workers) + back-office/consola |
| **VM-DATABASE** | 8 | 24 GB | PostgreSQL + Redis |

El repo ya soporta además el **modo todo-en-uno (1 VM)** con Docker Compose, que es el **despliegue por
defecto** mientras la carga no exija separar roles (`docs/deploy/RECOMENDACION_DEPLOY.md`).

---

## 2. Topologías y «roles» de despliegue

Un mismo `compose.yaml` (raíz del repo) se despliega por **rol**; el script añade los overrides
necesarios y arranca sólo los servicios del rol.

| Rol (`--role`) | VM del cliente | Servicios que arranca | Override |
|----------------|----------------|-----------------------|----------|
| `all` | 1 sola VM (o *todo-en-uno*) | `db cache migrate app proxy api admin` | — |
| `database` | VM-DB01 / VM-DATABASE | `db cache` | — |
| `webapp` | VM-APP01, VM-APP02 / VM-WEB-APP | `migrate app api admin` | `compose/webapp.override.yaml` |
| `lb` | VM-WEB-LB01 | `proxy` (Nginx balanceando APP01+APP02) | `compose/lb.override.yaml` |

Mapa a cada escenario:

- **1 VM (por defecto):** `--role all` en la única máquina.
- **2 VMs (consolidado):** `--role database` en *VM-DATABASE*; `--role all` en *VM-WEB-APP* **salvo** que
  quieras separar borde y app → entonces `lb` + `webapp`. Como *VM-WEB-APP* ya trae Nginx+apps juntos,
  lo normal es `all` con `DB_HOST`/`REDIS_HOST` apuntando a *VM-DATABASE* — ver aviso abajo.
- **5 VMs (ideal):** `database` en *VM-DB01*; `webapp` en *VM-APP01* y *VM-APP02*; `lb` en *VM-WEB-LB01*.

> **Nota sobre `all` con base remota:** el modo `all` levanta `db`/`cache` locales. Si en el consolidado
> quieres que *VM-WEB-APP* use la base de *VM-DATABASE*, usa **roles partidos** (`webapp` en la VM de
> aplicación) o define `DB_HOST`/`REDIS_HOST` con el override `webapp`. No mezcles `all` local con BD remota.

> **Perímetro (regla de oro):** sólo `vision-cero` es público, tras el Nginx de borde. Todo `analytics/`
> (`api`, `admin`) es privado de intranet. Ver `.akuri/00-manifest/ports.md`.

---

## 3. Contenido de esta carpeta

```
deploy/intt/
├── README.md                      # este índice
├── BRANCHES.md                    # modelo de ramas + protección en GitLab
├── GUIA-QA.md                     # instalación paso a paso del entorno QA
├── GUIA-PRODUCCION.md             # instalación paso a paso del entorno de Producción
├── env/
│   ├── qa.env.example             # plantilla .env.qa
│   └── produccion.env.example     # plantilla .env.production
├── compose/
│   ├── webapp.override.yaml       # rol webapp (BD/Redis remotos)
│   └── lb.override.yaml           # rol lb (borde + balanceo)
├── nginx/
│   └── lb.conf.template           # config del balanceador (APP01/APP02 por envsubst)
└── scripts/
    ├── lib.sh                     # utilidades comunes
    ├── install.sh                 # aprovisiona host + clona + despliega
    ├── deploy.sh                  # despliegue/actualización por entorno y rol
    ├── rollback.sh                # vuelve a un tag/commit conocido
    ├── backup.sh                  # pg_dump + retención (cron diario)
    └── health.sh                  # verificación post-despliegue
```

---

## 4. Arranque rápido

### QA (servidor de calidad)

```bash
# En la VM destino (root o sudo si instalas Docker):
sudo deploy/intt/scripts/install.sh --env qa --role all --with-docker \
     --repo https://git.<cliente>/…/EncuestaINTTT.git
#   → crea /opt/encuesta-intt/qa/repo, clona la rama `calidad`,
#     genera .env.qa (lo editas con tus claves/IPs) y despliega.
```

### Producción

```bash
sudo deploy/intt/scripts/install.sh --env production --role all --with-docker \
     --repo https://git.<cliente>/…/EncuestaINTTT.git
#   → clona la rama `produccion` (protegida) y despliega.
```

### Actualizaciones posteriores

```bash
deploy/intt/scripts/deploy.sh --env production --role all --pull
deploy/intt/scripts/health.sh --env production --role all
```

---

## 5. Antes de producción (checklist)

- [ ] Claves reales: `POSTGRES_PASSWORD`, `ANALYTICS_DB_PASSWORD`, `STAFF_ADMIN_PASSWORD`, `ADMIN_PASSWORD`,
      `ADMIN_SECRET`, `SEED_SUBMIT_SECRET`.
- [ ] `TURNSTILE_*` **reales** (con las de prueba el anti-bot no se exige).
- [ ] `SEED_ALLOW` **ausente** y servicio `seed` fuera de la pila.
- [ ] `ADMIN_BIND` = IP de intranet o `127.0.0.1`, **nunca** `0.0.0.0`.
- [ ] TLS 443 terminado en el UTM/balanceador externo o en el Nginx de borde.
- [ ] Cron de respaldo (`scripts/backup.sh`) y de sumarización del dashboard.
- [ ] `docker compose … config` sin publicar `db`/`cache`/`api`; `admin` sólo en `ADMIN_BIND`.

Sigue con [`GUIA-PRODUCCION.md`](./GUIA-PRODUCCION.md) para el detalle.
