# Criterios de Aceptación del Release — checklist.md

Este documento define la lista de verificación formal que certifica la conformidad del sistema con la especificación SDD v1.2.0 para su promoción a producción y ambientes de alta disponibilidad.

---

## 1. Trazabilidad y Especificación
- [x] Todas las tareas implementadas en `tasks.md` referencian directamente un Requisito Funcional (FR) de `spec.md`.
- [x] La especificación de contratos OpenAPI (`contracts/openapi.md`) se encuentra en sincronía estricta con la implementación de los endpoints REST en `src/app/api/v1/` (incluyendo endpoints directos de CSV RFC 4180).
- [x] Todos los cambios arquitectónicos relevantes cuentan con su correspondiente registro ADR (`plan.md`, incluyendo ADR-5, ADR-6 y ADR-7).

---

## 2. Cobertura y Calidad de Pruebas
- [x] Cobertura de pruebas unitarias e integración en los módulos de `access-control`, `responses` y `validation`:
  - `test-auth.ts`: Hashing scrypt, validación JWT HMAC-SHA256, expiración y RBAC.
  - `test-surveys-crud.ts`: Generación de slug, códigos cortos no ambiguos, políticas de borrado y permisos.
  - `test-questions-crud.ts`: Los 8 tipos de pregunta estándar, validación de $\ge 2$ opciones y límites de escala.
  - `test-deployment-lifecycle.ts`: Generación de QR (SVG/PNG), vigencia temporal y cierre automático por cuota.
  - `test-eligibility.ts`: Anonimización de IPs (salt rotativo), tokens de sesión y rechazo de duplicados.
  - `test-responses-ingestion.ts`: Validación server-side estricta (Escenario Gherkin 422) y persistencia transaccional.
  - `test-analytics-export.ts`: Métricas agregadas y enmascaramiento estricto de PII en exportaciones CSV.
- [x] Pruebas E2E completas y aprobadas (`scripts/test-e2e-journey.ts`):
  - Crear encuesta $\rightarrow$ Publicar $\rightarrow$ Validar elegibilidad de encuestado $\rightarrow$ Responder exitosamente $\rightarrow$ Visualizar datos en Dashboard $\rightarrow$ Exportar CSV.
- [x] Pruebas de regresión automatizadas ejecutándose limpiamente (`npm run lint` con 0 errores y 0 warnings).

---

## 3. Integridad y Control de Acceso
- [x] Duplicados bloqueados eficazmente en los 4 modos de acceso (`public_anonymous`, `email_verified`, `invitation_token`, `whitelist`).
- [x] La validación server-side rechaza de forma determinista cualquier valor fuera de rango o regla (código HTTP 422).
- [x] Los usuarios no elegibles o encuestas fuera de fecha son bloqueados sin exponer las preguntas del formulario (US-3.5).
- [x] Interoperabilidad simétrica de autenticación: los usuarios autenticados mediante sesión legacy (`intt_admin_session`) y tokens JWT (`sdd_auth_session`) gozan de acceso transparente y unificado tanto a endpoints `/api/admin/*` como `/api/v1/*` (Decisión D-6 / ADR-6).

---

## 4. Privacidad y Seguridad (OWASP & GDPR)
- [x] Anonimización criptográfica estricta de direcciones IP (SHA-256 + salt rotativo diario `NFR-7`).
- [x] Pantalla y texto de consentimiento informado soportado en esquema y respuestas (`US-3.4`).
- [x] Mecanismo de exportación con enmascaramiento de datos personales (PII) por defecto para analistas (`US-5.4` / Decisión D-4).
- [x] Rate-limiting y verificación de protección anti-bots (Cloudflare Turnstile) activos en todas las rutas de envío (`US-3.3`).

---

## 5. Rendimiento y Accesibilidad
- [x] Modelo de persistencia transaccional optimizado con índices parciales en PostgreSQL para soportar 30–50 TPS pico (`NFR-1`).
- [x] Tiempo de primer contenido visible (FCP) $\le 1.5$ segundos y WCAG 2.1 AA en portal público.
- [x] Agregaciones analíticas agregadas sin bloqueos de lectura masiva en caliente.

---

## 6. Dashboard Multidimensional por Encuesta (v1.2.0)
- [x] El Dashboard dispone de un selector desplegable superior para alternar fluidamente entre la encuesta de motorizados histórica y cualquier encuesta creada dinámicamente (`US-5.2b`).
- [x] Cada encuesta seleccionada renderiza su propio conjunto aislado de métricas, cronología y desglose visual por tipo de pregunta (barras porcentuales para opciones, distribución numérica para escalas, y listado de opiniones ciudadanas) (`US-5.1b`).
- [x] El gestor de encuestas (`SurveyManager`) incluye un botón directo "Ver Dashboard de Esta Encuesta" con transición instantánea a la pestaña analítica (`US-5.3b`).
- [x] Exportación individualizada en formato CSV descargable directamente con codificación UTF-8 BOM desde la vista analítica (`US-5.4b`).

---

## 7. Alta Disponibilidad y Resiliencia Híbrida (v1.2.0)
- [x] Detección no bloqueante de disponibilidad de base de datos primaria (PostgreSQL 16).
- [x] En caso de caída de conectividad de la BD, el sistema conmuta automáticamente a `LocalSurveyStore` (`db/local_surveys.json`), manteniendo operativas la creación, publicación, listado, analítica y exportación de encuestas sin lanzar errores HTTP 500 (Principio VI / Decisión D-5 / ADR-5).

