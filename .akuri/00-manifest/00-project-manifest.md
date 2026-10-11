---
file: 00-project-manifest.md
doc-type: SPEC
level: L2
area: A2
position: 1
title: 00_PROJECT_MANIFEST
summary: Filled manifest of the EncuestaINTTT project — the source of truth of what
  the project builds (purpose, scope, feature derivation) and the pointer the A2
  registry resolves (repo-location + akuri-root).
category: 00-manifest
scope: the 00-manifest specification
repo-location: /mnt/PROJECTS/GOINTERACTION/INTT/ENCUESTA/03-REPO/EncuestaINTTT
akuri-root: .akuri
---

# Project Manifest — EncuestaINTTT (Visión Cero INTT)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: A filled manifest is the source of truth for everything built: what THIS
project is, what it covers and how each feature derives from its purpose.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: see the technology sections of this repository (`01-tech-stack/`).

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=COLOCATED_CORPUS; ARCH_PATTERN=LOCAL_FIRST.

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=REGISTRY (A2 pointer resolves repo-location + akuri-root).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: CONTENT

### SECTION 01-CONTENT

WRITE INFO: > File: 00-manifest/00-project-manifest.md
> Produced by: how-to-write-a-manifest.template.md
> Level: L2

## 1. Purpose

EncuestaINTTT es la **Plataforma de Encuesta "Visión Cero"** del **Instituto Nacional de
Transporte Terrestre (INTT)** de la República Bolivariana de Venezuela, en el marco del
programa nacional **"Hacia una Visión Cero en Siniestros de Motocicletas"**. Es un sistema
de **recolección masiva de información ciudadana y analítica en tiempo real**: captura
diagnósticos de conductores y ciudadanos, los persiste con integridad transaccional y los
consolida en un dashboard gerencial privado.

## 2. Scope-Includes (what it covers)

- **Portal ciudadano público** (Next.js App Router): encuesta adaptativa por perfil de
  conductor (`DriverTypeId`, 6 perfiles), con preguntas condicionales (`showIf`), filtrado
  por `appliesTo` (22–51 preguntas por encuestado) y pregunta geográfica dependiente
  Estado/Municipio (24 entidades federales de Venezuela).
- **Módulo de incentivos y sorteo**: participación optativa/anónima, validación de cédula
  venezolana (`V-`/`E-` + 6–8 dígitos), validación de telefonía móvil (`0412/0414/0424/0416/0426`),
  unicidad de participación (anti-fraude) y generación de código único de 8 caracteres.
- **Dashboard privado de estadísticas** (~46 métricas) con arquitectura de pre-agregación
  (patrón CQRS): 8 KPI, 6 indicadores radiales, 8 módulos temáticos con gráficas, y gestión
  de participantes para sorteo.
- **SDD — Sistema de Gestión de Encuestas v1.2.0**: catálogo dinámico de múltiples encuestas
  independientes (`Survey` → `Question` → `Response` → `Answer`), 4 modos de acceso
  (`public_anonymous`/`email_verified`/`invitation_token`/`whitelist`), ciclo de vida
  (`draft`→`published`→`closed`→`archived`), publicar/cerrar/archivar, QR (SVG/PNG),
  analítica por encuesta y exportación CSV (RFC 4180 + BOM, enmascaramiento PII).
- **Autenticación administrativa** con RBAC (`admin`/`creator`/`analyst`): cookie HMAC-SHA256
  (`intt_admin_session`) y cookie JWT (`sdd_auth_session`), interoperables.
- **Persistencia híbrida resiliente**: Prisma 6 sobre PostgreSQL 16 en producción, con
  *fallback* automático a almacén local estructurado (`db/local_surveys.json`) ante
  indisponibilidad de PostgreSQL.
- **Endurecimiento anti-bot y perimetral**: Cloudflare Turnstile + Honeypot + rate-limit por
  IP; Nginx con reglas Zero-Trust que restringen `/api/admin/*`, `/api/survey/stats`,
  `/api/survey/participants` y `/?admin=1` a intranet/VPN del INTT.
- **Despliegue autocontenido**: un único `compose.yaml` (db · cache · migrate · app · proxy)
  levanta el sistema completo; los datos (PostgreSQL + Redis) viven COLOCALIZADOS con el repo
  en `./.data/`. El sistema es autocontenido y desacoplado: se despliega y gestiona con
  `docker compose up -d --build`.
- **Back-office analítico (planificado, desacoplado)**: una capa independiente — NestJS (API de
  analítica/reportería/acceso) y Angular (consola de staff) — que NO toca la captura, con esquema
  PostgreSQL propio y control de acceso restringido. Estrategia y plan: `00-manifest/analytics-platform.md`.

## 3. Scope-Excludes (explicitly out of scope)

- Identidad ciudadana soberana (SSO nacional, KYC): el portal ciudadano es de acceso abierto;
  no autentica al encuestado salvo el modo de acceso configurado por encuesta.
- Analítica descriptiva avanzada más allá de las ~46 métricas declaradas (correlación temporal
  US-5.6 y tablas cruzadas quedan como P2 fuera del alcance del MVP).
- Integraciones de terceros no declaradas como adaptadores: no hay Stripe, ni Firebase, ni
  servicios de correo/SMS externos; las notificaciones son por pantalla.
- Operación multi-tenant: un solo despliegue institucional on-premises del INTT.

## 4. Feature derivation

Cada feature deriva de un propósito dentro del alcance y es un **corte vertical**
(persistencia → backend/API → frontend/lógica → frontend/visual → pruebas). No hay
"piezas" sueltas. Las features se documentan en `.akuri/docs/epics/<epic>/transversal-<feature>.md`
(requisito completo por capa) según el pack `akuri-oma-documentation`.

Épicas declaradas y documentadas en `.akuri/docs/epics/` (con gate del pack):

| Épica | Slug | Transversales | Estado |
|---|---|---|---|
| Acceso del personal | `acceso-staff` | login-staff, sesion-guard, roles-permisos, auditoria-acceso | documentada |
| Analítica y reportería | `analitica-reporteria` | acceso-datos-encuesta, sumarizacion-cqrs, panel-encuesta, panel-global, exportacion-datos, reportes-cruzados, gestion-participantes | documentada |

Las features de la **captura** (encuesta ciudadana Visión Cero, incentivos/sorteo, gestión de
encuestas SDD) se especifican en la documentación de la captura (`docs/sdd/`, `docs/SPECIFICATION.md`)
y permanecen intactas; su documentación como transversales del pack queda **pendiente**.

## 5. References

- Fuente funcional primaria: `docs/sdd/spec.md` (SDD v1.2.0), `docs/SPECIFICATION.md`.
- Arquitectura e infraestructura: `docs/ARQUITECTURA_REQUERIDA.md`,
  `docs/GUIA_IMPLEMENTACION_ONPREMISES.md`, `docs/PROCESO_SUMARIZACION.md`.
- Autoría: cómo escribir un manifiesto, `01-principles/01-metamodel.md`,
  `01-principles/02-methodology.md` (A1).
- Léxico: `03-definitions/` (A1) (`feature`, `functionality`, `architecture`, `engineering`,
  `test`, `override`).

## 6. Deployment decision (D-8)

- **D-8 (Despliegue autocontenido, una sola unidad)**: el despliegue es UN `compose.yaml` con
  cinco servicios (`db`, `cache`, `migrate`, `app`, `proxy`). La instancia de PostgreSQL vive
  junto al repo (`./.data/postgres`, bind mount, gitignored) y Redis en `./.data/redis`. La
  sincronización de esquema es un paso determinista previo (`migrate`: `prisma db push` por
  defecto, `migrate deploy` si se baselinan migraciones) del que depende `app`. No hay
  dependencias externas: sin servicios gestionados, sin cloud. PM2/Nginx del host pasan a ser
  OPCIONALES (camino `install.sh` para bare-metal); el camino primario es el contenedor.

## 7. Analytics decoupling decisions (D-9..D-11)

- **D-9 (Captura desacoplada, intacta)**: la capa de captura de datos (Next.js) permanece aislada
  y sin cambios; ningún requisito analítico puede alterar el camino de captura. La captura es el
  ÚNICO escritor del esquema `public`.
- **D-10 (Back-office independiente)**: la analítica, reportería y el control de acceso restringido
  viven en un backend NestJS independiente con su propia identidad (staff), sobre un esquema
  `analytics` propio, leyendo `public` con un rol PostgreSQL de solo lectura. Toda sumarización y
  procesamiento corre como jobs del back-office, nunca en la captura.
- **D-11 (Consola de staff en Angular)**: la consola de análisis y autenticación del personal se
  construye en Angular, consumiendo el back-office SOLO por un `api-sdk` generado (orval) desde su
  OpenAPI. La extracción es strangler, por fases, empezando por `analytics`.

## 8. Further decisions (D-12..D-15)

- **D-12 (Sesión local, federable a futuro)**: la autenticación del personal es una **sesión local**
  propia del back-office (sin integración con identidades externas por ahora), implementada de forma
  **federable** (p. ej. estrategias estilo Passport) para poder integrar un IdP del INTT más adelante
  sin reescribir. Local: `platform/identity`.
- **D-13 (Idioma español — OVERRIDE)**: por excepción al mandato de inglés de A1, todo el proyecto
  (docs, comentarios, UI) se escribe en **español**; los identificadores de código se mantienen en
  inglés. Override O-1 en `00-manifest/overrides.md`.
- **D-14 (Design system de consola)**: la consola Angular adopta (vendoriza) el design system de
  `cifraflow-shared` (`design` + `fab`) adaptado a la marca INTT; tokens como SSOT. Ver
  `01-tech-stack/frontend/design-system/design-system.md`.
- **D-15 (Puertos no estándar)**: captura (Next.js) **3001**, back-office (NestJS) **3151**,
  consola (Angular) **4301** y PostgreSQL **5451** (no 5432); la base de datos y Redis NO se
  publican al host. Detalle y justificación en `00-manifest/ports.md`.

## Deterministic gate

- run `deterministic/check.py <artifact>` — exit 0 PASS / 1 FAIL. Probabilistic proposes; this guarantees (L1 rule 9).

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: the document closes when its gate passes.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
