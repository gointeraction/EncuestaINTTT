# Modelo de Datos — PostgreSQL y Persistencia Resiliente

## 1. Diagrama de Relaciones Entidad-Relación

```text
users ──────┬─────< surveys ──────┬─────< questions ─────< question_options
            │                     │
            │                     ├─────< deployments ─────< invitations
            │                     │
            └─────< exports       └─────< responses ─────< answers >───── questions
                                              │
                                              └─────< access_events
```

---

## 2. Definición de Tablas Principales (PostgreSQL 16)

### 2.1. `surveys`
Almacena la cabecera y configuración de cada encuesta.

| Campo | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `creator_id` | UUID | FK → `users.id` | Propietario o creador de la encuesta |
| `title` | VARCHAR(255) | NOT NULL | Título principal de la encuesta |
| `description` | TEXT | NULL | Descripción o instrucciones previas |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | Identificador amigable para URL pública |
| `short_code` | VARCHAR(16) | UNIQUE, NOT NULL | Código corto (ej. `aB3xK9`) |
| `status` | VARCHAR(32) | NOT NULL, DEFAULT 'draft' | `draft`, `published`, `closed`, `archived` |
| `access_mode` | VARCHAR(32) | NOT NULL, DEFAULT 'public_anonymous' | `public_anonymous`, `email_verified`, `invitation_token`, `whitelist` |
| `allow_partial` | BOOLEAN | NOT NULL, DEFAULT false | Permite autoguardado parcial |
| `max_responses` | INTEGER | NULL | Límite máximo de respuestas (cierre automático) |
| `starts_at` | TIMESTAMPTZ | NULL | Fecha/hora de apertura programada |
| `ends_at` | TIMESTAMPTZ | NULL | Fecha/hora de cierre programada |
| `consent_text` | TEXT | NULL | Texto legal de consentimiento informado |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creación |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última modificación |

---

### 2.2. `questions`
Define las preguntas individuales y sus reglas de validación.

| Campo | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `survey_id` | UUID | FK → `surveys.id` ON DELETE CASCADE | Encuesta a la que pertenece |
| `section_id` | UUID | NULL | Agrupación en páginas / secciones |
| `type` | VARCHAR(32) | NOT NULL | `short_text`, `long_text`, `single_choice`, `multi_choice`, `dropdown`, `scale`, `rating`, `date`, `composite_location` |
| `label` | TEXT | NOT NULL | Enunciado de la pregunta |
| `required` | BOOLEAN | NOT NULL, DEFAULT false | Obligatoriedad |
| `position` | INTEGER | NOT NULL, DEFAULT 0 | Orden secuencial en el formulario |
| `validation_rules` | JSONB | NOT NULL, DEFAULT '{}' | Reglas: `{ "min": 1, "max": 100, "pattern": "^[0-9]+$" }` |
| `branching_rules` | JSONB | NULL | Lógica condicional: `{ "showIf": { "questionId": "q1", "equals": "yes" } }` |

---

### 2.3. `question_options`
Opciones para preguntas de tipo selección única, múltiple o desplegable.

| Campo | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador de la opción |
| `question_id` | UUID | FK → `questions.id` ON DELETE CASCADE | Pregunta padre |
| `label` | TEXT | NOT NULL | Texto visible al encuestado |
| `value` | VARCHAR(255) | NOT NULL | Valor almacenado en backend |
| `position` | INTEGER | NOT NULL, DEFAULT 0 | Posición en la lista |

---

### 2.4. `responses`
Registro transaccional de un intento o envío completado de encuesta.

| Campo | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador de la respuesta |
| `survey_id` | UUID | FK → `surveys.id` | Encuesta asociada |
| `respondent_token` | UUID | NULL | Token único generado para evitar duplicados |
| `email_hash` | VARCHAR(128) | NULL | SHA-256 del email en modos restringidos |
| `status` | VARCHAR(32) | NOT NULL, DEFAULT 'completed' | `in_progress`, `completed`, `abandoned` |
| `started_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Momento de apertura de formulario |
| `submitted_at` | TIMESTAMPTZ | NULL | Momento de persistencia final |
| `device` | JSONB | NOT NULL, DEFAULT '{}' | Metadatos `{ "type": "mobile", "os": "Android", "browser": "Chrome" }` |
| `channel` | VARCHAR(32) | NOT NULL, DEFAULT 'link' | `link`, `qr`, `embed`, `email` |
| `ip_hash` | VARCHAR(128) | NOT NULL | SHA-256 de la IP con salt rotativo diario |

---

### 2.5. `answers`
Respuestas normalizadas a nivel de pregunta individual.

| Campo | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador de la respuesta |
| `response_id` | UUID | FK → `responses.id` ON DELETE CASCADE | Respuesta global |
| `question_id` | UUID | FK → `questions.id` | Pregunta respondida |
| `value_text` | TEXT | NULL | Contenido para texto corto, largo o fechas |
| `value_numeric` | NUMERIC | NULL | Contenido para escalas numéricas y ratings |
| `value_options` | JSONB | NULL | Array de valores para multiselección |

> **Restricción de Integridad:** `UNIQUE (response_id, question_id)` garantiza que no existan respuestas duplicadas a una misma pregunta dentro de una misma sesión de respuesta.

---

### 2.6. `invitations`
Gestión de accesos para modo `token_invitacion`.

| Campo | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `survey_id` | UUID | FK → `surveys.id` | Encuesta a la que da acceso |
| `token` | VARCHAR(128) | UNIQUE, NOT NULL | Token criptográfico de uso único |
| `email` | VARCHAR(255) | NULL | Correo asignado (opcional) |
| `status` | VARCHAR(32) | NOT NULL, DEFAULT 'pending' | `pending`, `used`, `expired` |
| `used_at` | TIMESTAMPTZ | NULL | Timestamp exacto en que fue consumido |

---

### 2.7. `audit_log`
Registro inmutable de trazabilidad de acciones operativas y administrativas.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | BIGSERIAL PK | Secuencial |
| `actor_id` | UUID NULL | Identificador del usuario o sistema |
| `action` | VARCHAR(64) NOT NULL | `survey.created`, `survey.published`, `survey.closed`, etc. |
| `entity_type` | VARCHAR(64) NOT NULL | `survey`, `question`, `user`, etc. |
| `entity_id` | VARCHAR(64) NOT NULL | ID de la entidad afectada |
| `payload` | JSONB NOT NULL | Detalles antes y después del cambio |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | Marca de tiempo |

---

## 3. Índices Críticos para Rendimiento

```sql
-- Consultas rápidas de dashboard por encuesta y estado
CREATE INDEX idx_responses_survey_status ON responses (survey_id, status);

-- Anti-duplicado en encuestas con control de token
CREATE UNIQUE INDEX idx_responses_survey_respondent_token 
  ON responses (survey_id, respondent_token) 
  WHERE respondent_token IS NOT NULL;

-- Agregaciones rápidas y promedios en escalas y calificaciones
CREATE INDEX idx_answers_question_numeric ON answers (question_id, value_numeric);

-- Validación de tokens de invitación en O(1)
CREATE UNIQUE INDEX idx_invitations_token ON invitations (token);
```

---

## 4. Esquema del Almacenamiento Local Resiliente (`db/local_surveys.json`)

Para garantizar alta disponibilidad local y desarrollo sin dependencias externas obligatorias, el servicio `local-survey-store.ts` mantiene una réplica exacta estructurada:

```json
[
  {
    "id": "survey-demo-1",
    "creatorId": "admin-master",
    "title": "Encuesta de Percepción de Seguridad Vial 2026",
    "description": "Evaluación ciudadana de infraestructura, estado de vías y señalización.",
    "slug": "seguridad-vial-2026",
    "shortCode": "SV2026",
    "status": "published",
    "accessMode": "public_anonymous",
    "allowPartial": false,
    "maxResponses": 5000,
    "startsAt": null,
    "endsAt": null,
    "consentText": "Autorizo al INTT el tratamiento de mis respuestas...",
    "createdAt": "2026-03-29T12:00:00.000Z",
    "updatedAt": "2026-03-29T12:00:00.000Z",
    "creator": { "id": "admin-master", "name": "Administrador General", "email": "admin@intt.gob.ve" },
    "_count": { "questions": 2, "responses": 0 },
    "questions": [
      {
        "id": "q-1",
        "surveyId": "survey-demo-1",
        "position": 1,
        "type": "single_choice",
        "label": "¿Cuál es su principal medio de transporte habitual?",
        "required": true,
        "options": [
          { "id": "opt-1", "label": "Motocicleta", "value": "moto", "position": 1 },
          { "id": "opt-2", "label": "Automóvil particular", "value": "auto", "position": 2 }
        ]
      }
    ]
  }
]
```

---

## 5. Coexistencia con Tablas Base Legacy

Las tablas preexistentes del estudio de motocicletas se preservan mediante mapeo explícito en Prisma (`prisma/schema.prisma`):
- `SurveyResponse` $\rightarrow$ `legacy_responses` (respuestas históricas del estudio base).
- `SurveySummary` $\rightarrow$ `legacy_summaries` (caché de agregaciones del estudio base).
- Respaldo de contingencia local: `db/sqlite_backup.json` para respuestas base cuando PostgreSQL está offline.
