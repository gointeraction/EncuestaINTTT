-- =============================================================================
-- Índice GIN sobre el documento de respuestas (JSON) de Visión Cero.
-- A2: 00-manifest/answers-storage.md §06 (robustecimiento) y analysis-filtering.md.
--
-- Habilita consultar POR PREGUNTA de forma eficiente sobre `answers::jsonb` con
-- CONTENCIÓN (`@>`), que es lo que usa el panel (escalar `{"q":"v"}` y miembro de
-- array `{"q":["v"]}`):
--   answers::jsonb @> '{"casco_usa":"Siempre"}'
--   answers::jsonb @> '{"siniestro_causas":["Exceso de velocidad"]}'
--
-- `jsonb_path_ops` (no `jsonb_ops`): más pequeño y sin recheck "lossy" para `@>`.
-- Se retiró el índice `jsonb_ops` porque ya no se usan los operadores `?`/`?|`.
--
-- Idempotente. Lo aplica el servicio `migrate` (superusuario) tras `prisma db push`.
-- =============================================================================

DROP INDEX IF EXISTS idx_legacy_answers_gin; -- jsonb_ops (obsoleto)

CREATE INDEX IF NOT EXISTS idx_legacy_answers_gin
  ON public.legacy_survey_responses
  USING gin ((answers::jsonb) jsonb_path_ops);
