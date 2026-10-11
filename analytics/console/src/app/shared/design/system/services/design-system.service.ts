import { InjectionToken, signal, type Signal } from '@angular/core';

/** One selectable design system (branding variant) exposed to the design tools. */
export interface DesignSystemOption {
  id: string;
  name: string;
}

/**
 * DESIGN_SYSTEM_SERVICE — optional seam (like LANGUAGE_SERVICE) for DATA-DRIVEN branding.
 *
 * The DESIGN SYSTEM never assumes a brand: the app provides a SOURCE of color tokens
 * (a configurable data file), this service loads + applies it, and the design tools (FAB)
 * let the author switch it. Because every component is token-only (`var(--ds-*)`), swapping
 * the source re-binds the whole palette at runtime — NO structural change.
 */
export interface IDesignSystemService {
  /** The selectable design systems (from the configurable registry). */
  readonly options: Signal<DesignSystemOption[]>;
  /** The active design-system id. */
  readonly activeId: Signal<string>;
  /** Apply a design system by id (loads its token source and re-binds the palette). */
  setActive(id: string): void;
}

export const DESIGN_SYSTEM_SERVICE = new InjectionToken<IDesignSystemService>('DESIGN_SYSTEM_SERVICE');

/** No-op default — the design-system selector is hidden when no service is provided. */
export class NoopDesignSystemService implements IDesignSystemService {
  readonly options = signal<DesignSystemOption[]>([]);
  readonly activeId = signal<string>('');
  setActive(_id: string): void {}
}
