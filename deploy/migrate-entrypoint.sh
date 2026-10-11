#!/usr/bin/env bash
# =============================================================================
# One-shot schema sync for EncuestaINTTT (migrate service).
# Runs against PostgreSQL, then exits 0 so `app` can start.
#
# Env:
#   DB_SYNC=push|deploy   push (default): prisma db push --accept-data-loss
#                         deploy:         prisma migrate deploy (baselined migrations)
#   IMPORT_BACKUP=1       import db/sqlite_backup.json (legacy Visión Cero data)
#   SUMMARIZE=1           precompute the dashboard summary once
# =============================================================================
set -euo pipefail

echo "[migrate] waiting for DATABASE_URL..."
if [ -z "${DATABASE_URL:-}" ]; then
  echo "[migrate] FATAL: DATABASE_URL is not set"
  exit 1
fi

echo "[migrate] syncing schema (DB_SYNC=${DB_SYNC:-push})..."
if [ "${DB_SYNC:-push}" = "deploy" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --accept-data-loss
fi

if [ "${IMPORT_BACKUP:-0}" = "1" ] && [ -f db/sqlite_backup.json ]; then
  echo "[migrate] importing legacy backup..."
  npx tsx scripts/import-backup-to-postgres.ts || true
fi

if [ "${SUMMARIZE:-0}" = "1" ]; then
  echo "[migrate] precomputing dashboard summary..."
  npx tsx scripts/summarize.ts || true
fi

echo "[migrate] database ready."
