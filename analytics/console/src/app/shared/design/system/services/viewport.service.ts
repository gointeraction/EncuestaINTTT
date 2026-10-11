import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ViewportSize } from '../themes/theme.model';
import { readBreakpoints, type Breakpoints } from '../themes/breakpoints';

/**
 * ViewportService — detects and tracks the current viewport size (mobile /
 * tablet / desktop) reactively. Used by responsive design decisions.
 * Tiers derivados de los tokens CSS (tokens/primitives/breakpoints.css):
 *   width < mobile → MOBILE · mobile ≤ width < desktop → TABLET · width ≥ desktop → DESKTOP.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Breakpoints activos (leídos del CSS; fallback SSR = defaults). */
  readonly breakpoints: Breakpoints = readBreakpoints(this.isBrowser ? this.document : undefined);

  private readonly _width = signal<number>(this.isBrowser ? window.innerWidth : 1024);

  readonly width = this._width.asReadonly();
  readonly isMobile = computed(() => this._width() < this.breakpoints.mobile);
  readonly isTablet = computed(() => this._width() >= this.breakpoints.mobile && this._width() < this.breakpoints.desktop);
  readonly isDesktop = computed(() => this._width() >= this.breakpoints.desktop);
  readonly size = computed<ViewportSize>(() =>
    this.isMobile() ? 'mobile' : this.isTablet() ? 'tablet' : 'desktop',
  );

  constructor() {
    if (this.isBrowser) {
      window.addEventListener('resize', () => this._width.set(window.innerWidth));
    }
  }
}
