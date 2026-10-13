-- =============================================================================
-- Pre-sync: convierte `public.legacy_survey_responses.answers` de `text` a `jsonb`.
-- `prisma db push` no puede emitir el `USING` requerido (text→jsonb no tiene cast
-- implícito), por eso este paso corre ANTES del `db push`/`migrate deploy`.
--
-- Idempotente y seguro en base vacía (si la tabla aún no existe, no hace nada y el
-- `db push` la crea ya como jsonb). El `ALTER` reescribe la tabla (lock exclusivo):
-- ejecutar en ventana de mantenimiento con datos grandes.
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.legacy_survey_responses') IS NOT NULL
     AND (
       SELECT data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'legacy_survey_responses'
         AND column_name = 'answers'
     ) = 'text'
  THEN
    RAISE NOTICE 'convirtiendo public.legacy_survey_responses.answers a jsonb...';
    ALTER TABLE public.legacy_survey_responses
      ALTER COLUMN answers TYPE jsonb USING answers::jsonb;
  END IF;
END $$;
