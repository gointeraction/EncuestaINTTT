# Desglose de Tareas de Implementación — tasks.md

> Convenciones:  
> `T` = Tarea con suite de pruebas asociada.  
> `[P]` = Tarea paralelizable.  
> `FR-x` = Trazabilidad con Requisitos Funcionales de `spec.md`.

---

## Fase 0 — Fundaciones y Entorno Base
- **T01** [P]: Configuración del repositorio, linting estricto, pipeline de CI/CD y perfiles de variables de entorno.
- **T02**: Migraciones y esquema de base de datos PostgreSQL según `data-model.md` con índices optimizados.
- **T03**: Módulo de autenticación (JWT/Sesión segura), roles RBAC (`admin`, `creator`, `analyst`) y middleware de seguridad.

---

## Fase 1 — Épica 1: Creación de Encuestas (FR-1)
- **T04** [P]: CRUD de encuestas (API endpoints, DTOs y pruebas unitarias/integración) — `FR-1.1`.
- **T05** [P]: CRUD de preguntas y opciones normalizadas — `FR-1.2`.
- **T06** [P]: Motor de validaciones de reglas (JSONB schema, min/max, regex) — `FR-1.3`.
- **T07**: Interfaz interactiva de Builder de Encuestas + previsualización dual móvil/escritorio — `FR-1.5`.
- **T08**: Soporte para secciones, paginación y reordenamiento con drag-and-drop (`@dnd-kit`) — `FR-1.4`.

---

## Fase 2 — Épica 2: Despliegue y Ciclo de Vida (FR-2)
- **T09**: Máquina de estados de la encuesta (`draft` → `published` → `closed` → `archived`) — `FR-2.2`.
- **T10** [P]: Generación determinista de slug único, código corto y código QR SVG/PNG — `FR-2.1`.
- **T11**: Programador de apertura y cierre automáticos por fecha/hora (`starts_at`, `ends_at`) — `FR-2.3`.
- **T12**: Lógica atómica de límite máximo de respuestas con cierre automático — `FR-2.4`.
- **T13** [P]: Generador de código embed / snippet de integración para iframe institucional — `FR-2.5`.

---

## Fase 3 — Épica 3: Validación de Encuestados y Seguridad (FR-3)
- **T14** [CRÍTICO]: Motor de evaluación de elegibilidad previa en `GET /public/surveys/:slug` — `FR-3.5`.
- **T15**: Flujo de verificación vía OTP email y comprobación contra lista blanca — `FR-3.1`.
- **T16**: Generación y consumo atómico de tokens de invitación de uso único — `FR-3.1`.
- **T17**: Integración de protección anti-bots (Cloudflare Turnstile + Honeypot) y rate limiting en Redis — `FR-3.3`.
- **T18**: Pantalla obligatoria de consentimiento informado GDPR previa al inicio del cuestionario — `FR-3.4`.

---

## Fase 4 — Épica 4: Ingesta y Persistencia de Respuestas (FR-4)
- **T19**: Endpoint transaccional `POST /responses` con validación estricta server-side — `FR-4.1`, `FR-4.5`.
- **T20**: Mecanismo anti-duplicado en base de datos mediante hash determinista y token de sesión — `FR-4.2`.
- **T21**: Mecanismo de persistencia local resiliente (autoguardado en localStorage) — `FR-4.3`.
- **T22**: Tarea programada (Cron) de depuración y anonimización de datos bajo políticas GDPR — `FR-4.4`.

---

## Fase 5 — Épica 5: Analítica, Dashboards y Exportaciones (FR-5)
- **T23**: Motor de sumarización y endpoint analítico agregado (`GET /analytics`) — `FR-5.1`.
- **T24** [P]: Interfaz de Dashboard interactivo (tarjetas KPI, gráficos de distribución y series temporales) — `FR-5.2`.
- **T25** [P]: Barra de filtros multidimensionales (rango de fechas, canal, dispositivo, respuestas clave) — `FR-5.3`.
- **T26**: Servicio en cola BullMQ para exportaciones asíncronas en formatos CSV, XLSX y PDF — `FR-5.4`.
- **T27**: Módulo de análisis cruzado y correlación entre variables categóricas (P2) — `FR-5.5`.
- **T28**: Módulo de envío programado de reportes por correo electrónico (P3) — `FR-5.6`.

---

## Fase 6 — Hardening, Observabilidad y Calidad Final
- **T29**: Interceptor global de auditoría de operaciones (`audit_log`) — `NFR-6`.
- **T30**: Suite completa de pruebas E2E automatizadas con Playwright (ciclo de vida completo).
- **T31**: Pruebas de estrés y carga masiva con k6 simulando picos de 1.000 usuarios concurrentes — `NFR-1`.
- **T32**: Auditoría de seguridad OWASP Top 10, escaneo SAST y verificación de accesibilidad WCAG 2.1 AA.

---

## Fase 7 — Dashboard Multidimensional por Encuesta y Persistencia Resiliente (v1.2.0)
- **T33** [P]: Componente `SurveyAnalyticsView` para renderizado individual de analítica por encuesta con visualización tipificada de preguntas (barras para selección, escalas de satisfacción y opiniones ciudadanas) — `FR-5.2b`, `US-5.1b`.
- **T34**: Selector global de encuestas en cabecera de Dashboard con conmutación fluida entre la encuesta activa histórica y encuestas del sistema dinámico — `FR-5.3b`, `US-5.2b`.
- **T35** [P]: Botón directo de navegación `Ver Dashboard de Esta Encuesta` en tarjetas de gestión de encuestas (`SurveyManager`) con sincronización mediante query params `?tab=dashboard&surveyId=...` — `US-5.3b`.
- **T36**: Motor de persistencia híbrida resiliente `LocalSurveyStore` (`db/local_surveys.json`) con detección automática de indisponibilidad de PostgreSQL y fallback sin degradación de servicio — `ADR-5`.
- **T37**: Sincronización e interoperabilidad simétrica de autenticación entre tokens HMAC-SHA256 (`intt_admin_session`) y JWT RBAC (`sdd_auth_session`) para acceso unificado — `ADR-6`.

