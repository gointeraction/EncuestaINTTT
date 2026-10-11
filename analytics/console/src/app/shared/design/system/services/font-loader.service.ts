import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { getThemeOrDefault } from '../../themes';

@Injectable({ providedIn: 'root' })
export class FontLoaderService {
  private doc = inject(DOCUMENT);
  private link: HTMLLinkElement | null = null;

  /** Carga fuentes EXTERNAS declaradas por el tema activo (si las hay).
   *  Las familias del tema normalmente se sirven auto-alojadas vía
   *  fonts/font-faces.css (montadas por tokens/index.css); este servicio
   *  solo complementa con Google Fonts cuando el tema lo declara en
   *  `externalFonts`. Temas desconocidos caen al por defecto. */
  loadThemeFonts(themeName: string): void {
    const theme = getThemeOrDefault(themeName);
    const fonts = theme.externalFonts ?? [];
    if (fonts.length === 0) return;

    const families = fonts.map((f) => `family=${f}:wght@400;500;600`).join('&');
    const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    if (this.link) this.link.remove();
    this.link = this.doc.createElement('link');
    this.link.rel = 'stylesheet';
    this.link.href = url;
    this.doc.head.appendChild(this.link);
  }
}
