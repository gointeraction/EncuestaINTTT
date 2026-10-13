#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/backup.sh — Respaldo de PostgreSQL (pg_dump) del entorno.
#
# Debe ejecutarse en el servidor que CORRE la base de datos (rol `database` o
# `all`). Guarda un .sql.gz fechado y purga los más antiguos que la retención.
#
# Uso:
#   backup.sh --env qa|production [--role database|all] [--out-dir <ruta>]
#             [--keep-days 30]
#
# Cron sugerido (en la VM-DATABASE), respaldo diario a las 02:00:
#   0 2 * * * /opt/encuesta-intt/production/repo/deploy/intt/scripts/backup.sh \
#             --env production --role database >> /var/log/encuesta-backup.log 2>&1
# =============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

ENV_NAME=""; ROLE="database"; APP_ENV_FILE=""; OUT_DIR=""; KEEP_DAYS=30

while [ $# -gt 0 ]; do
  case "$1" in
    --env|-e)   ENV_NAME="${2:?falta el valor de --env}"; shift 2;;
    --role|-r)  ROLE="${2:?falta el valor de --role}"; shift 2;;
    --out-dir)  OUT_DIR="${2:?falta la ruta}"; shift 2;;
    --keep-days) KEEP_DAYS="${2:?falta el valor}"; shift 2;;
    --env-file) APP_ENV_FILE="${2:?}"; shift 2;;
    -h|--help)  sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0;;
    *) die "opción desconocida: $1";;
  esac
done

[ -n "$ENV_NAME" ] || die "falta --env qa|production"
env_allowed "$ENV_NAME" || die "entorno inválido: '$ENV_NAME'"
case "$ROLE" in database|all) ;; *) die "el respaldo debe correr en el rol 'database' o 'all' (recibido: '$ROLE').";; esac
[ -n "$APP_ENV_FILE" ] || APP_ENV_FILE="$(env_to_file "$ENV_NAME")"
case "$APP_ENV_FILE" in /*) ;; *) APP_ENV_FILE="$REPO_DIR/$APP_ENV_FILE";; esac
[ -n "$OUT_DIR" ] || OUT_DIR="/var/backups/encuesta-intt/$ENV_NAME"

cd "$REPO_DIR"
require_docker
[ -f "$APP_ENV_FILE" ] || die "no existe '$APP_ENV_FILE'."
assert_db_matches_env "$ENV_NAME"
export ROLE APP_ENV_FILE

db_user="$(read_env_var POSTGRES_USER intt_user)"
db_name="$(read_env_var POSTGRES_DB "")"
db_port="$(read_env_var DB_PORT 5451)"
[ -n "$db_name" ] || die "POSTGRES_DB vacío en $APP_ENV_FILE."

mkdir -p "$OUT_DIR"
stamp="$(date +%F_%H%M)"
out="$OUT_DIR/backup_${db_name}_${stamp}.sql.gz"

log "respaldando base '$db_name' → $out"
compose exec -T db pg_dump -U "$db_user" -p "$db_port" "$db_name" | gzip > "$out"
ok "respaldo creado: $out ($(du -h "$out" | cut -f1))"

if [ "$KEEP_DAYS" -gt 0 ]; then
  find "$OUT_DIR" -type f -name "backup_*.sql.gz" -mtime "+$KEEP_DAYS" -print -delete || true
  ok "purga aplicada (retención ${KEEP_DAYS} días) en $OUT_DIR"
fi
