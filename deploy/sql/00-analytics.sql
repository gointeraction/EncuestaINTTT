-- =============================================================================
-- F1: esquema `analytics` + rol del back-office.
-- Idempotente. Lo aplica el servicio `migrate` (superusuario) tras sincronizar
-- el esquema `public` de la captura. El rol `intt_analytics`:
--   * escribe SOLO en `analytics`
--   * LEE (SELECT) la captura `public`
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS analytics;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'intt_analytics') THEN
    CREATE ROLE intt_analytics LOGIN;
  END IF;
END $$;

-- Dueño lógico del esquema analytics (crea/edita sus propias tablas vía Prisma).
GRANT ALL PRIVILEGES ON SCHEMA analytics TO intt_analytics;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO intt_analytics;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO intt_analytics;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO intt_analytics;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON SEQUENCES TO intt_analytics;

-- Lectura de SOLO LECTURA sobre la captura (esquema public).
GRANT USAGE ON SCHEMA public TO intt_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO intt_analytics;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO intt_analytics;
