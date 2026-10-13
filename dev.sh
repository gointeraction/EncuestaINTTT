#!/usr/bin/env bash
# Atajo desde la raíz del repo → scripts/dev.sh (arranque del entorno de desarrollo).
# Uso: ./dev.sh [up|down|restart|reset|logs|ps]
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/scripts/dev.sh" "$@"
