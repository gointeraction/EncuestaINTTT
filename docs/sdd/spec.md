# Especificación Funcional — Sistema de Gestión de Encuestas v1.2.0

> **Historial de Versiones**:
> - **v1.0.0**: Borrador inicial de especificación funcional SDD.
> - **v1.1.0**: Congelamiento de especificación tras resolución de preguntas abiertas de arquitectura (volumen de 1M, autenticación RBAC local, autoguardado en localStorage para MVP y enmascaramiento PII estricto).
> - **v1.2.0**: Incorporación de Dashboard específico e independiente por cada encuesta (US-5.1b, US-5.2b, US-5.4b), arquitectura de persistencia híbrida resiliente (Decisión D-5), autenticación administrativa interoperable (Decisión D-6) y accesibilidad pública al módulo de gestión (Decisión D-7).

---

## 1. Contexto y problema
La organización necesita crear, distribuir y analizar encuestas sin depender de herramientas externas propietarias, garantizando soberanía tecnológica, control estricto sobre la identidad de los encuestados, integridad transaccional de los datos, resiliencia ante picos masivos de tráfico y cumplimiento de privacidad.

Asimismo, el sistema debe soportar un catálogo dinámico de múltiples encuestas independientes, cada una con su propio ciclo de vida, preguntas, cuotas, códigos QR, enlaces públicos y **dashboard analítico individualizado en tiempo real**.

---

## 2. Usuarios y roles

| Rol | Descripción | Capacidades clave |
|---|---|---|
| **Creador** | Usuario autenticado que diseña encuestas | CRUD encuestas, diseñar preguntas, publicar, cerrar, visualizar resultados y analítica de sus encuestas. |
| **Encuestado** | Persona que responde la encuesta | Responder encuesta según el modo de acceso configurado, participar opcionalmente en incentivos/sorteos. |
| **Analista** | Usuario que consume resultados | Visualizar dashboards por encuesta, aplicar filtros, generar tablas cruzadas y exportar reportes (con PII enmascarada). |
| **Admin** | Administrador global del sistema | Gestión global de encuestas, usuarios/roles, auditoría, configuración de retención, exportaciones con datos completos y políticas de acceso. |

---

## 3. Épicas y User Stories

### ÉPICA 1 — Creación de encuestas
- **US-1.1 (P0)**: Como creador, quiero crear una encuesta con título, descripción y fechas, para iniciar el diseño.
- **US-1.2 (P0)**: Como creador, quiero añadir preguntas de tipos: texto corto, texto largo, opción múltiple (radio), casillas de verificación, desplegable, escala lineal, calificación (1–5 estrellas) y fecha.
- **US-1.3 (P0)**: Como creador, quiero marcar preguntas como obligatorias y definir validaciones (longitud, rango numérico, patrón regex).
- **US-1.4 (P1)**: Como creador, quiero reordenar preguntas y agruparlas en secciones/páginas lógicas.
- **US-1.5 (P1)**: Como creador, quiero previsualizar la encuesta exactamente tal como la verá el encuestado en móvil y escritorio.
- **US-1.6 (P2)**: Como creador, quiero lógica condicional (ramificación: "si responde X, mostrar pregunta/sección Y").
- **US-1.7 (P2)**: Como creador, quiero duplicar encuestas existentes y utilizar plantillas preconfiguradas.

### ÉPICA 2 — Despliegue de encuestas
- **US-2.1 (P0)**: Como creador, quiero publicar una encuesta y obtener un enlace público único + código corto (ej. `/s/aB3xK9`) + código QR descargable en SVG y PNG.
- **US-2.2 (P0)**: Como creador, quiero gestionar el ciclo de vida de la encuesta: `borrador` → `publicada` → `cerrada` → `archivada`.
- **US-2.3 (P1)**: Como creador, quiero programar fecha y hora de apertura y cierre automáticos.
- **US-2.4 (P1)**: Como creador, quiero configurar un límite máximo de respuestas con cierre automático al alcanzarlo.
- **US-2.5 (P1)**: Como creador, quiero incrustar la encuesta vía iframe o widget responsive.

### ÉPICA 3 — Validación de encuestados
- **US-3.1 (P0)**: Como creador, quiero elegir el modo de acceso por encuesta:
  1. `publico_anonimo`: Cualquiera con el enlace público puede responder.
  2. `email_verificado`: El usuario debe validar su correo electrónico con un código OTP antes de responder.
  3. `token_invitacion`: Acceso mediante enlace personal con token de uso único.
  4. `lista_blanca`: Acceso reservado a correos electrónicos previamente cargados en una lista autorizada.
- **US-3.2 (P0)**: Como sistema, debo impedir respuestas duplicadas según el modo: token (1 solo uso atómico), email verificado (1 respuesta por email), anónimo (cookie/token de sesión + fingerprint configurable).
- **US-3.3 (P0)**: Como sistema, debo aplicar validación anti-bot (CAPTCHA / Cloudflare Turnstile), Honeypot y rate limiting estricto en el envío de respuestas.
- **US-3.4 (P1)**: Como sistema, debo mostrar un consentimiento informado previo cuando se capturen datos personales o sensibles.
- **US-3.5 (P1)**: Como sistema, debo validar la elegibilidad del encuestado ANTES de mostrarle las preguntas (evitar fuga de información a no autorizados).

### ÉPICA 4 — Almacenamiento de respuestas
- **US-4.1 (P0)**: Como sistema, debo almacenar respuestas de forma transaccional (la cabecera de respuesta y todas sus respuestas a preguntas se guardan juntas atómicamente en `$transaction`, o nada).
- **US-4.2 (P0)**: Como sistema, debo registrar metadatos técnicos en cada envío: timestamp, duración de completado, dispositivo/SO/navegador, canal de origen y dirección IP anonimizada criptográficamente (SHA-256 + salt rotativo diario).
- **US-4.3 (P1)**: Como encuestado, quiero autoguardado de respuestas parciales en cliente (`localStorage`) en el MVP para retomar si se interrumpe la navegación sin impactar el servidor.
- **US-4.4 (P1)**: Como admin, quiero definir políticas de retención: anonimización irreversible o depuración automática tras N días.
- **US-4.5 (P2)**: Como sistema, debo validar cada respuesta en el servidor contrastando con las reglas de su pregunta (validación server-side estricta, código 422).

### ÉPICA 5 — Dashboards, Analítica y Reportes Específicos
- **US-5.1 (P0)**: Como analista o admin, quiero un selector de encuesta en la cabecera del Dashboard que me permita alternar entre la encuesta base y cualquier encuesta personalizada en tiempo real.
- **US-5.2 (P0)**: Como analista o admin, quiero visualizar las métricas clave agregadas para la encuesta seleccionada: total de respuestas, tasa de finalización, tasa de abandono, preguntas activas y cupo disponible.
- **US-5.3 (P0)**: Como analista o admin, quiero un desglose visual exhaustivo pregunta por pregunta para la encuesta seleccionada:
  - Gráficos de barras con conteo y porcentaje para selección simple, múltiple y desplegables.
  - Promedio numérico ponderado y distribución para escalas Likert y calificaciones.
  - Registro de opiniones y comentarios cualitativos recientes para preguntas de texto libre.
- **US-5.4 (P0)**: Como creador o admin, quiero navegar directamente al dashboard de una encuesta específica pulsando el botón `Ver Dashboard de Esta Encuesta` en su tarjeta del gestor de encuestas.
- **US-5.5 (P1)**: Como analista, quiero exportar los datos crudos y agregados de la encuesta seleccionada a CSV (RFC 4180 con UTF-8 BOM para apertura directa en Excel), con enmascaramiento estricto de PII para analistas y desanonimización exclusiva para Admin.
- **US-5.6 (P2)**: Como analista, quiero gráficos de correlación temporal y tablas cruzadas entre preguntas.

---

## 4. Escenarios de aceptación (Gherkin)

```gherkin
Escenario: Publicar encuesta válida
  Dado que soy un creador autenticado con una encuesta en estado "borrador"
    Y la encuesta tiene al menos 1 pregunta definida
  Cuando solicito publicarla
  Entonces el estado de la encuesta cambia a "publicada"
    Y el sistema genera un slug único, código corto y código QR
    Y se registra el evento en el log de auditoría del sistema

Escenario: Bloquear duplicado con token de invitación
  Dado una encuesta publicada con modo de acceso "token_invitación"
    Y que el token "abc-123" ya fue consumido previamente
  Cuando el encuestado abre el enlace con el token "abc-123"
  Entonces el sistema muestra la pantalla "Esta encuesta ya fue respondida"
    Y NO revela ninguna de las preguntas de la encuesta

Escenario: Cierre automático por límite de respuestas alcanzado
  Dado una encuesta publicada con un límite de 100 respuestas
    Y que el sistema tiene registradas 99 respuestas válidas
  Cuando el encuestado número 100 envía una respuesta válida
  Entonces el sistema almacena la respuesta número 100
    Y cambia inmediatamente el estado de la encuesta a "cerrada" por límite alcanzado

Escenario: Respuesta inválida rechazada en servidor
  Dado una pregunta obligatoria de tipo "escala 1–5"
  Cuando el encuestado envía en el payload un valor de "9"
  Entonces el sistema rechaza la solicitud con código HTTP 422
    Y devuelve en la respuesta el identificador de la pregunta y el motivo del rechazo

Escenario: Conmutar dashboard hacia encuesta específica
  Dado que soy un administrador autenticado en el panel de control
  Cuando selecciono una encuesta en el selector superior o pulso "Ver Dashboard de Esta Encuesta"
  Entonces el sistema carga inmediatamente las métricas agregadas de esa encuesta en /api/v1/surveys/:id/analytics
    Y renderiza los KPIs de respuestas y desglose pregunta por pregunta de esa encuesta
```

---

## 5. Requisitos no funcionales (NFRs)

| ID | Categoría | Requisito | Criterio de Aceptación |
|---|---|---|---|
| **NFR-1** | Rendimiento | Concurrencia masiva | Soportar **1.000.000 de encuestas en 15 días**, con picos de **30 a 50 transacciones por segundo (TPS)** y **350 a 600 solicitudes HTTP por segundo (RPS)**; latencia de persistencia $p95 < 800\text{ ms}$. |
| **NFR-2** | Rendimiento | Carga móvil en red 3G | Tiempo de primer contenido visible (FCP) del portal público $p95 \le 1.5\text{s}$ en redes móviles 3G/4G. |
| **NFR-3** | Disponibilidad | Continuidad de servicio | 99.9% de uptime para el portal de encuestados durante fases activas de campaña. |
| **NFR-4** | Escalabilidad | Escalabilidad horizontal | Capacidad de balancear horizontalmente workers de la API sin estado vía PM2 / Contenedores en cluster. |
| **NFR-5** | Seguridad | Cifrado y resguardo | Tránsito protegido con TLS 1.3 / 1.2+; datos sensibles cifrados en reposo en PostgreSQL. |
| **NFR-6** | Auditoría | Registro de operaciones | Toda acción de creador/admin auditada: actor_id, acción, entidad, timestamp y diff en `audit_log`. |
| **NFR-7** | Privacidad | Anonimización y GDPR | Dirección IP protegida vía hash con salt rotativo; derecho al olvido procesable en < 30 días. |
| **NFR-8** | Resiliencia | Persistencia Híbrida | Fallback automático a almacenamiento local estructurado (`db/local_surveys.json`) ante indisponibilidad de PostgreSQL. |

---

## 6. Decisiones de Diseño y Arquitectura (D-1 a D-7)

- **D-1 (Volumen y Concurrencia)**: Dimensionado para 1.000.000 respuestas en 15 días (picos de 30–50 TPS, 350–600 RPS).
- **D-2 (Autenticación)**: Arquitectura RBAC con JWT criptográfico en cookie segura `httpOnly` (`sdd_auth_session`), con soporte simétrico para cookies firmadas previas.
- **D-3 (Autoguardado en MVP)**: Cliente-céntrico en `localStorage` del navegador para no sobrecargar el backend con ráfagas concurrentes de borradores incompletos.
- **D-4 (Privacidad en Exportaciones)**: Enmascaramiento irreversible de PII por defecto (`mask_pii: true`) en todos los archivos CSV/XLSX generados para roles Analista o Creador.
- **D-5 (Persistencia Híbrida Resiliente)**: Doble capa de persistencia: Prisma sobre PostgreSQL 16 para producción y fallback automático a `LocalSurveyStore` (`db/local_surveys.json`) ante fallos de conexión a PostgreSQL.
- **D-6 (Interoperabilidad de Autenticación)**: Los endpoints protegidos en `/api/v1/*` aceptan tanto la cookie HMAC-SHA256 (`intt_admin_session`) como la cookie JWT (`sdd_auth_session`), y `/api/admin/session` sincroniza ambas en segundo plano.
- **D-7 (Accesibilidad de Gestión y Rutas Directas)**: Incorporación de accesos directos en el header y footer del portal ciudadano, ruta `/admin` con redirección a `/?admin=1&tab=surveys`, y soporte de deep-linking (`?tab=dashboard&surveyId=...`).
