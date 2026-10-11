import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { readBreakpoints } from '../themes/breakpoints';

/**
 * BreakpointObserverService — señales responsive como Observables (RxJS / CDK).
 * Las media queries se generan desde los tokens CSS
 * (tokens/primitives/breakpoints.css) para que coincidan EXACTAMENTE con
 * ViewportService:
 *   isMobile$  → width <  mobile
 *   isTablet$  → mobile ≤ width < desktop
 *   isDesktop$ → width ≥ desktop
 */
@Injectable({ providedIn: 'root' })
export class BreakpointObserverService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly document = inject(DOCUMENT);

  private readonly bp = readBreakpoints(this.document);

  /** true when screen < mobile (640px por defecto) */
  public readonly isMobile$: Observable<boolean>;
  /** true when mobile ≤ screen < desktop (640–1023px por defecto) */
  public readonly isTablet$: Observable<boolean>;
  /** true when screen ≥ desktop (1024px por defecto) */
  public readonly isDesktop$: Observable<boolean>;

  constructor() {
    const { mobile, desktop } = this.bp;
    const between = (min: number, max?: number) =>
      max === undefined ? `(min-width: ${min}px)` : `(min-width: ${min}px) and (max-width: ${max}px)`;

    this.isMobile$ = this.breakpointObserver
      .observe([`(max-width: ${mobile - 1}px)`])
      .pipe(map((s: BreakpointState) => s.matches), shareReplay(1));

    this.isTablet$ = this.breakpointObserver
      .observe([between(mobile, desktop - 1)])
      .pipe(map((s: BreakpointState) => s.matches), shareReplay(1));

    this.isDesktop$ = this.breakpointObserver
      .observe([between(desktop)])
      .pipe(map((s: BreakpointState) => s.matches), shareReplay(1));
  }
}
