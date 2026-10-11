-- Migración Inicial SDD: Sistema de Gestión de Encuestas v1.1.0 (PostgreSQL)

-- Habilitar extensión pgcrypto para gen_random_uuid si no existe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear Enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('admin', 'creator', 'analyst');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SurveyStatus" AS ENUM ('draft', 'published', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AccessMode" AS ENUM ('public_anonymous', 'email_verified', 'invitation_token', 'whitelist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ResponseStatus" AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'used', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Tabla de Usuarios (Creadores, Analistas, Admins)
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "name" VARCHAR(255),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'creator',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Encuestas
CREATE TABLE IF NOT EXISTS "surveys" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(100) NOT NULL UNIQUE,
    "short_code" VARCHAR(16) NOT NULL UNIQUE,
    "status" "SurveyStatus" NOT NULL DEFAULT 'draft',
    "access_mode" "AccessMode" NOT NULL DEFAULT 'public_anonymous',
    "allow_partial" BOOLEAN NOT NULL DEFAULT false,
    "max_responses" INTEGER,
    "starts_at" TIMESTAMPTZ,
    "ends_at" TIMESTAMPTZ,
    "consent_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de Preguntas
CREATE TABLE IF NOT EXISTS "questions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "survey_id" UUID NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "section_id" VARCHAR(100),
    "type" VARCHAR(32) NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "validation_rules" JSONB NOT NULL DEFAULT '{}',
    "branching_rules" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla de Opciones de Pregunta
CREATE TABLE IF NOT EXISTS "question_options" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
    "label" TEXT NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- 5. Tabla de Respuestas Globales (Sesiones de Respuesta)
CREATE TABLE IF NOT EXISTS "responses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "survey_id" UUID NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "respondent_token" VARCHAR(128),
    "email_hash" VARCHAR(128),
    "status" "ResponseStatus" NOT NULL DEFAULT 'completed',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "submitted_at" TIMESTAMPTZ,
    "device" JSONB NOT NULL DEFAULT '{}',
    "channel" VARCHAR(32) NOT NULL DEFAULT 'link',
    "ip_hash" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabla de Respuestas Específicas por Pregunta (Normalizada)
CREATE TABLE IF NOT EXISTS "answers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "response_id" UUID NOT NULL REFERENCES "responses"("id") ON DELETE CASCADE,
    "question_id" UUID NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
    "value_text" TEXT,
    "value_numeric" NUMERIC(10, 2),
    "value_options" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "uq_response_question" UNIQUE ("response_id", "question_id")
);

-- 7. Tabla de Invitaciones de Acceso Único
CREATE TABLE IF NOT EXISTS "invitations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "survey_id" UUID NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "token" VARCHAR(128) NOT NULL UNIQUE,
    "email" VARCHAR(255),
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabla de Auditoría Inmutable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" BIGSERIAL PRIMARY KEY,
    "actor_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(64) NOT NULL,
    "entity_type" VARCHAR(64) NOT NULL,
    "entity_id" VARCHAR(64) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ÍNDICES CRÍTICOS PARA RENDIMIENTO (NFR-1 / ADR-2)
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_surveys_creator" ON "surveys" ("creator_id");
CREATE INDEX IF NOT EXISTS "idx_surveys_status" ON "surveys" ("status");
CREATE INDEX IF NOT EXISTS "idx_questions_survey_pos" ON "questions" ("survey_id", "position");
CREATE INDEX IF NOT EXISTS "idx_question_options_q_pos" ON "question_options" ("question_id", "position");
CREATE INDEX IF NOT EXISTS "idx_responses_survey_status" ON "responses" ("survey_id", "status");
CREATE INDEX IF NOT EXISTS "idx_responses_survey_respondent_token" ON "responses" ("survey_id", "respondent_token");
CREATE INDEX IF NOT EXISTS "idx_answers_question_numeric" ON "answers" ("question_id", "value_numeric");
CREATE INDEX IF NOT EXISTS "idx_invitations_survey" ON "invitations" ("survey_id");
CREATE INDEX IF NOT EXISTS "idx_invitations_token" ON "invitations" ("token");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_actor" ON "audit_logs" ("actor_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");
