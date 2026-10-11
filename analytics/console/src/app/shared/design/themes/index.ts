import { DEFAULT_THEME } from './default/default.theme';
import type { BrandTheme } from './theme.model';

export type { BrandTheme } from './theme.model';
export { DEFAULT_THEME } from './default/default.theme';

/** Temas de marca registrados. Para añadir uno:
 *  1. crea themes/<id>/brand.css (scoped bajo `:root[data-theme-name="<id>"]`);
 *  2. crea themes/<id>/<id>.theme.ts con su BrandTheme;
 *  3. regístralo aquí. El FAB / ThemeService lo exponen automáticamente. */
export const THEMES: BrandTheme[] = [DEFAULT_THEME];

export function getTheme(id: string): BrandTheme | null {
  return THEMES.find((t) => t.id === id) ?? null;
}

/** Resolución tolerante: temas desconocidos caen al por defecto. */
export function getThemeOrDefault(id: string): BrandTheme {
  return getTheme(id) ?? DEFAULT_THEME;
}
