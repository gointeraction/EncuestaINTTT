#!/usr/bin/env bash
# =============================================================================
# deploy/intt/scripts/gen-deploy-key.sh — Genera un par de claves SSH (ed25519)
# para registrar en el GitLab del cliente (Deploy Key de lectura, o clave de
# usuario) y muestra la CLAVE PÚBLICA a pegar en GitLab.
#
# La clave PRIVADA nunca sale del host donde se ejecuta este script. Para que un
# servidor haga `git pull`, genera la clave EN ESE SERVIDOR y registra su pública.
# Para migrar el repositorio (empujar), genera la clave en la máquina de trabajo.
#
# Uso:
#   gen-deploy-key.sh [--name intt_gitlab] [--comment "<texto>"]
#                     [--out-dir ~/.ssh] [--passphrase] [--force]
#
# Por defecto crea ~/.ssh/intt_gitlab (y .pub) SIN passphrase (uso automatizado).
# =============================================================================
set -euo pipefail

NAME="intt_gitlab"
COMMENT="encuesta-intt deploy key"
OUT_DIR="${HOME}/.ssh"
USE_PASS=0
FORCE=0

usage() { sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --name|-n)    NAME="${2:?falta el nombre}"; shift 2;;
    --comment|-c) COMMENT="${2:?falta el comentario}"; shift 2;;
    --out-dir)    OUT_DIR="${2:?falta la ruta}"; shift 2;;
    --passphrase) USE_PASS=1; shift;;
    --force|-f)   FORCE=1; shift;;
    -h|--help)    usage; exit 0;;
    *) echo "[error] opción desconocida: $1 (usa --help)" >&2; exit 1;;
  esac
done

command -v ssh-keygen >/dev/null 2>&1 || { echo "[error] falta ssh-keygen (openssh-client)." >&2; exit 1; }
mkdir -p "$OUT_DIR"; chmod 700 "$OUT_DIR"

KEY="$OUT_DIR/$NAME"
if [ "$FORCE" = 1 ]; then rm -f "$KEY" "$KEY.pub"; fi
if [ -f "$KEY" ]; then
  echo "[error] ya existe '$KEY'. Usa --force para regenerar (invalida la pública registrada)." >&2
  exit 1
fi

if [ "$USE_PASS" = 1 ]; then
  ssh-keygen -t ed25519 -C "$COMMENT" -f "$KEY"
else
  ssh-keygen -t ed25519 -C "$COMMENT" -f "$KEY" -N ""
fi
chmod 600 "$KEY"; chmod 644 "$KEY.pub"

echo
echo "[ok] par de claves generado:"
echo "     privada: $KEY     (NO compartir; NUNCA al repo)"
echo "     pública: $KEY.pub"
echo
echo "================ CLAVE PÚBLICA (regístrala en GitLab) ================"
cat "$KEY.pub"
echo "====================================================================="
echo
cat <<'NEXT'
GitLab → grupo/proyecto → Settings → Repository → Deploy keys  (o Perfil → SSH Keys):
  1) Pega la clave pública de arriba.
  2) "Grant write permissions": actívalo SÓLO si ese host debe hacer push.
     Para servidores que únicamente hacen `git pull`, déjalo DESACTIVADO.
  3) Título sugerido: <host>/encuesta-intt.

Configura el host SSH (~/.ssh/config):

  Host gitlab.intt.gob.ve
      HostName gitlab.intt.gob.ve
      User git
      IdentityFile <ruta-de-la-clave-privada>
      IdentitiesOnly yes

Prueba y cambia el remoto:

  ssh -T git@gitlab.intt.gob.ve            # debe responder "Welcome to GitLab"
  git remote add intt git@gitlab.intt.gob.ve:<grupo>/EncuestaINTTT.git
  git push intt main desarrollo calidad produccion && git push intt --tags
NEXT
