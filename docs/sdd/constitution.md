# Constitución — Sistema de Gestión de Encuestas v1.2.0

## Principios rectores

### I. Spec-First
Ningún código se escribe sin un requisito trazable en `spec.md`. Cada tarea en el backlog y en el código debe referenciar el FR (Requisito Funcional) o NFR que implementa.

### II. Privacidad por diseño
Los datos del encuestado se minimizan por defecto. Consentimiento explícito antes de capturar datos personales. IP siempre anonimizada criptográficamente (SHA-256 + salt rotativo). Derecho al borrado (GDPR / protección de datos personales) implementado desde el MVP. Enmascaramiento estricto de PII por defecto en exportaciones para analistas.

### III. Mobile-first
El flujo del encuestado debe ser impecable en dispositivos móviles (pantallas desde 360px a 430px). Accesibilidad WCAG 2.1 AA obligatoria en todo el portal público.

### IV. API-First
Toda funcionalidad se expone vía API REST documentada y versionada (OpenAPI / Swagger). El frontend consume la misma API pública y respeta contratos estrictos de entrada y salida con respuestas estandarizadas RFC 7807 Problem Details.

### V. Seguridad OWASP Top 10
Rate limiting, sanitización de inputs, mitigación anti-bots (Turnstile/CAPTCHA + Honeypot), control de acceso basado en roles (RBAC) en cada endpoint y auditoría inmutable de acciones administrativas y de creadores.

### VI. Resiliencia y Disponibilidad en Desarrollo y Producción
El sistema debe tolerar desconexiones o fallos en dependencias secundarias (bases de datos externas en entornos locales) garantizando operación continua y degradación elegante mediante persistencia resiliente desacoplada.

### VII. Aislamiento y Analítica Multidimensional por Encuesta
Cada encuesta constituye una entidad autónoma con su propio ciclo de vida, vigencia, cuota, códigos de acceso y dashboard analítico individualizado, evitando mezcla o contaminación de estadísticas entre campañas.

---

## Restricciones técnicas

1. **Modular Monolith**: Monorepo modular en Next.js (App Router, Turbopack, TypeScript) para agilidad, coherencia de tipos y desacoplamiento de capas (`auth`, `services`, `api/v1`, `components`).
2. **PostgreSQL 16 como fuente de verdad en producción**: Almacenamiento transaccional ACID, uso de columnas JSONB para esquemas de validación de preguntas y respuestas flexibles, e índices parciales para rendimiento.
3. **Persistencia Híbrida Resiliente**: Fallback automático a almacenamiento estructurado local (`db/local_surveys.json`) en entornos de desarrollo / pruebas cuando PostgreSQL no se encuentre disponible, impidiendo caídas del servicio o errores 500 no controlados.
4. **Redis para alto rendimiento**: Control de tasa (rate-limiting por IP/token), tokens de sesión y colas BullMQ para exportaciones pesadas.
5. **Autenticación Unificada Interoperable**: Soporte simétrico para cookies firmadas HMAC-SHA256 y tokens JWT con roles jerárquicos (`admin`, `creator`, `analyst`).
6. **Registro de Decisiones Arquitectónicas (ADR)**: Toda decisión técnica relevante debe registrarse de forma ligera en `plan.md` y versionarse con el código fuente.
