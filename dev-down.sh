#!/usr/bin/env bash
# Atajo desde la raíz del repo → scripts/dev-down.sh (apagar el entorno de desarrollo).
# Uso: ./dev-down.sh [--volumes] [--rmi local]
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/scripts/dev-down.sh" "$@"
