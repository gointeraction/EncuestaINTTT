#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/install.sh — Aprovisiona un servidor INTT y despliega.
#
# Crea el host (opcionalmente instala Docker), clona el repositorio en la rama del
# entorno, prepara el .env.<entorno> a partir de la plantilla y lanza deploy.sh.
# Es idempotente: si el repo ya existe, sólo actualiza la rama.
#
# Uso (como root o con sudo, si instalas Docker):
#   install.sh --env qa|production [--role all|webapp|database|lb]
#              [--branch <rama>] [--dir <ruta>] [--repo <url-git>]
#              [--with-docker] [--no-build] [--force-env]
#
# Ejemplos:
#   sudo install.sh --env production --role all --with-docker \
#        --repo https://git.intt.gob.ve/encuesta/EncuestaINTTT.git
#   sudo install.sh --env qa --role webapp --dir /opt/encuesta-intt/qa
# =============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

ENV_NAME=""; ROLE="all"; BRANCH=""; DEPLOY_ROOT=""; REPO_URL=""
WITH_DOCKER=0; BUILD=1; FORCE_ENV=0

usage() { sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --env|-e)     ENV_NAME="${2:?falta el valor de --env}"; shift 2;;
    --role|-r)    ROLE="${2:?falta el valor de --role}"; shift 2;;
    --branch|-b)  BRANCH="${2:?falta el valor de --branch}"; shift 2;;
    --dir|-d)     DEPLOY_ROOT="${2:?falta la ruta de --dir}"; shift 2;;
    --repo)       REPO_URL="${2:?falta la URL de --repo}"; shift 2;;
    --with-docker) WITH_DOCKER=1; shift;;
    --no-build)   BUILD=0; shift;;
    --force-env)  FORCE_ENV=1; shift;;
    -h|--help)    usage; exit 0;;
    *) die "opción desconocida: $1 (usa --help)";;
  esac
done

[ -n "$ENV_NAME" ] || die "falta --env qa|production"
env_allowed "$ENV_NAME" || die "entorno inválido: '$ENV_NAME' (válidos: $VALID_ENVS)"
role_allowed "$ROLE"    || die "rol inválido: '$ROLE' (válidos: $VALID_ROLES)"
[ -n "$BRANCH" ]      || BRANCH="$(env_to_branch "$ENV_NAME")"
[ -n "$DEPLOY_ROOT" ] || DEPLOY_ROOT="/opt/encuesta-intt/$ENV_NAME"
APP_ENV_FILE="$(env_to_file "$ENV_NAME")"

log "instalando entorno: $(env_to_label "$ENV_NAME") · rol: '$ROLE' · dir: $DEPLOY_ROOT"

# --- 1. Docker (opcional) ----------------------------------------------------
if [ "$WITH_DOCKER" = 1 ]; then
  if ! command -v docker >/dev/null 2>&1; then
    [ "$(id -u)" = "0" ] || die "--with-docker requiere root/sudo."
    log "instalando Docker Engine + plugin compose (get.docker.com)..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
  fi
fi
require_docker
require_git

# --- 2. Repositorio ----------------------------------------------------------
REPO_CHECKOUT="$DEPLOY_ROOT/repo"
if [ -d "$REPO_CHECKOUT/.git" ]; then
  log "repo ya presente; actualizando rama '$BRANCH'..."
  git -C "$REPO_CHECKOUT" fetch --all --prune
  git -C "$REPO_CHECKOUT" checkout "$BRANCH"
  git -C "$REPO_CHECKOUT" pull --ff-only || warn "git pull no pudo avanzar (¿cambios locales?)."
else
  [ -n "$REPO_URL" ] || die "el repo no existe en $REPO_CHECKOUT; indica --repo <url-git>."
  mkdir -p "$DEPLOY_ROOT"
  log "clonando '$REPO_URL' (rama '$BRANCH') en $REPO_CHECKOUT..."
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO_CHECKOUT"
fi

# --- 3. Archivo de entorno ---------------------------------------------------
ENV_PATH="$REPO_CHECKOUT/$APP_ENV_FILE"
if [ ! -f "$ENV_PATH" ] || [ "$FORCE_ENV" = 1 ]; then
  cp "$REPO_CHECKOUT/deploy/intt/env/$([ "$ENV_NAME" = qa ] && echo qa || echo produccion).env.example" "$ENV_PATH"
  chmod 600 "$ENV_PATH"
  warn "se creó $ENV_PATH a partir de la plantilla."
  warn "EDÍTALO ahora (contraseñas, IPs, Turnstile, rutas) y vuelve a ejecutar este comando."
  die "instalación detenida a propósito: completa $ENV_PATH y reintenta."
fi

# --- 4. Desplegar el rol -----------------------------------------------------
log "delegando en deploy.sh..."
bash "$REPO_CHECKOUT/deploy/intt/scripts/deploy.sh" \
  --env "$ENV_NAME" --role "$ROLE" --branch "$BRANCH" --env-file "$ENV_PATH" \
  $([ "$BUILD" = 0 ] && echo --no-build) --pull

ok "instalación finalizada: $(env_to_label "$ENV_NAME") en $REPO_CHECKOUT"
