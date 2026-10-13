#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/health.sh — Verificación post-despliegue (por rol).
#
# Comprueba el estado de salud de los contenedores del rol y, cuando el rol
# publica el borde (all/lb), hace un HTTP check contra /healthz.
#
# Uso:
#   health.sh --env qa|production [--role all|webapp|database|lb]
# =============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

ENV_NAME=""; ROLE="all"; APP_ENV_FILE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --env|-e)   ENV_NAME="${2:?falta el valor de --env}"; shift 2;;
    --role|-r)  ROLE="${2:?falta el valor de --role}"; shift 2;;
    --env-file) APP_ENV_FILE="${2:?}"; shift 2;;
    -h|--help)  sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0;;
    *) die "opción desconocida: $1";;
  esac
done

[ -n "$ENV_NAME" ] || die "falta --env qa|production"
env_allowed "$ENV_NAME" || die "entorno inválido: '$ENV_NAME'"
role_allowed "$ROLE"    || die "rol inválido: '$ROLE'"
[ -n "$APP_ENV_FILE" ] || APP_ENV_FILE="$(env_to_file "$ENV_NAME")"
case "$APP_ENV_FILE" in /*) ;; *) APP_ENV_FILE="$REPO_DIR/$APP_ENV_FILE";; esac

cd "$REPO_DIR"
require_docker
[ -f "$APP_ENV_FILE" ] || die "no existe '$APP_ENV_FILE'."
export ROLE APP_ENV_FILE

# Servicios con healthcheck esperados por rol (migrate/seed son one-shot, se omiten).
expected_services() {
  case "$1" in
    all)      echo "db cache app proxy api admin" ;;
    database) echo "db cache" ;;
    webapp)   echo "app api admin" ;;
    lb)       echo "proxy" ;;
  esac
}

fail=0
log "estado del despliegue — $(env_to_label "$ENV_NAME") · rol '$ROLE'"
compose ps || true

for svc in $(expected_services "$ROLE"); do
  line="$(compose ps "$svc" --format '{{.Service}}|{{.State}}|{{.Health}}' 2>/dev/null | head -n1 || true)"
  state="$(printf '%s' "$line" | cut -d'|' -f2)"
  health="$(printf '%s' "$line" | cut -d'|' -f3)"
  if [ "$state" != "running" ]; then
    err "servicio '$svc': estado '$state' (esperado running)"
    fail=1
  elif [ -n "$health" ] && [ "$health" != "healthy" ]; then
    err "servicio '$svc': health '$health' (esperado healthy)"
    fail=1
  else
    ok "servicio '$svc': running ${health:+/ $health}"
  fi
done

# HTTP check del borde público (sólo si el rol lo publica).
if [ "$ROLE" = "all" ] || [ "$ROLE" = "lb" ]; then
  port="$(read_env_var HTTP_PORT 80)"
  url="http://127.0.0.1:${port}/healthz"
  code="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 5 "$url" || true)"
  if [ "$code" = "200" ]; then
    ok "borde público responde 200 en $url"
  else
    err "el borde público NO respondió 200 en $url (código='${code:-sin respuesta}')"
    fail=1
  fi
fi

if [ "$fail" = 0 ]; then
  ok "health-check PASS"
else
  err "health-check FAIL"
  exit 1
fi
