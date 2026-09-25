# Guía de Implementación y Despliegue On-Premises
**Proyecto:** Encuesta Visión Cero — Instituto Nacional de Transporte Terrestre (INTT)  
**Objetivo:** Puesta en producción de alta concurrencia (1.000.000 de encuestas en 15 días)  
**Sistema Operativo Objetivo:** Linux (Ubuntu Server 22.04 / 24.04 LTS o Debian 12)

---

## 1. Arquitectura de Producción

```mermaid
graph TD
    Internet((Usuarios / Internet)) --> Firewall[Firewall Perimetral: Puertos 80, 443]
    Firewall --> Nginx[Nginx: Terminación SSL, Gzip, Caché Estática, Rate Limit]
    
    subgraph "Capa de Aplicación (Cluster PM2)"
        Nginx -->|Proxy Pass 127.0.0.1:3000| PM2[PM2 Cluster Mode]
        PM2 --> W1[Worker Node 1]
        PM2 --> W2[Worker Node 2]
        PM2 --> W3[Worker Node 3]
        PM2 --> W4[Worker Node 4]
    end
    
    subgraph "Capa de Datos"
        W1 --> PG[(PostgreSQL 16 / Puerto 5432)]
        W2 --> PG
        W3 --> PG
        W4 --> PG
    end
```

---

## 2. Fase 1: Preparación del Servidor y Dependencias

Conéctate por SSH al servidor de producción con privilegios `sudo`:

```bash
# 1. Actualizar lista de paquetes del sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar paquetes base necesarios
sudo apt install -y curl git build-essential ufw nginx postgresql postgresql-contrib

# 3. Instalar Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Instalar PM2 globalmente
sudo npm install -g pm2

# 5. Configurar el Firewall básico (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Verificar que las versiones sean las correctas:
```bash
node -v    # v22.x o v24.x
npm -v     # 10.x o superior
psql --version # PostgreSQL 16.x o superior
```

---

## 3. Fase 2: Configuración de PostgreSQL

1. Ingresar a la consola interactiva de PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```

2. Ejecutar los comandos SQL de inicialización:
   ```sql
   -- 1. Crear el usuario con contraseña segura
   CREATE USER intt_user WITH PASSWORD 'TuContrasenaSegura2026!';

   -- 2. Crear la base de datos asignando al usuario como propietario
   CREATE DATABASE intt_encuesta OWNER intt_user;

   -- 3. Otorgar todos los privilegios sobre la base de datos
   GRANT ALL PRIVILEGES ON DATABASE intt_encuesta TO intt_user;

   -- Salir de psql
   \q
   ```

3. **(Opcional para alto rendimiento)** Ajustar parámetros en `/etc/postgresql/16/main/postgresql.conf`:
   ```ini
   shared_buffers = 4GB                  # 25% de la memoria RAM del servidor
   effective_cache_size = 12GB           # 75% de la memoria RAM
   work_mem = 16MB
   random_page_cost = 1.1                # Si usas discos SSD/NVMe
   max_connections = 200
   ```
   Reiniciar el servicio de base de datos tras editar:
   ```bash
   sudo systemctl restart postgresql
   ```

---

## 4. Fase 3: Despliegue del Código Fuente y Variables de Entorno

1. Crear el directorio de despliegue y asignar permisos:
   ```bash
   sudo mkdir -p /var/www/encuesta-intt
   sudo chown -R $USER:$USER /var/www/encuesta-intt
   cd /var/www/encuesta-intt
   ```

2. Clonar el repositorio del proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO> .
   ```

3. Crear y configurar el archivo de variables de entorno `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```

4. Contenido requerido para el archivo `.env`:
   ```env
   # Cadena de conexión PostgreSQL (reemplazar contraseña)
   DATABASE_URL="postgresql://intt_user:TuContrasenaSegura2026!@127.0.0.1:5432/intt_encuesta?schema=public"

   # Panel de administración privado (/?admin=1)
   ADMIN_PASSWORD="VisionCero2026!AdminProduccion"
   ADMIN_SECRET="genera_una_clave_aleatoria_sha256_de_64_caracteres"

   # Cloudflare Turnstile (claves reales obtenidas de dash.cloudflare.com)
   TURNSTILE_SITE_KEY="0x4AAAAAA..."
   TURNSTILE_SECRET_KEY="0x4AAAAAA..."
   ```

---

## 5. Fase 4: Instalación, Migración y Compilación

1. **Instalar dependencias del proyecto:**
   ```bash
   npm install --production=false
   ```

2. **Crear tablas e índices en PostgreSQL mediante Prisma:**
   ```bash
   npx prisma db push
   ```

3. **(Opcional) Cargar el respaldo de datos existentes si aplica:**
   ```bash
   npm run db:import-backup
   ```

4. **Compilar la aplicación para Producción (modo Standalone):**
   ```bash
   npm run build
   ```
   *(Este proceso compila la aplicación y copia los assets estáticos a `.next/standalone`)*.

---

## 6. Fase 5: Configuración de PM2 (Cluster Multi-Núcleo)

1. Crear el archivo `ecosystem.config.js` en la raíz del proyecto:
   ```bash
   nano ecosystem.config.js
   ```

2. Pegar la siguiente configuración:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "encuesta-intt",
         script: ".next/standalone/server.js",
         instances: "max",           // Un proceso worker por cada núcleo de CPU
         exec_mode: "cluster",       // Balanceo de carga nativo
         env: {
           NODE_ENV: "production",
           PORT: 3000,
           HOSTNAME: "127.0.0.1"
         },
         max_memory_restart: "1G",   // Reinicio preventivo si supera 1 GB
         autorestart: true,
         max_restarts: 10
       }
     ]
   };
   ```

3. Iniciar la aplicación y fijar el inicio automático en el arranque del servidor:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```
   *(Copia y ejecuta la línea que imprime `pm2 startup` para activar el servicio de systemd)*.

---

## 7. Fase 6: Configuración del Servidor Web Nginx

1. Crear el archivo de configuración para el sitio:
   ```bash
   sudo nano /etc/nginx/sites-available/encuesta-intt
   ```

2. Pegar la configuración optimizada para alto tráfico y protección contra bots:
   ```nginx
   # Límite de tasa perimetral en el endpoint de envío
   limit_req_zone $binary_remote_addr zone=survey_submit:10m rate=10r/m;

   server {
       listen 80;
       server_name encuesta.intt.gob.ve; # Reemplazar con el dominio o IP

       # Compresión Gzip para reducir transferencia de ancho de banda
       gzip on;
       gzip_vary on;
       gzip_proxied any;
       gzip_comp_level 6;
       gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
       gzip_min_length 256;

       # Servir archivos estáticos directamente desde disco con caché larga
       location /_next/static/ {
           alias /var/www/encuesta-intt/.next/standalone/.next/static/;
           expires 365d;
           access_log off;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       location /public/ {
           alias /var/www/encuesta-intt/public/;
           expires 30d;
           access_log off;
       }

       # Rate limiting en el endpoint de envío
       location /api/survey/submit {
           limit_req zone=survey_submit burst=5 nodelay;
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # SEGURIDAD ZERO-TRUST: Acceso EXCLUSIVO al Dashboard y APIs Admin desde Red Interna
       location ~ ^/(api/admin|api/survey/stats|api/survey/participants|api/survey/seed) {
           # Permitir exclusivamente la Intranet y VPN institucional:
           allow 127.0.0.1;       # Servidor local
           allow 10.0.0.0/8;       # Red Corporativa INTT
           allow 172.16.0.0/12;    # VPN Institucional
           allow 192.168.0.0/16;   # LAN Oficinas
           # allow 200.x.x.x;     # (Opcional) IP pública fija de directivos
           
           # Bloquear a todo el resto de Internet con 403 Forbidden:
           deny all;

           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Proxy general hacia Next.js
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
```

   > [!NOTE]
   > **Seguridad de Acceso Interno al Dashboard:**
   > La sección `location ~ ^/(api/admin...)` restringe el acceso al panel administrativo y sus endpoints exclusivamente a las direcciones de la Intranet y VPN institucional (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`). Cualquier solicitud proveniente de Internet público recibirá un código **403 Forbidden**. Si requieres autorizar una IP pública adicional (por ejemplo, la IP fija de un directivo), solo debes añadir una línea `allow IP_PUBLICA;` antes de `deny all;`.

3. Activar el sitio y reiniciar Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/encuesta-intt /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Instalación de Certificado SSL (HTTPS):**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d encuesta.intt.gob.ve
   ```

---

## 8. Fase 7: Respaldos Automáticos y Monitoreo

### A. Respaldo Diario de Base de Datos (Cron)
Crea un directorio para respaldos y programa una tarea periódica:
```bash
sudo mkdir -p /var/backups/postgresql
sudo chown postgres:postgres /var/backups/postgresql
```

Edita el cron del usuario `postgres`:
```bash
sudo crontab -u postgres -e
```

Agrega la siguiente línea para respaldar la base de datos todos los días a las 02:00 AM:
```cron
0 2 * * * pg_dump -d intt_encuesta -Fc | gzip > /var/backups/postgresql/encuesta_$(date +\%F).dump.gz
```

### B. Programación del Proceso de Sumarización (Fast Dashboard)
Para que el Dashboard gerencial cargue en tiempo récord (< 5 ms) sin saturar el servidor, configure la ejecución periódica del proceso de sumarización por lotes:

```bash
# Editar el crontab del sistema
sudo crontab -e
```

Añadir la tarea para recalcular métricas consolidadas cada hora (o según requerimiento institucional):
```cron
# Sumarización de métricas analíticas cada hora
0 * * * * cd /var/www/encuesta-intt && /usr/bin/npm run survey:summarize >> /var/log/encuesta-summarize.log 2>&1
```

Para más detalles, consulte la [Guía Técnica del Proceso de Sumarización](PROCESO_SUMARIZACION.md).

### C. Comandos Útiles de Operación

* **Ver estado de los procesos de la app:**
  ```bash
  pm2 status
  pm2 monit
  ```
* **Ver logs en tiempo real:**
  ```bash
  pm2 logs encuesta-intt
  sudo tail -f /var/log/nginx/error.log
  ```
* **Reiniciar la aplicación con cero tiempo de inactividad (Zero-Downtime Reload):**
  ```bash
  pm2 reload encuesta-intt
  ```
* **Actualizaciones futuras de código:**
  ```bash
  cd /var/www/encuesta-intt
  git pull origin main
  npm install
  npx prisma db push
  npm run build
  pm2 reload encuesta-intt
  ```
