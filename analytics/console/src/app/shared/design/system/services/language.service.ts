// ═══════════════════════════════════════════════════════════════
// DS LANGUAGE SERVICE — optional i18n interface (desacoplado).
// Each app provides its own implementation via the injection token;
// the design system consumes it OPTIONALLY (never assumes a language).
// ═══════════════════════════════════════════════════════════════

import { InjectionToken, signal, type Signal, type WritableSignal } from '@angular/core';

export type SupportedLang = 'en' | 'es';

export interface ILanguageService {
  readonly activeLang: Signal<SupportedLang>;
  setLanguage(lang: SupportedLang): void;
  toggle(): void;
}

export const LANGUAGE_SERVICE = new InjectionToken<ILanguageService>('LANGUAGE_SERVICE');

/**
 * No-op default implementation — language toggle hidden when no service provided.
 * Apps provide their own via the LANGUAGE_SERVICE token.
 */
export class NoopLanguageService implements ILanguageService {
  readonly activeLang: WritableSignal<SupportedLang> = signal('en');
  setLanguage(_lang: SupportedLang): void {}
  toggle(): void {}
}