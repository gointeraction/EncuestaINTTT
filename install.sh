#!/usr/bin/env bash
# ==============================================================================
# INSTALADOR AUTOMATIZADO ON-PREMISES — ENCUESTA VISIÓN CERO INTT
# Plataforma: Ubuntu Server 22.04 / 24.04 LTS o Debian 12
# ==============================================================================

set -e

# Colores para salida interactiva
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "    INSTITUTO NACIONAL DE TRANSPORTE TERRESTRE (INTT) — VISIÓN CERO"
echo "        INSTALADOR AUTOMATIZADO DE PRODUCCIÓN (ON-PREMISES)"
echo "================================================================================"
echo -e "${NC}"

# 1. Verificación de permisos de root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERROR] Este instalador debe ejecutarse con privilegios de superusuario (root o sudo).${NC}"
    echo "Uso: sudo bash install.sh"
    exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo -e "${GREEN}[OK]${NC} Directorio de la aplicación detectado: ${BOLD}$APP_DIR${NC}\n"

# 2. Asistente interactivo de configuración
echo -e "${YELLOW}${BOLD}--- PASO 1: Parámetros de Configuración del Entorno ---${NC}"

# Dominio / Hostname
read -rp "Ingresa el Dominio o IP pública del servidor [ej: encuesta.intt.gob.ve]: " SERVER_DOMAIN
if [ -z "$SERVER_DOMAIN" ]; then
    SERVER_DOMAIN="localhost"
fi

# Contraseña PostgreSQL
read -rp "Ingresa la contraseña para el usuario PostgreSQL 'intt_user' [Dejar en blanco para autogenerar]: " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
    echo -e "  ${CYAN}-> Contraseña de BD autogenerada:${NC} ${BOLD}$DB_PASSWORD${NC}"
fi

# Contraseña Administrador
read -rp "Ingresa la contraseña para el Panel de Administración privado [Dejar en blanco para usar VisionCero2026!]: " ADMIN_PASSWORD
if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD="VisionCero2026!"
fi

# Claves Turnstile
echo -e "\n${YELLOW}Configuración de Cloudflare Turnstile (Protección anti-bot):${NC}"
read -rp "¿Deseas ingresar las claves reales de Cloudflare Turnstile ahora? (s/N): " USE_PROD_TURNSTILE

if [[ "$USE_PROD_TURNSTILE" =~ ^[sS]$ ]]; then
    read -rp "Site Key de Turnstile: " TURNSTILE_SITE_KEY
    read -rp "Secret Key de Turnstile: " TURNSTILE_SECRET_KEY
else
    echo -e "  ${CYAN}-> Se configurarán las claves de prueba de Cloudflare (siempre pasan).${NC}"
    TURNSTILE_SITE_KEY="1x00000000000000000000AA"
    TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
fi

# Restricción de Red Interna para el Dashboard
echo -e "\n${YELLOW}Configuración de Seguridad para el Dashboard (Acceso Solo Interno):${NC}"
echo -e "  Por defecto se autorizan las redes privadas: 127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"
read -rp "¿Deseas agregar alguna IP pública fija o subred adicional para los administradores? (opcional): " EXTRA_ADMIN_IP

CUSTOM_ALLOW=""
if [ -n "$EXTRA_ADMIN_IP" ]; then
    CUSTOM_ALLOW="allow ${EXTRA_ADMIN_IP};"
    echo -e "  ${CYAN}-> IP/Subred adicional autorizada:${NC} ${BOLD}$EXTRA_ADMIN_IP${NC}"
fi

echo -e "\n${GREEN}[OK] Parámetros registrados. Iniciando proceso de aprovisionamiento...${NC}\n"
sleep 2

# 3. Actualización e instalación de paquetes del sistema
echo -e "${BLUE}${BOLD}[1/8] Actualizando repositorios del sistema e instalando dependencias base...${NC}"
apt-get update -y
apt-get install -y curl git build-essential ufw nginx postgresql postgresql-contrib openssl

# 4. Instalación de Node.js 22 LTS si no existe o es inferior a v20
echo -e "${BLUE}${BOLD}[2/8] Verificando entorno Node.js...${NC}"
NODE_NEEDS_INSTALL=false
if ! command -v node >/dev/null 2>&1; then
    NODE_NEEDS_INSTALL=true
else
    NODE_VER=$(node -v | tr -d 'v' | cut -d'.' -f1)
    if [ "$NODE_VER" -lt 20 ]; then
        NODE_NEEDS_INSTALL=true
    fi
fi

if [ "$NODE_NEEDS_INSTALL" = true ]; then
    echo -e "  Instalando Node.js 22 LTS desde NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
echo -e "  ${GREEN}Node.js versión:${NC} $(node -v) | ${GREEN}npm versión:${NC} $(npm -v)"

# Instalar PM2 global
if ! command -v pm2 >/dev/null 2>&1; then
    echo -e "  Instalando PM2 (Process Manager)..."
    npm install -g pm2
fi

# 5. Configuración de Base de Datos PostgreSQL
echo -e "${BLUE}${BOLD}[3/8] Configurando base de datos PostgreSQL local...${NC}"
systemctl start postgresql
systemctl enable postgresql

su - postgres <<EOF
psql -tc "SELECT 1 FROM pg_user WHERE usename = 'intt_user'" | grep -q 1 || psql -c "CREATE USER intt_user WITH PASSWORD '$DB_PASSWORD' SUPERUSER;"
psql -tc "SELECT 1 FROM pg_database WHERE datname = 'intt_encuesta'" | grep -q 1 || psql -c "CREATE DATABASE intt_encuesta OWNER intt_user;"
psql -c "ALTER USER intt_user WITH PASSWORD '$DB_PASSWORD';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE intt_encuesta TO intt_user;"
EOF

# Optimización básica de postgresql.conf si no se ha aplicado antes
PG_CONF=$(ls /etc/postgresql/*/main/postgresql.conf 2>/dev/null | head -n 1 || true)
if [ -n "$PG_CONF" ] && ! grep -q "intt_tuning_applied" "$PG_CONF"; then
    echo -e "\n# --- intt_tuning_applied ---" >> "$PG_CONF"
    echo "shared_buffers = 1GB" >> "$PG_CONF"
    echo "work_mem = 16MB" >> "$PG_CONF"
    echo "effective_cache_size = 3GB" >> "$PG_CONF"
    echo "random_page_cost = 1.1" >> "$PG_CONF"
    systemctl restart postgresql
fi

# 6. Creación del archivo de configuración .env
echo -e "${BLUE}${BOLD}[4/8] Generando archivo de configuración .env...${NC}"
ADMIN_SECRET=$(openssl rand -hex 32)

cat > .env <<EOF
# Base de Datos PostgreSQL
DATABASE_URL="postgresql://intt_user:${DB_PASSWORD}@127.0.0.1:5432/intt_encuesta?schema=public"

# Credenciales del panel de administración (dashboard privado)
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_SECRET=${ADMIN_SECRET}

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY}
TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}
EOF

chmod 600 .env
echo -e "  ${GREEN}[OK]${NC} Archivo .env configurado y protegido."

# 7. Instalación de dependencias del proyecto y migración Prisma
echo -e "${BLUE}${BOLD}[5/8] Instalando dependencias de Node.js y sincronizando Prisma...${NC}"
npm install --production=false
npx prisma generate
npx prisma db push --accept-data-loss

# Importar datos de respaldo si existen y la BD está vacía
if [ -f "db/sqlite_backup.json" ]; then
    echo -e "  Verificando restauración de datos históricos..."
    npm run db:import-backup || true
fi

# 8. Compilación de Producción (Standalone)
echo -e "${BLUE}${BOLD}[6/8] Compilando la aplicación para producción (Next.js Standalone)...${NC}"
npm run build

# 9. Configuración de PM2 (Cluster Multi-Núcleo)
echo -e "${BLUE}${BOLD}[7/8] Configurando y arrancando PM2 en modo Cluster...${NC}"

cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: "encuesta-intt",
      script: ".next/standalone/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1"
      },
      max_memory_restart: "1G",
      autorestart: true,
      max_restarts: 10
    }
  ]
};
EOF

pm2 delete encuesta-intt >/dev/null 2>&1 || true
pm2 start ecosystem.config.js
pm2 save

# Habilitar inicio automático en systemd
ENV_PATH=$(which node)
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# 10. Configuración de Nginx
echo -e "${BLUE}${BOLD}[8/8] Configurando Servidor Web Nginx y Cortafuegos...${NC}"

cat > /etc/nginx/sites-available/encuesta-intt <<EOF
limit_req_zone \$binary_remote_addr zone=survey_submit_limit:10m rate=10r/m;

server {
    listen 80;
    server_name ${SERVER_DOMAIN};

    # Compresión Gzip activa
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    # Servir archivos estáticos directamente desde disco
    location /_next/static/ {
        alias ${APP_DIR}/.next/standalone/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public/ {
        alias ${APP_DIR}/public/;
        expires 30d;
        access_log off;
    }

    # Protección de tasa en el envío de respuestas
    location /api/survey/submit {
        limit_req zone=survey_submit_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # --------------------------------------------------------------------------
    # SEGURIDAD ZERO-TRUST: Acceso EXCLUSIVO a la administración desde Red Interna
    # --------------------------------------------------------------------------
    location ~ ^/(api/admin|api/survey/stats|api/survey/participants|api/survey/seed) {
        # Permitir localhost y subredes privadas (Intranet / VPN INTT)
        allow 127.0.0.1;
        allow 10.0.0.0/8;       # Red Corporativa INTT
        allow 172.16.0.0/12;    # VPN Institucional
        allow 192.168.0.0/16;   # LAN Oficinas
        ${CUSTOM_ALLOW}
        deny all;               # 403 Forbidden para todo el tráfico de Internet

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Proxy general hacia Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/encuesta-intt /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Firewall básico
ufw allow 'Nginx Full' >/dev/null 2>&1 || true

# 11. Tarea programada de Respaldo Diario (Cron)
mkdir -p /var/backups/encuesta-intt
cat > /etc/cron.d/backup-encuesta-intt <<EOF
# Respaldo automático diario de la base de datos a las 02:00 AM
0 2 * * * root PGPASSWORD='${DB_PASSWORD}' pg_dump -U intt_user -h 127.0.0.1 intt_encuesta | gzip > /var/backups/encuesta-intt/backup_\$(date +\%F).sql.gz && find /var/backups/encuesta-intt/ -type f -name "*.sql.gz" -mtime +30 -delete
EOF

# Guardar resumen de credenciales
CREDENTIALS_FILE="/root/intt_encuesta_credenciales.txt"
cat > "$CREDENTIALS_FILE" <<EOF
================================================================================
CREDENCIALES Y DATOS DEL DESPLIEGUE — ENCUESTA VISIÓN CERO INTT
Fecha de Instalación: $(date)
================================================================================
Dominio / Hostname:     http://${SERVER_DOMAIN}
Panel Privado (Admin):  http://${SERVER_DOMAIN}/?admin=1
Contraseña Administrador: ${ADMIN_PASSWORD}

Base de Datos:
  Motor:                PostgreSQL 16
  Host:                 127.0.0.1 (Puerto 5432)
  Base de Datos:        intt_encuesta
  Usuario:              intt_user
  Contraseña:           ${DB_PASSWORD}

Cloudflare Turnstile:
  Site Key:             ${TURNSTILE_SITE_KEY}
  Secret Key:           ${TURNSTILE_SECRET_KEY}

Rutas Clave del Sistema:
  Aplicación:           ${APP_DIR}
  Configuración .env:   ${APP_DIR}/.env
  Respaldos Automáticos: /var/backups/encuesta-intt/

Seguridad de Acceso:
  Dashboard Restringido: SÓLO accesible desde redes internas (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 ${EXTRA_ADMIN_IP})
  Tráfico de Internet:  403 Forbidden al intentar acceder a rutas administrativas.
================================================================================
EOF
chmod 600 "$CREDENTIALS_FILE"

# ==============================================================================
# PANTALLA FINAL
# ==============================================================================
clear
echo -e "${GREEN}${BOLD}"
echo "================================================================================"
echo "    ¡INSTALACIÓN Y PUESTA EN PRODUCCIÓN COMPLETADA EXITOSAMENTE!"
echo "================================================================================"
echo -e "${NC}"
echo -e "La plataforma de la Encuesta Visión Cero se encuentra activa y funcionando.\n"
echo -e "${BOLD}Acceso Web:${NC}"
echo -e "  * Portal Público:        ${CYAN}http://${SERVER_DOMAIN}${NC}"
echo -e "  * Dashboard Privado:     ${CYAN}http://${SERVER_DOMAIN}/?admin=1${NC}"
echo -e "  * Clave de Admin:        ${YELLOW}${ADMIN_PASSWORD}${NC}\n"

echo -e "${BOLD}Seguridad de Red Aplicada:${NC}"
echo -e "  * ${GREEN}El Dashboard está bloqueado para Internet público (403 Forbidden).${NC}"
echo -e "  * Solo es accesible desde la Intranet / VPN del INTT.\n"

echo -e "${BOLD}Comandos de Gestión del Servicio:${NC}"
echo -e "  * Ver estado del cluster: ${CYAN}pm2 status${NC}"
echo -e "  * Monitoreo en vivo:      ${CYAN}pm2 monit${NC}"
echo -e "  * Ver logs de la app:     ${CYAN}pm2 logs encuesta-intt${NC}"
echo -e "  * Reinicio sin caída:     ${CYAN}pm2 reload encuesta-intt${NC}\n"

echo -e "${YELLOW}Se ha guardado una copia de las credenciales en: ${BOLD}${CREDENTIALS_FILE}${NC}\n"
EOF
