# Plataforma de Encuesta "Visión Cero" — INTT

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F18-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![Licencia](https://img.shields.io/badge/Uso-Institucional%20INTT-1c2454)]()

Sistema integral de recolección masiva de información ciudadana y analítica en tiempo real desarrollado para el **Instituto Nacional de Transporte Terrestre (INTT)** de la República Bolivariana de Venezuela, en el marco del programa nacional:  
**"Hacia una Visión Cero en Siniestros de Motocicletas"**.

---

## 📋 Tabla de Contenidos

1. [Objetivos del Proyecto y Metas de Carga](#-objetivos-del-proyecto-y-metas-de-carga)
2. [Funcionalidades de la Plataforma](#-funcionalidades-de-la-plataforma)
3. [Arquitectura del Sistema e Infraestructura](#-arquitectura-del-sistema-e-infraestructura)
4. [Modelo de Seguridad y Protección Anti-Bot](#-modelo-de-seguridad-y-protección-anti-bot)
5. [Pila Tecnológica (Tech Stack)](#-pila-tecnológica-tech-stack)
6. [Instalación y Despliegue](#-instalación-y-despliegue)
   - [A. Despliegue Automatizado On-Premises (Linux Ubuntu / Debian)](#a-despliegue-automatizado-on-premises-linux)
   - [B. Instalación Local para Desarrollo (Windows)](#b-instalación-local-para-desarrollo-windows)
   - [C. Despliegue Manual Paso a Paso](#c-despliegue-manual-paso-a-paso)
7. [Accesos y Credenciales](#-accesos-y-credenciales)
8. [Estructura del Proyecto](#-estructura-del-proyecto)
9. [Mantenimiento y Respaldos](#-mantenimiento-y-respaldos)
10. [Documentación Técnica Adicional](#-documentación-técnica-adicional)

---

## 🎯 Objetivos del Proyecto y Metas de Carga

* **Objetivo de Negocio:** Recolectar datos diagnósticos directos de **1.000.000 de conductores y ciudadanos** en un período de **15 días continuos**.
* **Tráfico Concurrente Estimado:**
  * **2.000.000 a 3.000.000 de visitantes únicos** (considerando deserción y navegación).
  * **30 a 50 transacciones por segundo (POST / Submits)** en horas de máxima difusión institucional.
  * **350 a 600 solicitudes HTTP por segundo (RPS)** en el servidor perimetral.
* **Modelo de Despliegue:** Centro de Datos Local (**On-Premises**) del INTT, con base de datos **PostgreSQL 16/18** y balanceo multinúcleo en PM2 y Nginx.

---

## ✨ Funcionalidades de la Plataforma

### 1. Formulario de Encuesta Adaptativa (Branching Dinámico)
* **6 Perfiles de Conductor (`DriverTypeId`):**
  1. *Motociclista activo:* Conduce moto por uso particular cotidiano.
  2. *Delivery / Mensajero:* Conducción laboral comercial o plataformas de entrega.
  3. *Mototaxista:* Transporte público individual de pasajeros.
  4. *Ex-motociclista:* Persona que conducía moto en el pasado.
  5. *Familiar de víctima:* Afectados indirectos de siniestros viales.
  6. *Otro conductor / Peatón:* Usuarios de vehículos de 4 ruedas o transeúntes.
* **Filtrado Inteligente (`appliesTo`):** Cada encuestado responde únicamente entre **22 y 51 preguntas** pertinentes a su perfil.
* **Preguntas Condicionales (`showIf`):** Preguntas subordinadas que aparecen/desaparecen reactivamente según respuestas anteriores (ej. tipo de licencia, gravedad del siniestro sufrido, causas).
* **Pregunta Compuesta Geográfica (Venezuela):** Selector dependiente de **Estado y Municipio** que cubre las 24 entidades federales del país y sus respectivos municipios oficiales.

### 2. Módulo de Incentivos y Sorteo
* **Participación Optativa:** El encuestado puede responder de forma 100% anónima o activar el sorteo de incentivos.
* **Validación de Cédula Venezolana:** Normalización estricta (`V-` o `E-` seguido de 6 a 8 dígitos).
* **Validación de Telefonía Móvil:** Detección de prefijos nacionales (`0412`, `0414`, `0424`, `0416`, `0426`) y formateo internacional canónico (`+58-XXX-XXXXXXX`).
* **Prevención de Fraude:** Regla de unicidad en base de datos para impedir doble participación de una misma cédula.
* **Generación de Código Único:** Algoritmo alfanumérico seguro de 8 caracteres (sin letras ambiguas `0/O/1/I`) entregado al ciudadano en la pantalla final.

### 3. Dashboard Privado de Estadísticas e Indicadores (~46 Métricas)
* **8 Tarjetas KPI Principales:** Total de respuestas, distribución por tipo de conductor, edad promedio, porcentaje de siniestralidad, años promedio conduciendo, km/día, tasa de uso de casco y licencia vigente.
* **6 Indicadores Radiales de Percepción:** Percepción de seguridad, efectividad de controles, estado de vías, señalización, respeto a límites de velocidad y respeto a peatones.
* **8 Módulos Temáticos con Gráficas Interactivas:**
  1. Perfil demográfico y distribución por estados.
  2. Experiencia, frecuencia y hábitos nocturnos/lluvia.
  3. Equipamiento de seguridad y tipos de casco.
  4. Comportamiento, fatiga y presión laboral.
  5. Análisis detallado de causas de siniestros.
  6. Problemas de infraestructura vial reportados.
  7. Nivel de conocimiento de normativas vigentes.
  8. Disposición a la política de Visión Cero.
* **Gestión de Participantes:** Diálogo interactivo para exportar e inspeccionar la lista oficial de personas registradas para el sorteo.

---

## 🏛 Arquitectura del Sistema e Infraestructura

La arquitectura On-Premises se encuentra estructurada en **4 Zonas de Red Segmentadas (VLANs)** para garantizar alta disponibilidad y aislamiento estricto de la base de datos:

```mermaid
graph TD
    subgraph "Zona 0: Red Externa (Internet)"
        Citizens((Ciudadanos / Dispositivos Móviles)) --> Firewall[Firewall Perimetral / UTM]
    end

    subgraph "Zona 1: DMZ Pública (VLAN 10 - Web & Cache)"
        Firewall -->|Puertos 80, 443 / TCP| LB[VM-WEB-LB01: Nginx Proxy + Gzip + Cache + Rate Limit]
    end

    subgraph "Zona 2: Red de Aplicación Interna (VLAN 20 - App Cluster)"
        LB -->|Balanceo HTTP :3000 / Least Connections| APP1[VM-APP01: Next.js Standalone - 4 Workers PM2]
        LB -->|Balanceo HTTP :3000 / Least Connections| APP2[VM-APP02: Next.js Standalone - 4 Workers PM2]
    end

    subgraph "Zona 3: Red de Datos Aislada (VLAN 30 - Persistencia)"
        APP1 -->|Puerto 5432 / TCP| PgBouncer[PgBouncer Connection Pooler]
        APP2 -->|Puerto 5432 / TCP| PgBouncer
        PgBouncer --> PostgreSQL[(VM-DB01: PostgreSQL 16 Enterprise)]
        APP1 -->|Puerto 6379 / TCP| Redis[(VM-CACHE01: Redis)]
        APP2 -->|Puerto 6379 / TCP| Redis
    end
```

### Matriz de Dimensionamiento de Hardware / Máquinas Virtuales (Capacity Plan)

| Servidor / Máquina Virtual | Función | vCPU | Memoria RAM | Almacenamiento | Tecnología |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VM-WEB-LB01** | Proxy Inverso Nginx, SSL, Gzip y Caché Estática | 4 vCPU | 8 GB | 60 GB | SAS / SSD |
| **VM-APP01** | Nodo de Aplicación 1 (Next.js Standalone + PM2) | 6 vCPU | 12 GB | 80 GB | SSD |
| **VM-APP02** | Nodo de Aplicación 2 (Next.js Standalone + PM2) | 6 vCPU | 12 GB | 80 GB | SSD |
| **VM-DB01** | Motor PostgreSQL 16 + Connection Pool | 8 vCPU | 24 GB | 200 GB | **SSD NVMe (RAID 10)** |
| **VM-CACHE01** | Caché de Estadísticas y Rate-Limit (Redis) | 2 vCPU | 4 GB | 40 GB | SSD |
| **TOTAL RECOMENDADO** | **Infraestructura Completa (1M usuarios)** | **26 vCPU** | **60 GB RAM** | **460 GB** | **SSD / NVMe** |

> **Rendimiento de Memoria:** Con los 24 GB de RAM asignados a PostgreSQL, la totalidad de los datos e índices de 1M de registros (~2 GB) residen completamente en la memoria RAM del sistema operativo, garantizando lecturas y escrituras en milisegundos sin sobrecargar los discos.

---

## 🛡 Modelo de Seguridad y Protección Anti-Bot

La plataforma cuenta con **4 capas de defensa en profundidad**:

```
Solicitud Ciudadana (POST /api/survey/submit)
  │
  ▼
[1. Rate Limiting en Nginx]       → 429 Too Many Requests si supera 10 envíos/min por IP
  │
  ▼
[2. Honeypot Invisible]          → Acepta silenciosamente pero no guarda si un bot rellena el campo trampa
  │
  ▼
[3. Cloudflare Turnstile API]    → 403 Forbidden si el token criptográfico no es válido
  │
  ▼
[4. Validación de Unicidad Cédula] → 409 Conflict si la cédula ya se encuentra registrada en el sorteo
  │
  ▼
[Persistencia en PostgreSQL 16]   → 200 OK con código de sorteo
```

### 🔒 Acceso Exclusivamente Interno al Dashboard
Para blindar el acceso administrativo de cualquier intento de intrusión externo:
* Las rutas `/api/admin/*`, `/api/survey/stats`, `/api/survey/participants` y el parámetro `/?admin=1` están **restringidos a nivel perimetral en Nginx**.
* Solo se permite el paso a peticiones originadas en subredes privadas autorizadas de la Intranet y VPN institucional (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
* **Cualquier intento de acceso desde Internet público recibe un código `403 Forbidden`**.

---

## 💻 Pila Tecnológica (Tech Stack)

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Shadcn UI, Framer Motion, Lucide Icons, Recharts.
* **Estado del Cliente:** Zustand v5 (gestión de respuestas, navegación reactiva y almacenamiento de estado).
* **Backend:** Next.js API Routes en modo `standalone` optimizado.
* **ORM:** Prisma ORM v6 (conector binario para PostgreSQL).
* **Base de Datos:** PostgreSQL 16 / 18 con tipo de almacenamiento extendido `@db.Text` para respuestas JSON.
* **Servidor Web:** Nginx 1.24+ con compresión Brotli/Gzip y directivas de microcaché.
* **Gestor de Procesos:** PM2 v5 ejecutando en modo cluster multinúcleo (`instances: "max"`).

---

## 🚀 Instalación y Despliegue

### A. Despliegue Automatizado On-Premises (Linux)
El repositorio incluye un script interactivo de instalación desatendida que configura todo el servidor Linux (Ubuntu Server 22.04/24.04 o Debian 12) en **un solo comando**:

```bash
sudo bash install.sh
```

**Acciones automatizadas por el script:**
1. Instala paquetes base (`curl`, `git`, `build-essential`, `ufw`, `nginx`, `postgresql`).
2. Configura Node.js 22 LTS y PM2.
3. Aprovisiona la base de datos `intt_encuesta`, crea el usuario `intt_user` y optimiza `postgresql.conf`.
4. Genera claves criptográficas seguras y crea el archivo `.env`.
5. Ejecuta `npm install`, `npx prisma db push` y migra el respaldo si existe.
6. Compila el bundle en modo `standalone` (`npm run build`).
7. Levanta el cluster PM2 y registra el servicio en `systemd`.
8. Configura Nginx con reglas de seguridad Zero-Trust para el Dashboard y activa el cortafuegos.
9. Programa el respaldo automático diario de la base de datos a las 02:00 AM en `cron`.

---

### B. Instalación Local para Desarrollo (Windows)
Para desarrolladores o pruebas locales en Windows:

```powershell
# Ejecutar el instalador asistido de PowerShell
.\install.ps1
```
O de forma manual:
```powershell
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

### C. Despliegue Manual Paso a Paso

1. **Variables de Entorno (`.env`):**
   ```env
   DATABASE_URL="postgresql://intt_user:TuPassword@127.0.0.1:5432/intt_encuesta?schema=public"
   ADMIN_PASSWORD="TuPasswordAdminSeguro"
   ADMIN_SECRET="clave_hexadecimal_64_caracteres"
   TURNSTILE_SITE_KEY="clave_sitio_cloudflare"
   TURNSTILE_SECRET_KEY="clave_secreta_cloudflare"
   ```
2. **Sincronización de Base de Datos y Compilación:**
   ```bash
   npm install
   npx prisma db push
   npm run db:import-backup   # (Opcional: restaura 84 registros del respaldo)
   npm run build
   ```
3. **Puesta en marcha con PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

## 🌐 Accesos y Credenciales

| Vista / Función | Ruta de Acceso | Seguridad / Restricción | Credenciales por Defecto |
| :--- | :--- | :--- | :--- |
| **Encuesta Ciudadana** | `/` (ej: `http://localhost:3000`) | Acceso Público Abierto | No requiere autenticación |
| **Dashboard de Estadísticas** | `/?admin=1` | **Solo Intranet / VPN del INTT** | Clave: `VisionCero2026!` |

---

## 📁 Estructura del Proyecto

```
EncuestaINTTT/
├── docs/                               # Documentación Técnica Formal
│   ├── ARQUITECTURA_REQUERIDA.md       # Documento de Arquitectura (SAD v1.1)
│   ├── GUIA_IMPLEMENTACION_ONPREMISES.md # Manual paso a paso de producción
│   └── SPECIFICATION.md                # Especificación Funcional Completa (SDD v1.1)
├── prisma/
│   └── schema.prisma                   # Esquema de Prisma ORM para PostgreSQL
├── public/                             # Recursos estáticos institucionales (Logo INTT, etc.)
├── scripts/
│   └── import-backup-to-postgres.ts    # Script de importación de respaldos
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Orquestador principal (Encuesta / Dashboard)
│   │   ├── layout.tsx                  # Layout con tipografía Georama institucional
│   │   ├── globals.css                 # Paleta de colores oficiales del INTT
│   │   └── api/                        # Endpoints de API REST
│   │       ├── survey/submit/route.ts  # Envío de encuestas con protección anti-bot
│   │       ├── survey/stats/route.ts   # Agregaciones estadísticas del Dashboard
│   │       ├── survey/participants/    # Lista de inscritos para el sorteo
│   │       └── admin/                  # Login, Logout y Sesión HMAC
│   ├── components/
│   │   ├── survey/                     # Componentes del formulario y preguntas
│   │   ├── dashboard/                  # Componente del Dashboard analítico
│   │   └── ui/                         # Componentes de interfaz Shadcn UI
│   ├── lib/
│   │   ├── survey-data.ts              # Catálogo de ~55 preguntas y 10 secciones
│   │   ├── venezuela-estados.ts        # Catálogo de 24 estados y municipios VE
│   │   ├── sorteo.ts                   # Validadores de cédula y teléfono móvil VE
│   │   └── db.ts                       # Singleton del cliente Prisma / PostgreSQL
│   └── store/
│       └── survey-store.ts             # Almacén de estado global con Zustand
├── install.sh                          # Instalador automatizado para Linux On-Premises
├── install.ps1                         # Instalador / Asistente para Windows
├── docker-compose.yml                  # Configuración de PostgreSQL 16 y Redis
└── package.json                        # Dependencias y scripts de gestión
```

---

## ⚙ Mantenimiento y Respaldos

### Comandos de Operación Rápida
* **Ver estado de los procesos:**
  ```bash
  pm2 status
  pm2 monit
  ```
* **Ver registros en tiempo real:**
  ```bash
  pm2 logs encuesta-intt
  sudo tail -f /var/log/nginx/error.log
  ```
* **Recarga de aplicación sin caída (Zero-Downtime):**
  ```bash
  pm2 reload encuesta-intt
  ```

### Respaldo de Base de Datos
El sistema ejecuta automáticamente un respaldo diario a las 02:00 AM mediante `cron`. Para forzar un respaldo manual en cualquier momento:
```bash
sudo pg_dump -U intt_user -h 127.0.0.1 intt_encuesta | gzip > /var/backups/encuesta-intt/backup_manual_$(date +%F).sql.gz
```

---

## 📚 Documentación Técnica Adicional

Para más detalles, consulta los documentos de ingeniería disponibles en la carpeta `docs/`:
* **[docs/ARQUITECTURA_REQUERIDA.md](docs/ARQUITECTURA_REQUERIDA.md):** Especificación completa de topología de red, zonas de seguridad, matrices de hardware y dimensionamiento de carga.
* **[docs/GUIA_IMPLEMENTACION_ONPREMISES.md](docs/GUIA_IMPLEMENTACION_ONPREMISES.md):** Manual detallado de despliegue paso a paso para administradores de sistemas y centros de datos.
* **[docs/SPECIFICATION.md](docs/SPECIFICATION.md):** Especificación técnica formal (SDD) de todas las preguntas, validaciones, modelos de datos y endpoints de API.
