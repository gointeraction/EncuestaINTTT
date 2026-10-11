/** Breakpoints canónicos (px) leídos desde CSS en runtime.
 *  Fuente única: tokens/primitives/breakpoints.css (--ds-breakpoint-*).
 *  Los servicios (ViewportService, BreakpointObserverService) derivan de aquí. */
export interface Breakpoints {
  /** width < mobile → tier MOBILE */
  mobile: number;
  /** sub-boundary "md" dentro del tier tablet (Tailwind md:) */
  tablet: number;
  /** width ≥ desktop → tier DESKTOP */
  desktop: number;
}

/** Tokens CSS que son la fuente canónica. */
export const BREAKPOINT_TOKENS = {
  mobile: '--ds-breakpoint-mobile',
  tablet: '--ds-breakpoint-tablet',
  desktop: '--ds-breakpoint-desktop',
} as const;

/** Fallback (SSR / CSS aún no montado). Debe coincidir con breakpoints.css. */
export const DEFAULT_BREAKPOINTS: Breakpoints = { mobile: 640, tablet: 768, desktop: 1024 };

/** Lee los breakpoints desde el CSS montado (getComputedStyle). Si el documento
 *  no existe o el token no está definido, cae a DEFAULT_BREAKPOINTS. */
export function readBreakpoints(doc?: Document): Breakpoints {
  if (!doc) return DEFAULT_BREAKPOINTS;
  const win = doc.defaultView;
  const cs = win && typeof win.getComputedStyle === 'function'
    ? win.getComputedStyle(doc.documentElement)
    : null;
  if (!cs) return DEFAULT_BREAKPOINTS;

  const parse = (token: string, fallback: number): number => {
    const raw = cs.getPropertyValue(token).trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  return {
    mobile: parse(BREAKPOINT_TOKENS.mobile, DEFAULT_BREAKPOINTS.mobile),
    tablet: parse(BREAKPOINT_TOKENS.tablet, DEFAULT_BREAKPOINTS.tablet),
    desktop: parse(BREAKPOINT_TOKENS.desktop, DEFAULT_BREAKPOINTS.desktop),
  };
}
