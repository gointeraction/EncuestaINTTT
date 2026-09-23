// ============================================================================
// Configuración de la institución dueña de la aplicación
// ============================================================================
// Para que el logo institucional aparezca automáticamente, coloca el archivo
// de imagen en:  /home/z/my-project/public/intt-logo.png
// (también se aceptan .svg, .jpg, .webp — ajusta LOGO_SRC si usas otra extensión)
// ============================================================================

export const INSTITUTION = {
  acronym: "INTT",
  name: "Instituto Nacional de Tránsito y Transporte",
  shortName: "INTT",
  // Ruta del logo en /public. Si el archivo no existe, se muestra un fallback
  // estilizado (monograma) automáticamente.
  logoSrc: "/intt-logo.png",
  appTitle: "Visión Cero",
  appSubtitle: "Encuesta de Siniestros de Motocicletas",
} as const;
