import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { TURNSTILE_SITE_KEY } from '../turnstile.config';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    turnstile?: any;
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoader: Promise<void> | null = null;

/** Carga (una sola vez) el script de Turnstile. */
function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoader) {
    scriptLoader = new Promise<void>((resolve) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }
  return scriptLoader;
}

/**
 * Widget de Cloudflare Turnstile (anti-bot) — emite el token cuando se resuelve y
 * un string vacío al expirar o fallar. Se apoya en el script global (no usa HttpClient).
 */
@Component({
  selector: 'app-turnstile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ts" #host aria-hidden="false"></div>`,
  styles: `.ts { display: flex; justify-content: center; min-height: 65px; }`,
})
export class TurnstileComponent implements AfterViewInit, OnDestroy {
  readonly token = output<string>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private widgetId: string | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!TURNSTILE_SITE_KEY) return; // deshabilitado: sin sitekey no se monta el widget
    await loadTurnstileScript();
    if (!window.turnstile) return;
    this.widgetId = window.turnstile.render(this.host().nativeElement, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => this.token.emit(token),
      'expired-callback': () => this.token.emit(''),
      'error-callback': () => this.token.emit(''),
    });
  }

  ngOnDestroy(): void {
    if (this.widgetId && window.turnstile) {
      try {
        window.turnstile.remove(this.widgetId);
      } catch {
        /* noop */
      }
    }
  }
}
