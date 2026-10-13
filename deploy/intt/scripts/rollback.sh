#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/rollback.sh — Vuelve a una versión conocida (tag/commit).
#
# Hace checkout de un ref (tag o commit) y redespliega el rol sin hacer pull.
# NO revierte datos: la base de datos vive en PG_DATA_DIR y persiste.
#
# Uso:
#   rollback.sh --env qa|production [--role all|webapp|database|lb]
#               --ref <tag-o-commit> [--branch <rama-base>] [--no-build]
#
# Ejemplo:
#   rollback.sh --env production --role all --ref v1.2.0
# =============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

ENV_NAME=""; ROLE="all"; REF=""; BRANCH=""; BUILD=1; APP_ENV_FILE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --env|-e)   ENV_NAME="${2:?falta el valor de --env}"; shift 2;;
    --role|-r)  ROLE="${2:?falta el valor de --role}"; shift 2;;
    --ref)      REF="${2:?falta el tag/commit}"; shift 2;;
    --branch|-b) BRANCH="${2:?falta el valor de --branch}"; shift 2;;
    --no-build) BUILD=0; shift;;
    --env-file) APP_ENV_FILE="${2:?}"; shift 2;;
    -h|--help)  sed -n '2,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0;;
    *) die "opción desconocida: $1";;
  esac
done

[ -n "$ENV_NAME" ] || die "falta --env qa|production"
env_allowed "$ENV_NAME" || die "entorno inválido: '$ENV_NAME'"
role_allowed "$ROLE"    || die "rol inválido: '$ROLE'"
[ -n "$REF" ] || die "falta --ref <tag-o-commit>"
[ -n "$BRANCH" ] || BRANCH="$(env_to_branch "$ENV_NAME")"
[ -n "$APP_ENV_FILE" ] || APP_ENV_FILE="$(env_to_file "$ENV_NAME")"
case "$APP_ENV_FILE" in /*) ;; *) APP_ENV_FILE="$REPO_DIR/$APP_ENV_FILE";; esac

cd "$REPO_DIR"
require_docker
require_git
[ -f "$APP_ENV_FILE" ] || die "no existe '$APP_ENV_FILE'."

warn "ROLLBACK de $(env_to_label "$ENV_NAME") a '$REF' (rama base '$BRANCH')."
git fetch --all --prune --tags
if ! git rev-parse --verify --quiet "$REF^{commit}" >/dev/null; then
  die "el ref '$REF' no existe en el repo. ¿Hiciste 'git fetch --tags'?"
fi
git checkout "$REF"

log "redesplegando en el ref '$REF'..."
bash "$LIB_DIR/deploy.sh" --env "$ENV_NAME" --role "$ROLE" --branch "$REF" \
  --env-file "$APP_ENV_FILE" $([ "$BUILD" = 0 ] && echo --no-build)

ok "rollback completado a '$REF'."
warn "recuerda: para volver a la rama normal → git checkout $BRANCH && deploy.sh --env $ENV_NAME --pull"
