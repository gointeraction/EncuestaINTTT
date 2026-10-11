#!/usr/bin/env sh
# Entrypoint del back-office: crea/actualiza las tablas del esquema `analytics`
# (Prisma db push, idempotente) y arranca el servidor. El esquema `analytics` y
# el rol los crea el servicio `migrate` (superusuario) antes que este arranque.
set -e

echo "[api] sincronizando esquema analytics con Prisma..."
npx prisma db push --schema prisma/schema.prisma --skip-generate --accept-data-loss

echo "[api] iniciando servidor..."
exec node dist/main.js
