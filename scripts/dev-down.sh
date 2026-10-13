#!/usr/bin/env bash
# ==============================================================================
# ENCUESTA VISIÓN CERO INTT — Apagar el entorno de DESARROLLO
#
# Detiene y elimina TODOS los contenedores del stack de desarrollo:
#   db · cache · migrate · app · proxy · api · admin
#   (+ el servicio `seed` del perfil opcional, y contenedores huérfanos)
#
# Los DATOS NO se borran: PostgreSQL vive en el bind mount `PG_DATA_DIR`
# (`./db/postgres` en desarrollo) y Redis en `./.data/<entorno>/redis`; este script
# los deja intactos.
#
# Uso:
#   scripts/dev-down.sh [opciones]
#
# Opciones:
#   -h, --help      muestra esta ayuda
#   --volumes       además elimina volúmenes nombrados de Docker (los datos en
#                   ./.data siguen intactos; solo afecta volúmenes declarados)
#   --rmi local     además elimina las imágenes construidas localmente
#   (cualquier otra opción se pasa tal cual a `docker compose down`)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${DEV_ENV_FILE:-.env.development}"

if [ -t 1 ]; then
  C_RED=$'\033[0;31m'; C_GREEN=$'\033[0;32m'; C_CYAN=$'\033[0;36m'; C_NC=$'\033[0m'
else
  C_RED=; C_GREEN=; C_CYAN=; C_NC=
fi

log() { printf '%s[dev]%s %s\n'   "$C_CYAN"  "$C_NC" "$*"; }
ok()  { printf '%s[ok]%s %s\n'    "$C_GREEN" "$C_NC" "$*"; }
err() { printf '%s[error]%s %s\n' "$C_RED"   "$C_NC" "$*" >&2; }

usage() {
  sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

EXTRA_ARGS=()
for arg in "$@"; do
  case "$arg" in
    -h|--help) usage; exit 0 ;;
    *) EXTRA_ARGS+=("$arg") ;;
  esac
done

command -v docker >/dev/null 2>&1 \
  || { err "docker no está instalado o no está en PATH."; exit 1; }
docker compose version >/dev/null 2>&1 \
  || { err "falta el plugin 'docker compose' (v2)."; exit 1; }
docker info >/dev/null 2>&1 \
  || { err "el demonio de Docker no está accesible (¿servicio detenido o faltan permisos?)."; exit 1; }

if [ ! -f "$ENV_FILE" ]; then
  err "no existe '$ENV_FILE' en $ROOT_DIR."
  exit 1
fi

log "apagando el entorno de desarrollo (incluye el perfil 'seed' y huérfanos)..."
docker compose --env-file "$ENV_FILE" --profile seed down --remove-orphans "${EXTRA_ARGS[@]}"

pg_dir="$(grep -E '^PG_DATA_DIR=' "$ENV_FILE" | tail -n1 | cut -d= -f2- | tr -d '"[:space:]' || true)"
pg_dir="${pg_dir:-./db/postgres}"
ok "entorno de desarrollo detenido. Data de PostgreSQL conservada en ${pg_dir}."
