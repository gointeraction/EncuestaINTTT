import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Settings del design system — estado persistido del shell/theme (localStorage).
 * Fuente única para preferencias de tema y del layout (design-mode, fab, mock).
 */
export interface SettingsShape {
  themeName: string;
  themeMode: 'light' | 'dark';
  fabVisible: boolean;
  useMockData: boolean;
  designMode: boolean;
  designModeStructureOnly: boolean;
  [key: string]: string | boolean | number | unknown;
}

const STORAGE_KEY = 'cifraflow_settings';

const DEFAULTS: SettingsShape = {
  themeName: 'cifraflow',
  themeMode: 'light',
  fabVisible: true,
  useMockData: true,
  designMode: true,
  designModeStructureOnly: false,
};

/** Reads + merges defaults; resilient to corrupt JSON. */
function readSettings(): SettingsShape {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (!raw) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * SettingsService — persistencia de preferencias del design system.
 * `settings()` devuelve el snapshot actual; `update(key, value)` lo muta y lo
 * persiste en localStorage bajo `cifraflow_settings`.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private state: SettingsShape = readSettings();

  settings(): SettingsShape {
    return this.state;
  }

  update(key: string, value: string | boolean | number): void {
    this.state = { ...this.state, [key]: value };
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        /* storage no disponible (SSR / modo privado) — ignorar */
      }
    }
  }
}