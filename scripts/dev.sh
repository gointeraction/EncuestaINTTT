#!/usr/bin/env bash
# ==============================================================================
# ENCUESTA VISIÓN CERO INTT — Entorno de DESARROLLO (autocontenido)
#
# Levanta con Docker Compose, en un solo paso, la base de datos junto con todas
# las aplicaciones:
#   · db      → PostgreSQL 16 (esquemas `public` y `analytics`, puerto interno 5451)
#   · cache   → Redis 7
#   · migrate → sincronización idempotente del esquema Prisma (one-shot)
#   · app     → encuesta "Visión Cero" (Next.js, tras el proxy Nginx)
#   · proxy   → Nginx (publica la captura)
#   · api     → back-office analítico (NestJS)
#   · admin   → consola de análisis (Angular, estáticos por Nginx)
#
# Uso:
#   scripts/dev.sh [up|down|restart|logs|ps]     (por defecto: up)
#
#   up        reconstruye y levanta todo en segundo plano, esperando healthchecks
#   down      detiene y elimina los contenedores (la data queda en el host: PG_DATA_DIR, def. ./db/postgres)
#   restart   reinicia los contenedores del stack
#   logs      sigue los logs (opcional: nombres de servicio, ej: `logs api app`)
#   ps        muestra el estado de los servicios
#
# Variables:
#   DEV_ENV_FILE   archivo de entorno a usar (por defecto: .env.development)
#
# Notas:
#   · El perfil `seed` NO arranca aquí; se invoca a demanda:
#       docker compose --env-file .env.development run --rm seed seed --profile large --seed 42
#   · `api`, `app`, `db` y `cache` viven en la red interna `intt-internal`. La ÚNICA
#     cara pública es la encuesta (proxy, vision-cero). La consola analítica es
#     privada de intranet: se enlaza sólo a ADMIN_BIND (por defecto 127.0.0.1).
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${DEV_ENV_FILE:-.env.development}"
ACTION="${1:-up}"
shift || true

if [ -t 1 ]; then
  C_RED=$'\033[0;31m'; C_GREEN=$'\033[0;32m'; C_YELLOW=$'\033[1;33m'
  C_CYAN=$'\033[0;36m'; C_NC=$'\033[0m'
else
  C_RED=; C_GREEN=; C_YELLOW=; C_CYAN=; C_NC=
fi

log()  { printf '%s[dev]%s %s\n'   "$C_CYAN"   "$C_NC" "$*"; }
ok()   { printf '%s[ok]%s %s\n'    "$C_GREEN"  "$C_NC" "$*"; }
warn() { printf '%s[!]%s %s\n'     "$C_YELLOW" "$C_NC" "$*"; }
err()  { printf '%s[error]%s %s\n' "$C_RED"    "$C_NC" "$*" >&2; }

usage() {
  sed -n '2,40p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

require_docker() {
  command -v docker >/dev/null 2>&1 \
    || { err "docker no está instalado o no está en PATH."; exit 1; }
  docker compose version >/dev/null 2>&1 \
    || { err "falta el plugin 'docker compose' (v2)."; exit 1; }
  docker info >/dev/null 2>&1 \
    || { err "el demonio de Docker no está accesible (¿servicio detenido o faltan permisos?)."; exit 1; }
}

require_env() {
  if [ ! -f "$ENV_FILE" ]; then
    err "no existe '$ENV_FILE' en $ROOT_DIR."
    err "creálo a partir de .env.example y completá POSTGRES_PASSWORD, ANALYTICS_DB_PASSWORD, etc."
    exit 1
  fi
}

read_var() {
  local v
  v="$(grep -E "^${1}=" "$ENV_FILE" | tail -n1 | cut -d= -f2- || true)"
  v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
  v="${v//[[:space:]]/}"
  if [ -n "$v" ]; then printf '%s' "$v"; else printf '%s' "$2"; fi
}

compose() { docker compose --env-file "$ENV_FILE" "$@"; }

print_urls() {
  local http_port admin_port
  http_port="$(read_var HTTP_PORT 80)"
  admin_port="$(read_var ADMIN_PORT 4301)"
  echo
  ok "entorno de desarrollo arriba."
  echo "   Encuesta Visión Cero (captura) : http://localhost:${http_port}"
  echo "   Consola analítica (Angular)    : http://localhost:${admin_port}"
  echo "   Internos (red intt-internal)   : api:3151  ·  app:3001  ·  db:5451  ·  cache:6379"
  echo
  log "logs: $(basename "$0") logs    ·    detener: $(basename "$0") down"
}

cmd_up() {
  log "levantando stack de desarrollo (db, cache, migrate, app, proxy, api, admin)..."
  if ! compose up -d --build --wait; then
    err "algún servicio no alcanzó estado saludable."
    compose ps
    exit 1
  fi
  print_urls
}

cmd_down() {
  log "deteniendo stack de desarrollo (incluye el perfil 'seed' y huérfanos)..."
  compose --profile seed down --remove-orphans
  ok "stack detenido (la data de PostgreSQL permanece en $(read_var PG_DATA_DIR ./db/postgres))."
}

cmd_restart() {
  log "reiniciando stack de desarrollo..."
  compose restart
  compose ps
}

cmd_logs() {
  if [ "$#" -eq 0 ]; then set -- --tail=100; else set -- --tail=100 "$@"; fi
  compose logs -f "$@"
}

cmd_ps() { compose ps; }

case "$ACTION" in
  up)          require_docker; require_env; cmd_up ;;
  down)        require_docker; require_env; cmd_down ;;
  restart)     require_docker; require_env; cmd_restart ;;
  logs)        require_docker; require_env; cmd_logs "$@" ;;
  ps)          require_docker; require_env; cmd_ps ;;
  -h|--help|help) usage ;;
  *)           err "acción desconocida: '$ACTION'"; echo; usage; exit 2 ;;
esac
