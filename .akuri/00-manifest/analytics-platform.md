---
file: analytics-platform.md
doc-type: SPEC
level: L2
area: A2
position: 5
title: ANALYTICS_PLATFORM
summary: Estrategia de desacoplamiento entre la capa de CAPTURA (Next.js, intacta) y
  la capa ANALÍTICA (NestJS + Angular) — dos esquemas PostgreSQL con dueño y mecanismos
  de acceso distintos, sumarización bajo un sistema independiente, identidad y control
  de acceso restringido, y plan de extracción por fases (strangler).
category: 00-manifest
scope: the 00-manifest specification
---

# Plataforma Analítica Desacoplada — Estrategia y Plan (L2)

## CHAPTER 1: PURPOSE & USE MODES

### SECTION 01-PURPOSE

WRITE INFO: este documento declara y justifica la DECISIÓN de separar la **capa de captura**
de datos (el portal ciudadano en Next.js, que NO se toca) de una **capa analítica** independiente
(NestJS para la API de reportería/acceso y Angular para la consola de análisis), y fija el PLAN
por fases para construirla. Es el contrato de arquitectura de esta separación.

### SECTION 02-USE-MODES

WRITE INFO: USE_MODE is one of: INFORM | CONSTRUCT | AUDIT | FIX.
  - INFORM: leer para conocer el límite de cada superficie y el dueño de cada dato.
  - CONSTRUCT: seguir CHAPTER 3 SECTION 09 (plan por fases) para construir.
  - AUDIT: verificar que la captura no fue tocada y que ningún dato analítico vive en Next.
  - FIX: ante una violación de límite, corregir la declaración (A2), no la realidad (A3).

## CHAPTER 2: CONTEXT — TECH & PATTERNS

### SECTION 01-TECHNOLOGIES

WRITE INFO: la capa de captura usa `backend.nextjs-api` + `frontend.nextjs.app` (sin cambios).
La capa analítica usa `backend.nestjs.analytics` + `frontend.angular.admin` + `library.orval`,
sobre el mismo `persistence.postgresql` pero en un esquema distinto.

### SECTION 02-ARCHITECTURE-PATTERNS

WRITE INFO: ARCH_PATTERN=TWO_SURFACES (captura pública vs back-office); ARCH_PATTERN=CQRS
(escritura de captura / lectura analítica); ARCH_PATTERN=SCHEMA_PER_OWNER; ARCH_PATTERN=STRANGLER
(extracción incremental, sin big-bang).

### SECTION 03-DESIGN-PATTERNS

WRITE INFO: DESIGN_PATTERN=READ_MODEL; DESIGN_PATTERN=PORT_ADAPTER; DESIGN_PATTERN=API_CONTRACT
(OpenAPI → api-sdk).

### SECTION 04-VISUAL-DESIGN-PATTERNS

WRITE INFO: VISUAL_PATTERN=SINGLE_SOURCE_OF_TRUTH; VISUAL_PATTERN=SNAKE_CASE.

## CHAPTER 3: STEPS

### SECTION 01-PROBLEMA-Y-JUSTIFICACION

WRITE INFO: la plataforma nació como una sola aplicación Next.js full-stack. La captura ciudadana
(1.000.000 de respuestas en 15 días; picos de 30–50 TPS y 350–600 RPS) es el **elemento crítico**
y debe permanecer simple, aislado y sin interferencias. Sobre esa base crece una demanda de
segunda naturaleza —**analítica, reportería y control de acceso restringido**— con requisitos
propios: consultas pesadas, read models, exportaciones, enmascaramiento de PII por rol,
auditoría de acceso y una audiencia interna autorizada. Mezclar ambas naturalezas en el mismo
runtime expone la ruta crítica a despliegues, dependencias y cargas que no le corresponden.

WRITE RULE: la capa de captura MUST mantenerse desacoplada de la capa analítica; ningún cambio
analítico puede alterar el camino de captura. — MUST

### SECTION 02-ARQUITECTURA-OBJETIVO

WRITE INFO: el sistema tiene DOS superficies, unidas por un contrato claro (la base de datos y
la API), no por código compartido:

```
                 ┌──────────────────────────────────────────────┐
   Ciudadano ──▶ │  CAPTURA (Next.js)  — PÚBLICA, sin auth        │
                 │  portal adaptativo + ingesta de respuestas    │
                 └───────────────┬──────────────────────────────┘
                                 │ escribe (único dueño)
                                 ▼
                 ┌──────────────────────────────────────────────┐
                 │            PostgreSQL (1 instancia)           │
                 │  esquema public    │    esquema analytics      │
                 │  (captura)         │    (read models,          │
                 │                    │     identidad, auditoría) │
                 └────────┬───────────┴───────────┬──────────────┘
                          │ rol READ-ONLY public  │ escribe solo analytics
                          ▼                       │
                 ┌──────────────────────────────────────────────┐
                 │  BACK-OFFICE (NestJS) — RESTRINGIDO           │
                 │  authN/authZ · reportería · analítica · PII   │
                 └───────────────┬──────────────────────────────┘
                                 │ OpenAPI → api-sdk (orval)
                                 ▼
                 ┌──────────────────────────────────────────────┐
                 │  CONSOLA (Angular) — personal autorizado       │
                 │  login staff · dashboards · reportes          │
                 └──────────────────────────────────────────────┘
```

| Superficie | Runtime | Auth | Dueño de datos | Consumidor |
|-----------|---------|------|----------------|-----------|
| Captura | Next.js (route handlers) | Abierta + anti-bot | `public` (escritura) | Ciudadano (anónimo) |
| Back-office | NestJS | Identidad formal + RBAC/ABAC | `analytics` (escritura) + `public` (read-only) | Admin / analista / auditor |
| Consola | Angular | Sesión de staff | — (cliente del api-sdk) | Personal autorizado |

### SECTION 03-PROPIEDAD-DE-DATOS

WRITE INFO: los dos esquemas CONVIVEN en la misma instancia PostgreSQL, pero con **dueño y
mecanismo de acceso distintos**:

| Esquema | Qué contiene | Dueño (escritura) | Acceso de terceros |
|---------|--------------|-------------------|--------------------|
| `public` | tablas de captura (`surveys`, `questions`, `responses`, `answers`, `invitations`, `audit_logs`, `legacy_survey_*`) | **Captura (Next.js)** | el back-office lee con un **rol READ-ONLY** |
| `analytics` | `report_*` / read models, estado de sumarización, identidad de staff, `access_audit` | **Back-office (NestJS)** | ninguno (privado del back-office) |

WRITE RULE: la captura es el ÚNICO escritor del esquema `public`; el back-office MUST NOT escribir
en `public`. — MUST

WRITE RULE: el back-office accede a `public` con un rol PostgreSQL de SOLO LECTURA
(`intt_analytics_ro`); sus escrituras ocurren únicamente en `analytics`. — MUST

WRITE RULE: ningún read model derivado (`report_*`, sumarizaciones) es fuente de verdad; se
recomputan desde `public`. — MUST

### SECTION 04-SUMARIZACION-INDEPENDIENTE

WRITE INFO: toda la sumarización y el procesamiento analítico (hoy `scripts/summarize.ts` +
`SurveySummary`) pasan a ser responsabilidad EXCLUSIVA del sistema analítico (NestJS), ejecutados
como jobs independientes (cron/scheduler) que leen `public` y escriben `analytics`. Así el trabajo
pesado nunca compite con la captura.

WRITE RULE: la captura MUST NOT ejecutar procesos de sumarización, reportes ni agregación. — MUST

### SECTION 05-IDENTIDAD-Y-ACCESO

WRITE INFO: el control de acceso a la información restringida es propiedad del back-office:

- Identidad formal del staff (login propio) con roles `admin` | `analyst` | `auditor`. Sesión
  **local** (D-12), sin integración externa por ahora, pero **federable a futuro** (estrategias
  estilo Passport) para integrar un IdP del INTT sin reescribir.
- Autorización por **política server-side** (guards): RBAC + scoping por fila/columna (ABAC).
- **Enmascaramiento de PII por rol** aplicado en el servidor (el frontend nunca recibe datos que
  no le corresponden).
- **Auditoría de lectura** (`access_audit`): quién consultó qué información sensible y cuándo.
- Endurecimiento perimetral: Nginx restringe la superficie back-office a intranet/VPN (Zero-Trust).

WRITE RULE: el frontend MUST NOT ser el punto de control de acceso; el enmascaramiento y la
autorización ocurren en el backend. — MUST

### SECTION 06-FRONTEND-ANALITICO

WRITE INFO: la consola de análisis es un frontend Angular independiente (personal autorizado:
autenticación + dashboards + reportes + exportación). Consume el backend SOLO a través de un
`api-sdk` generado (orval) desde el OpenAPI del back-office. El portal ciudadano permanece 100%
en Next.js.

WRITE RULE: la consola MUST acceder a los datos únicamente por el api-sdk; no consulta la BD. — MUST

### SECTION 07-DESPLIEGUE

WRITE INFO: se conserva el despliegue **autocontenido en un solo `compose.yaml`**. Se añaden los
servicios de la capa analítica; la captura y su schema no cambian:

| Servicio | Rol |
|----------|-----|
| `db` | PostgreSQL (schemas `public` + `analytics`) |
| `cache` | Redis |
| `migrate` | sincroniza `public` (captura, Prisma) y `analytics` (owner: back-office) |
| `app` | **Captura** (Next.js) — sin cambios |
| `api` | **Back-office** (NestJS, `analytics/api`) — nuevo |
| `admin` | **Consola** (Angular `analytics/console`, estáticos) — nuevo |
| `proxy` | Nginx: público → `app`; back-office → `api`/`admin` bajo Zero-Trust |

### SECTION 08-ENCAJE-AKURI-OMA

WRITE INFO: la estrategia se declara con los ciudadanos del método:

| Pieza | Dónde se declara |
|-------|------------------|
| Instancia captura (sin cambios) | `02-instance-pool/backend/encuestaintt-api.md` |
| Instancia back-office NestJS | `02-instance-pool/backend/encuestaintt-analytics-api.md` (planned) |
| Instancia consola Angular | `02-instance-pool/frontend/encuestaintt-admin.md` (planned) |
| Tecnologías | `01-tech-stack/backend/nestjs/`, `frontend/angular/`, `frontend/orval/` |
| Supradominios back-office | `00-manifest/supradomains.md` (`analytics`, `platform`) |
| Reglas | `rulesets/encuestaintt-nestjs-analytics.ruleset.md`, `rulesets/encuestaintt-angular-admin.ruleset.md` |
| Features | `.akuri/docs/epics/*` (transversales por feature analítica) |

### SECTION 09-PLAN-POR-FASES

WRITE INFO: extracción **strangler** por fases; nada se hace big-bang y la captura nunca se toca:

| Fase | Alcance | Entregable | Criterio de paso |
|------|---------|-----------|------------------|
| **F0 — Declarar** | esta estrategia + tech-stack + instancias planned + rulesets | corpus A2 actualizado | gates A1 en PASS (hecho al cierre de este documento) |
| **F1 — Cimiento** | monorepo (`analytics/api`, `analytics/console`, `analytics/api-sdk`); esquema `analytics` + rol `intt_analytics_ro`; esqueleto NestJS con health; `migrate` extendido | un `api` que arranca y lee `public` read-only | `docker compose up` levanta `api` sin tocar `app` |
| **F2 — Identidad** | login de staff, roles `admin/analyst/auditor`, guards RBAC, `access_audit`; api-sdk (orval) + login en Angular | consola con login funcional | auditoría de acceso registrada |
| **F3 — Read models** | mudar la sumarización CQRS a NestJS (jobs independientes); `report_*` en `analytics` | dashboard servido por el back-office | captura con carga 0 de sumarización |
| **F4 — Reportería** | analítica por encuesta, tablas cruzadas, exportación CSV con enmascaramiento PII por rol | reportería completa en la consola | enmascaramiento verificado server-side |
| **F5 — Retiro** | retirar de Next el dashboard/analítica y el auth admin; Nginx enruta el back-office a `api`/`admin` | captura reducida a su mínima expresión | captura intacta en funcionalidad y métricas |

WRITE RULE: cada fase MUST ser desplegable y reversible de forma independiente; un fallo en la
capa analítica no puede degradar la captura. — MUST

### SECTION 10-RIESGOS-Y-JUSTIFICACION

WRITE INFO: riesgos y su mitigación:

| Riesgo | Mitigación |
|--------|-----------|
| Dos escritores sobre las mismas tablas | propiedad de esquema + rol read-only (`SECTION 03`) |
| Duplicar tipos/DTOs | contrato OpenAPI → api-sdk (SSOT del contrato) |
| Complejidad operativa | un solo compose; la captura no se toca |
| Sobrecarga prematura | plan strangler por fases; `analytics` primero (read-only, bajo riesgo) |
| Fuga de PII | enmascaramiento y scoping en el servidor + auditoría de lectura |
| Divergencia de esquema | `migrate` dueño de ambos esquemas; gates deterministas |

WRITE INFO: justificación de fondo — el desacoplamiento alinea cada naturaleza con su régimen
óptimo: la captura maximiza **simplicidad y disponibilidad**; el back-office maximiza **potencia
analítica, control de acceso y auditabilidad**. Esas dos optimizaciones se estorban dentro de un
mismo runtime; separarlas es una decisión de arquitectura, no una preferencia.

## CHAPTER 4: EVALUATION & CLOSING

### SECTION 01-EVALUATION

WRITE INFO: el documento cierra cuando su gate pasa y se verifica que (a) la captura no tiene
procesos analíticos ni auth de staff, (b) el back-office no escribe en `public`, (c) el
enmascaramiento/la autorización ocurren en el servidor.

### SECTION 02-REPORT

WRITE INFO: REPORT verdict = PASS | FAIL.
