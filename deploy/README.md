# deploy/ — Guías de arranque y despliegue

Instructivos operativos de **Encuesta Visión Cero (INTT)**. Hay dos audiencias:

| Guía | Audiencia | Para qué |
|------|-----------|----------|
| [`GUIA-DESARROLLO.md`](./GUIA-DESARROLLO.md) | Desarrolladores / QA | Levantar el entorno de **desarrollo y pruebas** (Docker Compose) y correr el seeder y las pruebas. |
| [`GUIA-DESPLIEGUE.md`](./GUIA-DESPLIEGUE.md) | DevOps / Infraestructura | Desplegar correctamente en **producción** (on-premises), con el perímetro público/intranet y los respaldos. |
| [`GUIA-ALTERNATIVA-NO-DOCKER.md`](./GUIA-ALTERNATIVA-NO-DOCKER.md) | DevOps / Infraestructura | Desplegar **sin Docker** (PostgreSQL + Node + PM2 + Nginx nativos), cuando no se permite contenedores. |

## Modelo en una frase

`vision-cero` (la encuesta, tras el proxy Nginx) es la **única cara pública**; todo `analytics/`
(back-office NestJS + consola Angular) es **privado de intranet**. Ver
`.akuri/00-manifest/ports.md` y `.akuri/00-manifest/environments.md`.

## Archivos de referencia

- `compose.yaml` — pila única, dos entornos por configuración (`dev` / `prod`).
- `scripts/dev.sh`, `scripts/dev-down.sh` — atajos de desarrollo.
- `.env.example` — plantilla de entorno (los `.env*` reales no se versionan).
- `install.sh`, `install.ps1` — instalador **nativo** (PM2 + Nginx, sin Docker); alternativa legacy.
- `docs/deploy/RECOMENDACION_DEPLOY.md` — dimensionamiento de hardware y conectividad.
