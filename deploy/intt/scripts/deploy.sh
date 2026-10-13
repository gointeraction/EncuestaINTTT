#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/deploy.sh — Despliegue/actualización de un entorno INTT.
#
# Despliega QA o PRODUCCIÓN sobre los servidores del cliente, por ROL de servidor,
# usando el compose.yaml de la raíz + el override del rol. No crea el host: eso lo
# hace install.sh. Supone el repo ya clonado y el .env.<entorno> ya configurado.
#
# Uso:
#   deploy.sh --env qa|production [--role all|webapp|database|lb]
#             [--branch <rama>] [--pull] [--no-build] [--env-file <ruta>]
#
# Roles (según el dimensionamiento del cliente):
#   all       una sola VM con todo (por defecto)       -> 1 VM
#   database  VM-DATABASE  (PostgreSQL + Redis)        -> escenario 2 VMs
#   webapp    VM-WEB-APP   (migrate + app + api + admin)
#   lb        VM-WEB-LB01  (Nginx balanceando app01/app02) -> escenario 5 VMs
#
# Ejemplos:
#   deploy.sh --env production --role all --pull
#   deploy.sh --env qa --role webapp --branch calidad --pull
#   deploy.sh --env production --role database
# =============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

ENV_NAME=""; ROLE="all"; BRANCH=""; PULL=0; BUILD=1; APP_ENV_FILE=""

usage() { sed -n '2,29p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --env|-e)    ENV_NAME="${2:?falta el valor de --env}"; shift 2;;
    --role|-r)   ROLE="${2:?falta el valor de --role}"; shift 2;;
    --branch|-b) BRANCH="${2:?falta el valor de --branch}"; shift 2;;
    --pull)      PULL=1; shift;;
    --no-build)  BUILD=0; shift;;
    --env-file)  APP_ENV_FILE="${2:?falta la ruta}"; shift 2;;
    -h|--help)   usage; exit 0;;
    *) die "opción desconocida: $1 (usa --help)";;
  esac
done

[ -n "$ENV_NAME" ] || die "falta --env qa|production"
env_allowed "$ENV_NAME" || die "entorno inválido: '$ENV_NAME' (válidos: $VALID_ENVS)"
role_allowed "$ROLE"    || die "rol inválido: '$ROLE' (válidos: $VALID_ROLES)"
[ -n "$BRANCH" ]       || BRANCH="$(env_to_branch "$ENV_NAME")"
[ -n "$APP_ENV_FILE" ] || APP_ENV_FILE="$(env_to_file "$ENV_NAME")"
case "$APP_ENV_FILE" in /*) ;; *) APP_ENV_FILE="$REPO_DIR/$APP_ENV_FILE";; esac

cd "$REPO_DIR"
require_docker
require_git
[ -f "$APP_ENV_FILE" ] || die "no existe '$APP_ENV_FILE'. Cópialo de deploy/intt/env/ y edítalo."
assert_db_matches_env "$ENV_NAME"

export ROLE APP_ENV_FILE

log "entorno: $(env_to_label "$ENV_NAME") · rol: '$ROLE' · rama: '$BRANCH'"

if [ "$PULL" = 1 ]; then
  log "actualizando repo (git fetch + checkout '$BRANCH')..."
  git fetch --all --prune
  git checkout "$BRANCH"
  git pull --ff-only
fi

services="$(compose_services "$ROLE")"
build_flag=""; [ "$BUILD" = 1 ] && build_flag="--build"

log "levantando servicios: ${services:-<todos>} (build=${BUILD})"
# shellcheck disable=SC2086
compose up -d $build_flag --wait $services

ok "despliegue completado en $(env_to_label "$ENV_NAME")."
compose ps || true

bash "$LIB_DIR/health.sh" --env "$ENV_NAME" --role "$ROLE" || warn "el health-check reportó problemas (revisa 'docker compose ps' y los logs)."
