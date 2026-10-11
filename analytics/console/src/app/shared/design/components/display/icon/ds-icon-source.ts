import { DS_ICON_REGISTRY } from './ds-icon-registry';
import { DS_EXTERNAL_ICON_REGISTRY } from './ds-external-icon-registry';

/**
 * DS_ICON_SOURCES — the UNIFIED icon mechanism behind `ds-icon`.
 *
 * ds-icon renders ANY icon through ONE component. The icon NAME is resolved to a
 * source using a scheme prefix:
 *
 *   lucide:arrow-left   → lucide-static SVG asset (inline, currentColor)
 *   fa:home             → Font Awesome class (rendered as <i class="fa fa-home">)
 *   custom:ds-agent     → locally-stored SVG asset (vendor/custom, public/assets)
 *
 * The prefix is OPTIONAL: a bare name is looked up in the registries in order
 * (lucide-static curated set → local/custom assets → font-awesome), so older
 * call-sites keep working unchanged.
 */
export type DsIconSource = 'lucide' | 'fa' | 'custom';

export interface DsIconResolution {
  source: DsIconSource;
  /** Asset path (lucide/custom) or FA class fragment (e.g. 'home' → 'fa-home'). */
  value: string;
}

const FA_NAMESPACES = ['fa', 'fas', 'far', 'fab', 'fad'];

function faClass(fragment: string): string {
  return FA_NAMESPACES.includes(fragment) ? fragment : `fa-${fragment}`;
}

/** Resolve a ds-icon name to (source, value). Bare names fall back to registry order. */
export function resolveDsIcon(name: string): DsIconResolution | null {
  if (!name) return null;

  if (name.startsWith('lucide:')) {
    const key = name.slice('lucide:'.length);
    return DS_ICON_REGISTRY[key] ? { source: 'lucide', value: DS_ICON_REGISTRY[key] } : null;
  }

  if (name.startsWith('custom:')) {
    const key = name.slice('custom:'.length);
    return DS_EXTERNAL_ICON_REGISTRY[key]
      ? { source: 'custom', value: DS_EXTERNAL_ICON_REGISTRY[key] }
      : null;
  }

  if (name.startsWith('fa:')) {
    return { source: 'fa', value: faClass(name.slice('fa:'.length)) };
  }
  // bare older FA namespaces (e.g. 'fas:car') — keep them explicit
  for (const ns of FA_NAMESPACES) {
    if (name.startsWith(`${ns}:`)) {
      return { source: 'fa', value: faClass(name.slice(`${ns}:`.length)) };
    }
  }

  // bare name — curated lucide set, then local/custom assets, then FA
  if (name in DS_ICON_REGISTRY) return { source: 'lucide', value: DS_ICON_REGISTRY[name] };
  if (name in DS_EXTERNAL_ICON_REGISTRY) return { source: 'custom', value: DS_EXTERNAL_ICON_REGISTRY[name] };
  return { source: 'fa', value: faClass(name) };
}