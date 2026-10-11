-- =============================================================================
-- Índice ÚNICO parcial: UNA sola participación de sorteo por cédula.
-- A2: 00-manifest/capture-offline-and-integrity.md §05 (integridad del sorteo).
-- Evita la race condition (dos envíos concurrentes de la misma cédula).
-- Idempotente. Lo aplica el servicio `migrate` (superusuario).
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_legacy_cedula_sorteo_unique
  ON public.legacy_survey_responses (cedula)
  WHERE "participaSorteo" = true AND cedula IS NOT NULL;
