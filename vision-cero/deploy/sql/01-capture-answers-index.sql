-- =============================================================================
-- Índice GIN sobre el documento de respuestas (JSON) de Visión Cero.
-- A2: 00-manifest/answers-storage.md §06 (robustecimiento).
--
-- Habilita consultar POR PREGUNTA de forma eficiente sobre `answers::jsonb`:
--   answers::jsonb ? 'casco_usa'          -- ¿el documento contiene la pregunta?
--   answers::jsonb ->> 'sexo' = 'Femenino'
--   answers::jsonb @> '{"licencia":"No"}'
--
-- Idempotente (IF NOT EXISTS). Lo aplica el servicio `migrate` (superusuario) tras
-- `prisma db push`.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_legacy_answers_gin
  ON public.legacy_survey_responses
  USING gin ((answers::jsonb));
