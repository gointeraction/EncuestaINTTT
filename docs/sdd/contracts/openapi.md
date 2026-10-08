# Contratos API — Especificación OpenAPI v1

> Estándar de errores: RFC 7807 (`application/problem+json`).  
> Todos los timestamps en formato ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`).

---

## 1. Endpoints de Creador y Analista (Autenticados)

### 1.1. Crear Encuesta
- **Método / Ruta**: `POST /api/v1/surveys`
- **Cabeceras**: `Authorization: Bearer <jwt>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Satisfacción de Servicios de Transporte Q3",
  "description": "Evaluación del servicio en sedes operativas",
  "access_mode": "email_verified",
  "consent_text": "Autorizo el tratamiento de mis respuestas con fines estrictamente estadísticos.",
  "max_responses": 10000,
  "starts_at": "2026-10-01T00:00:00Z",
  "ends_at": "2026-10-15T23:59:59Z"
}
```
- **Respuesta 201 Created**:
```json
{
  "id": "7f8c02f1-28cf-4822-b530-58c9735d4fa3",
  "status": "draft",
  "title": "Satisfacción de Servicios de Transporte Q3",
  "created_at": "2026-09-29T13:40:00Z"
}
```

---

### 1.2. Publicar Encuesta
- **Método / Ruta**: `POST /api/v1/surveys/{id}/publish`
- **Respuesta 200 OK**:
```json
{
  "id": "7f8c02f1-28cf-4822-b530-58c9735d4fa3",
  "status": "published",
  "slug": "satisfaccion-transporte-q3",
  "short_code": "aB3xK9",
  "public_url": "https://encuestas.intt.gob.ve/s/aB3xK9",
  "qr_url": "https://encuestas.intt.gob.ve/api/v1/surveys/7f8c02f1-28cf-4822-b530-58c9735d4fa3/qr"
}
```
- **Respuesta 409 Conflict**: Si la encuesta no posee al menos una pregunta válida o su configuración es inconsistente.

---

### 1.3. Analítica y Estadísticas Agregadas
- **Método / Ruta**: `GET /api/v1/surveys/{id}/analytics`
- **Query Params**: `?from=2026-10-01&to=2026-10-15&channel=qr&device=mobile`
- **Respuesta 200 OK**:
```json
{
  "totals": {
    "responses": 1420,
    "completed": 1350,
    "abandoned": 70,
    "completion_rate": 0.9507,
    "avg_duration_seconds": 185
  },
  "questions": [
    {
      "question_id": "q-101",
      "label": "¿Cómo califica la atención recibida?",
      "type": "single_choice",
      "total_answers": 1350,
      "distribution": [
        { "option": "Excelente", "count": 680, "percentage": 50.37 },
        { "option": "Buena", "count": 450, "percentage": 33.33 },
        { "option": "Regular", "count": 180, "percentage": 13.33 },
        { "option": "Deficiente", "count": 40, "percentage": 2.97 }
      ]
    },
    {
      "question_id": "q-102",
      "label": "Nivel de satisfacción general (1-5)",
      "type": "scale",
      "total_answers": 1350,
      "average": 4.31,
      "distribution": [
        { "scale": 1, "count": 20 },
        { "scale": 2, "count": 50 },
        { "scale": 3, "count": 150 },
        { "scale": 4, "count": 380 },
        { "scale": 5, "count": 750 }
      ]
    }
  ],
  "timeline": [
    { "date": "2026-10-01", "responses": 420 },
    { "date": "2026-10-02", "responses": 530 },
    { "date": "2026-10-03", "responses": 400 }
  ]
}
```

---

### 1.4. Solicitud de Exportación (Asíncrona)
- **Método / Ruta**: `POST /api/v1/surveys/{id}/exports`
- **Request Body**:
```json
{
  "format": "xlsx",
  "scope": "raw",
  "mask_pii": true
}
```
- **Respuesta 202 Accepted**:
```json
{
  "export_id": "exp-88391-dafe",
  "status": "queued",
  "poll_url": "/api/v1/exports/exp-88391-dafe"
}
```

---

### 1.5. Descarga Directa de Exportación CSV
- **Método / Ruta**: `GET /api/v1/surveys/{id}/exports?format=csv`
- **Cabeceras de Solicitud**: `Authorization: Bearer <jwt>` o Cookie `sdd_auth_session` / `intt_admin_session`
- **Respuesta 200 OK**:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="respuestas_{survey_slug}_{yyyyMMdd_HHmmss}.csv"`
  - **Payload**: Flujo de texto CSV conforme a RFC 4180, con prefijo Byte Order Mark UTF-8 (`\uFEFF`) para compatibilidad directa con Microsoft Excel y LibreOffice Calc.
  - **Estructura de Columnas**: `ID_Respuesta, Fecha, Canal, Dispositivo, Duracion_Segundos, [Pregunta_1_Titulo], [Pregunta_2_Titulo], ...`

---

## 2. Endpoints Públicos del Encuestado (Sin Sesión Previa)

### 2.1. Obtener Encuesta y Validar Elegibilidad
- **Método / Ruta**: `GET /api/v1/public/surveys/{slug_or_short_code}`
- **Query Params**: `?token=abc-123` (en caso de modo invitación)
- **Regla Crítica**: Valida la elegibilidad, fecha de vigencia y límite de respuestas ANTES de devolver el contenido de las preguntas.
- **Respuesta 200 OK**:
```json
{
  "session_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "survey": {
    "id": "7f8c02f1-28cf-4822-b530-58c9735d4fa3",
    "title": "Satisfacción de Servicios de Transporte Q3",
    "consent_text": "Autorizo el tratamiento de mis respuestas...",
    "allow_partial": false
  },
  "questions": [
    {
      "id": "q-101",
      "type": "single_choice",
      "label": "¿Cómo califica la atención recibida?",
      "required": true,
      "options": [
        { "label": "Excelente", "value": "excelente" },
        { "label": "Buena", "value": "buena" },
        { "label": "Regular", "value": "regular" },
        { "label": "Deficiente", "value": "deficiente" }
      ]
    }
  ]
}
```
- **Códigos de Error**:
  - `403 Forbidden`: No elegible o token de invitación no autorizado.
  - `409 Conflict`: La encuesta ya fue respondida por este usuario/dispositivo.
  - `410 Gone`: Encuesta cerrada, archivada o fuera del rango de fechas.

---

### 2.2. Enviar Respuestas (Submit Transaccional)
- **Método / Ruta**: `POST /api/v1/public/surveys/{slug_or_short_code}/responses`
- **Cabeceras**:
  - `X-Session-Token: <token_obtenido_en_get>`
  - `Idempotency-Key: <uuid_cliente_opcional>`
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "turnstile_token": "0.3a...turnstile_cf",
  "answers": [
    { "question_id": "q-101", "value": "excelente" },
    { "question_id": "q-102", "value": 5 }
  ],
  "meta": {
    "duration_seconds": 142,
    "channel": "qr"
  }
}
```
- **Respuesta 201 Created**:
```json
{
  "response_id": "f51c726a-93be-4318-971c-32b509ef4981",
  "status": "completed",
  "submitted_at": "2026-09-29T13:45:00Z",
  "message": "Encuesta registrada exitosamente"
}
```
- **Códigos de Error**:
  - `422 Unprocessable Entity`: Validación fallida a nivel de pregunta (ej. número fuera de rango, pregunta requerida omitida).
  - `429 Too Many Requests`: Límite de tasa por IP/Subred alcanzado.
