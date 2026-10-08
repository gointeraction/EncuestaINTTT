# Plan Técnico de Implementación — Architecture & Delivery Plan v1.2.0

## 1. Stack Tecnológico de Referencia

| Capa | Tecnología | Justificación y Rol |
|---|---|---|
| **Frontend Portal Público** | Next.js 16 (Turbopack / App Router) + TypeScript | Carga inicial veloz (FCP < 1.5s), Mobile-first, optimización de assets, accesibilidad WCAG 2.1 AA. |
| **Frontend Administración** | React 19 + Tailwind CSS + Radix UI / shadcn | Builder dinámico de encuestas, selector interactivo de analítica por encuesta y dashboards (`recharts`). |
| **Backend & APIs** | Next.js API Routes (Node.js 20+ / TS) | Tipado integral extremo a extremo, validación mediante Zod / RFC 7807, contratos OpenAPI. |
| **Base de Datos Principal** | PostgreSQL 16 (Cluster On-Premises) | Consistencia transaccional ACID, soporte JSONB para preguntas dinámicas e índices parciales para anti-duplicado. |
| **Almacenamiento Resiliente** | `LocalSurveyStore` (`db/local_surveys.json`) | Persistencia híbrida desacoplada para desarrollo local sin Docker y tolerancia ante desconexiones de base de datos. |
| **Caché y Mensajería** | Redis 7+ In-Memory | Rate limiting por ventana deslizante, tokens de sesión de encuestados y cola BullMQ para exportaciones pesadas. |
| **Infraestructura** | Docker Compose / PM2 Cluster On-Premises | Balanceo de carga en VM Linux locales, Caddy / Nginx reverse proxy con terminación SSL TLS 1.3. |

---

## 2. Arquitectura de Sistema (Modular Monolith)

```text
[Portal Encuestado] ───────┐
 (Mobile-First / SSR)      │
                           ├──► [ Reverse Proxy / Nginx / Caddy ]
[Admin / Builder UI] ──────┤           │ (SSL, Rate-Limit, Static Caching)
                           │           ▼
                           │    [ Next.js / Node API App ]
[BullMQ Worker Service] ───┘           ├─► [ PostgreSQL 16 ] (Transacciones ACID en Prod)
                                       ├─► [ Local JSON Fallback ] (db/local_surveys.json)
                                       ├─► [ Redis Cache & Locks ]
                                       └─► [ Almacenamiento Local ] (Exports CSV/XLSX)
```

### Módulos Principales:
- `auth`: Autenticación unificada, interoperabilidad de cookies y control de accesos RBAC (Admin, Creador, Analista).
- `surveys`: Ciclo de vida de encuestas, estados, slugs únicos y fallback transparente.
- `questions`: Definición de esquema, tipos y reglas de validación JSONB.
- `access-control`: Validación de elegibilidad, OTP, tokens de invitación y anti-duplicados.
- `responses`: Ingesta transaccional de respuestas de encuestados y validación server-side.
- `analytics`: Sumarización de métricas por encuesta, índices y cálculo de distribución de respuestas.
- `exports`: Generación de reportes CSV (RFC 4180 con UTF-8 BOM) y XLSX/PDF en colas.
- `audit`: Registro inmutable de eventos operacionales.

---

## 3. Decisiones Arquitectónicas Clave (ADRs)

- **ADR-1: Agregaciones de Dashboard mediante Sumarización Incremental**:
  Para soportar 1.000.000 de encuestas sin saturar la CPU de la base de datos durante las consultas al dashboard, se utiliza un proceso de sumarización periódica y caché en Redis en lugar de escaneos masivos en vivo (`SELECT COUNT...`) sobre toda la tabla de respuestas.
- **ADR-2: Anti-Duplicado Transaccional a Nivel de Base de Datos**:
  El bloqueo de duplicados no depende únicamente de cookies o headers de cliente (fácilmente eludibles), sino de un índice único en PostgreSQL (`responses(survey_id, respondent_token)`) y hashes deterministas de correo o identificación.
- **ADR-3: Esquema de Validación Unificado**:
  Las mismas reglas de validación JSONB definidas en el builder de encuestas se ejecutan en el cliente para UX inmediata y se re-validan obligatoriamente en el servidor en el endpoint `POST /responses` para garantizar la integridad de los datos.
- **ADR-4: Procesamiento Asíncrono de Exportaciones**:
  Las descargas masivas en formato XLSX o PDF se delegan a un worker en segundo plano (BullMQ + Redis) devolviendo un `202 Accepted` con identificador de sondeo (`poll_url`) para evitar timeouts de HTTP en conjuntos de datos grandes.
- **ADR-5: Persistencia Híbrida Resiliente (Local JSON Fallback)**:
  Para permitir desarrollo y demostraciones locales sin requerir que Docker Desktop o un cluster PostgreSQL 16 estén activamente encendidos, los servicios de `survey-service`, `question-service`, `deployment-service`, `analytics-service` y `export-service` implementan un interceptor de contingencia automático. Si la conexión a PostgreSQL falla (`PrismaClientInitializationError`), la capa conmuta a `db/local_surveys.json` sin interrumpir la operación ni emitir códigos 500 al usuario.
- **ADR-6: Interoperabilidad Simétrica de Autenticación Administrativa**:
  Para preservar compatibilidad total con la sesión administrativa previa (`intt_admin_session` basada en HMAC-SHA256) y el nuevo sistema RBAC con tokens JWT (`sdd_auth_session`), los guards de autorización reconocen y aceptan válidamente ambas credenciales. Asimismo, `/api/admin/session` emite y renueva ambas cookies automáticamente.
- **ADR-7: Arquitectura de Dashboards Multidimensionales por Encuesta**:
  El dashboard de analítica se desacopla del estudio base histórico de motocicletas. Se introduce el componente `SurveyAnalyticsView` consumiendo `/api/v1/surveys/:id/analytics`, habilitando un selector universal en cabecera y enlaces de acceso contextual (`Ver Dashboard de Esta Encuesta`) desde las tarjetas del gestor de encuestas.

---

## 4. Estrategia Integral de Pruebas

- **Unit Testing**: Motor de validación de reglas de preguntas, parser de respuestas, generación de tokens y elegibilidad.
- **Integration Testing**: Integración de endpoints con base de datos real y almacenamiento de respaldo.
- **End-to-End (E2E)**: Flujo completo automatizado: Crear encuesta → Añadir preguntas → Publicar → Validar elegibilidad → Responder → Visualizar dashboard de esa encuesta → Exportar CSV.
- **Pruebas de Carga (k6)**: Simulación de ráfagas de 1.000 usuarios concurrentes y picos de 50 TPS en el endpoint de persistencia para validar latencias p95 < 800ms.
