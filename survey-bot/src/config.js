// ============================================================================
// Configuración del bot (independiente de la app: sólo variables de entorno).
// ============================================================================

/** Lee la configuración desde variables de entorno con valores por defecto. */
export function loadConfig(env = process.env) {
  const bool = (v, def) => (v == null ? def : /^(1|true|si|sí|yes)$/i.test(v));
  const num = (v, def) => (v == null || v === "" || Number.isNaN(Number(v)) ? def : Number(v));
  return {
    baseUrl: env.BASE_URL || "http://localhost:80",
    // Dataset del seed a reproducir (carpeta con CSV por tipo, o un único CSV).
    dataset: env.DATASET_DIR || env.DATASET || "../analytics/seed/data/datasets/sample-5k",
    count: Math.max(1, num(env.COUNT, 1)), // nº de registros a reproducir
    offset: Math.max(0, num(env.OFFSET, 0)), // desde qué registro empezar
    concurrency: Math.max(1, num(env.CONCURRENCY, 1)),
    thinkMs: Math.max(0, num(env.THINK_MS, 300)),
    headless: bool(env.HEADLESS, true),
  };
}
