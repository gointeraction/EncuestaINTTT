import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { isDevMode } from '@angular/core';
import { ThemeMode, CSSVarMap } from '../themes/theme.model';
import { THEMES } from '../../themes';
import { DsPageBannerService } from './ds-page-banner.service';
import { FontLoaderService } from './font-loader.service';
import { SettingsService } from '../../../../core/settings/settings.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly bannerSvc = inject(DsPageBannerService);
  private readonly fontLoader = inject(FontLoaderService);
  private readonly settingsSvc = inject(SettingsService);

  readonly themeName = signal<string>(this.settingsSvc.settings().themeName);
  readonly themeMode = signal<ThemeMode>(this.settingsSvc.settings().themeMode);
  readonly designMode = signal<boolean>(true);
  readonly designModeStructureOnly = signal<boolean>(false);
  readonly bodyScroll = signal<'auto' | 'hidden'>('auto');
  readonly fabVisible = signal<boolean>(this.settingsSvc.settings().fabVisible);
  readonly isMockData = signal<boolean>(this.settingsSvc.settings().useMockData);
  readonly pageMetadata = signal<any | null>(null);
  readonly pageName = signal<string>('');
  readonly showMetadataModal = signal<boolean>(false);

  readonly hasError = computed(() => this.bannerSvc.hasError());
  readonly hasNotification = computed(() => this.bannerSvc.hasNotification());
  readonly themeLabel = computed(() => `${this.themeName()} (${this.themeMode()})`);
  readonly isDark = computed(() => this.themeMode() === 'dark');
  readonly theme = this.themeMode;

  constructor() {
    // ═══ Synchronous initial paint ═══
    // Apply theme to DOM immediately so CSS variables are active before the first render.
    // The effect() below keeps it reactive after that.
if (this.isBrowser) {
      this.applyToDOM(this.themeName(), this.themeMode());
    }

    // Apply theme to DOM + persist via SettingsService (single source of truth)
effect(() => {
      const name = this.themeName();
      const mode = this.themeMode();
      this.applyToDOM(name, mode);
      this.fontLoader.loadThemeFonts(name);
      this.settingsSvc.update('themeName', name);
      this.settingsSvc.update('themeMode', mode);
      // Also persist to a dedicated key that no other code touches
      if (this.isBrowser) {
        try { localStorage.setItem('inv_theme_selected', mode); } catch {}
      }
    });
    effect(() => this.settingsSvc.update('fabVisible', this.fabVisible()));
    effect(() => { if (this.isBrowser) { try { localStorage.setItem('ds_page_name', this.pageName()); } catch {} } });
    effect(() => this.settingsSvc.update('useMockData', this.isMockData()));

    // Watch SettingsService for external theme changes (e.g. from dashboard settings)
    effect(() => {
      const externalTheme = this.settingsSvc.settings().themeMode;
      if (externalTheme !== this.themeMode()) {
        this.themeMode.set(externalTheme);
      }
    });
    // Also sync from dedicated localStorage key on init (immune to accidental overrides)
    if (this.isBrowser) {
      try {
        const saved = localStorage.getItem('inv_theme_selected');
        if (saved === 'light' || saved === 'dark') {
          if (saved !== this.themeMode()) {
            this.themeMode.set(saved);
          }
        }
      } catch {}
    }

    // Watch SettingsService for external fabVisible / useMockData changes (e.g. from dashboard)
    effect(() => {
      const extFab = this.settingsSvc.settings().fabVisible;
      if (extFab !== this.fabVisible()) this.fabVisible.set(extFab);
    });
    effect(() => {
      const extMock = this.settingsSvc.settings().useMockData;
      if (extMock !== this.isMockData()) this.isMockData.set(extMock);
    });

    if (this.isBrowser) {
      const html = this.document.documentElement;
      this.designMode.set(html.classList.contains('design-mode'));
      new MutationObserver(() => {
        const hasClass = html.classList.contains('design-mode');
        if (this.designMode() !== hasClass) this.designMode.set(hasClass);
      }).observe(html, { attributes: true, attributeFilter: ['class'] });
    }
  }

  applyTheme(name: string, mode?: ThemeMode): void {
    this.themeName.set(name);
    if (mode) this.themeMode.set(mode);
  }

  toggleMode(): void { this.themeMode.update(m => m === 'light' ? 'dark' : 'light'); }
  toggleTheme(): void { this.toggleMode(); }

  toggleDesignMode(): void {
    if (this.isBrowser) this.document.documentElement.classList.toggle('design-mode');
  }

  toggleDesignModeStructureOnly(): void {
    this.designModeStructureOnly.update(v => !v);
    if (this.isBrowser) this.document.documentElement.classList.toggle('design-mode-structure-only');
  }

  toggleBodyScroll(): void { this.bodyScroll.update(v => v === 'auto' ? 'hidden' : 'auto'); }

  toggleFabVisibility(): void { this.fabVisible.update(v => !v); }
  restoreFabVisibility(): void { this.fabVisible.set(this.settingsSvc.settings().fabVisible); }

  toggleMockData(): void { this.isMockData.update(v => !v); }

  toggleTestError(): void {
    if (this.bannerSvc.hasError()) { this.bannerSvc.clearErrors(); }
    else { this.bannerSvc.addError('The operation could not be completed. Please try again or contact support if the issue persists.', 'HTTP 500 · Test', 'error'); }
  }

  toggleTestNotification(): void {
    if (this.bannerSvc.hasNotification()) { this.bannerSvc.clearNotifications(); }
    else { this.bannerSvc.addNotification('Changes have been saved successfully and are available to all users.', 'System · Test'); }
  }

  getAvailableThemes(): string[] { return THEMES.map((t) => t.id); }

  applyFullPalette(slug: string, light: CSSVarMap, dark: CSSVarMap): void {
    if (!this.isBrowser) return;
    const lightDecls = this.varMapToDecls(light);
    const darkDecls = this.varMapToDecls(dark);
    const css = `[data-theme-name="${slug}"][data-theme-mode="light"] { ${lightDecls} } [data-theme-name="${slug}"][data-theme-mode="dark"]  { ${darkDecls} }`;
    this.injectStyle('dynamic-theme', css);
    this.themeName.set(slug);
  }

  private applyToDOM(name: string, mode: ThemeMode): void {
    const html = this.document.documentElement;
    html.setAttribute('data-theme-name', name);
    html.setAttribute('data-theme-mode', mode);
    html.setAttribute('data-theme', mode);
    html.classList.toggle('dark', mode === 'dark');
  }

  private injectStyle(id: string, css: string): void {
    let el = this.document.getElementById(id) as HTMLStyleElement | null;
    if (!el) { el = this.document.createElement('style'); el.id = id; this.document.head.appendChild(el); }
    el.textContent = css;
  }

  private varMapToDecls(map: CSSVarMap): string {
    return Object.entries(map).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v};`).join(' ');
  }
}
