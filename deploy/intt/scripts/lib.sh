#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/lib.sh — Utilidades comunes de despliegue (INTT).
#
# Este archivo se "sourcea" desde el resto de los scripts. No se ejecuta solo.
# Define rutas, colores, validaciones, el mapa entorno/rama y el envoltorio
# `compose` que aplica el compose.yaml de la raíz + el override del rol.
# =============================================================================
set -euo pipefail

# --- Colores (sólo si hay terminal) -----------------------------------------
if [ -t 1 ]; then
  C_RED=$'\033[0;31m'; C_GREEN=$'\033[0;32m'; C_YELLOW=$'\033[1;33m'
  C_CYAN=$'\033[0;36m'; C_BOLD=$'\033[1m'; C_NC=$'\033[0m'
else
  C_RED=; C_GREEN=; C_YELLOW=; C_CYAN=; C_BOLD=; C_NC=
fi
log()  { printf '%s[intt]%s %s\n'    "$C_CYAN"   "$C_NC" "$*"; }
ok()   { printf '%s[ok]%s %s\n'      "$C_GREEN"  "$C_NC" "$*"; }
warn() { printf '%s[!]%s %s\n'       "$C_YELLOW" "$C_NC" "$*"; }
err()  { printf '%s[error]%s %s\n'   "$C_RED"    "$C_NC" "$*" >&2; }
die()  { err "$*"; exit 1; }

# --- Rutas (rellenas por quien sourcea) -------------------------------------
# lib.sh vive en <repo>/deploy/intt/scripts/.
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTT_DIR="$(cd "$LIB_DIR/.." && pwd)"       # <repo>/deploy/intt
REPO_DIR="$(cd "$INTT_DIR/../.." && pwd)"   # <repo>

# --- Vocabulario -------------------------------------------------------------
VALID_ENVS="qa production"
VALID_ROLES="all webapp database lb"
VALID_DBS="intt_encuesta_qa intt_encuesta"

env_allowed() { echo " $VALID_ENVS " | grep -q " $1 "; }
role_allowed() { echo " $VALID_ROLES " | grep -q " $1 "; }

env_to_file()   { case "$1" in qa) echo ".env.qa";; production) echo ".env.production";; *) die "APP_ENV desconocido: $1";; esac; }
env_to_branch() { case "$1" in qa) echo "calidad";; production) echo "produccion";; *) die "APP_ENV desconocido: $1";; esac; }
env_to_label()  { case "$1" in qa) echo "QA (rama calidad)";; production) echo "PRODUCCIÓN (rama produccion)";; esac; }

# --- Dependencias ------------------------------------------------------------
require_docker() {
  command -v docker >/dev/null 2>&1 || die "docker no está instalado o no está en PATH."
  docker compose version >/dev/null 2>&1 || die "falta el plugin 'docker compose' (v2)."
  docker info >/dev/null 2>&1 || die "el demonio de Docker no está accesible (¿servicio detenido o faltan permisos?)."
}
require_git() { command -v git >/dev/null 2>&1 || die "git no está instalado o no está en PATH."; }

# --- Compose por rol ---------------------------------------------------------
# Override adicional (además del compose.yaml de la raíz). Vacío = sólo la base.
compose_files() {
  case "$1" in
    all|database) printf '%s' "" ;;
    webapp)       printf '%s' "-f deploy/intt/compose/webapp.override.yaml" ;;
    lb)           printf '%s' "-f deploy/intt/compose/lb.override.yaml" ;;
    *) die "rol desconocido: $1" ;;
  esac
}
# Servicios a arrancar por rol (vacío = todos los del compose base).
compose_services() {
  case "$1" in
    all)      printf '%s' "" ;;
    database) printf '%s' "db cache" ;;
    webapp)   printf '%s' "migrate app api admin" ;;
    lb)       printf '%s' "proxy" ;;
    *) die "rol desconocido: $1" ;;
  esac
}

# Ejecuta `docker compose` desde la raíz del repo con:
#   · el compose.yaml base
#   · el override del rol   (ROLE)
#   · el env-file correcto  (APP_ENV_FILE)
# Variables requeridas antes de llamar: ROLE, APP_ENV_FILE.
compose() {
  local files
  files="$(compose_files "$ROLE")"
  # shellcheck disable=SC2086
  docker compose -f compose.yaml $files --env-file "$APP_ENV_FILE" "$@"
}

# Lee una variable del env-file (última definición gana), con valor por defecto.
read_env_var() {
  local key="$1" def="${2:-}" v
  v="$(grep -E "^${key}=" "$APP_ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
  v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
  v="$(printf '%s' "$v" | tr -d '[:space:]')"
  if [ -n "$v" ]; then printf '%s' "$v"; else printf '%s' "$def"; fi
}

# Guarda del perímetro: la base de datos debe coincidir con la del entorno.
assert_db_matches_env() {
  local env="$1" db
  db="$(read_env_var POSTGRES_DB "")"
  local want; [ "$env" = "qa" ] && want="intt_encuesta_qa" || want="intt_encuesta"
  if [ -z "$db" ]; then
    die "POSTGRES_DB vacío en $APP_ENV_FILE."
  fi
  if [ "$db" != "$want" ]; then
    die "POSTGRES_DB='$db' no corresponde al entorno '$env' (esperado: '$want')."
  fi
}
