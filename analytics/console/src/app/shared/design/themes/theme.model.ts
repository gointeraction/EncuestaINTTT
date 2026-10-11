/** Modelo de un tema de marca (brand theme). Un tema es SOLO identidad:
 *  colores de marca (--ds-color-brand-*) + tipografía de marca (--ds-font-*).
 *  Todo lo demás (layout, estado, componentes) es núcleo y NO cambia con el tema. */
export interface BrandTheme {
  /** Id estable del tema (se casa con `data-theme-name` en <html>). */
  id: string;
  /** Nombre para UI (FAB / selectores). */
  name: string;
  /** Ruta del CSS del tema (brand colors + brand typography), relativa a design/. */
  css: string;
  /** Familias externas adicionales a cargar en runtime (Google Fonts). Las familias
   *  del tema normalmente se sirven auto-alojadas vía fonts/font-faces.css. */
  externalFonts?: string[];
}
