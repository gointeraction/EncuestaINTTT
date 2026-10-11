/**
 * DS_EXTERNAL_ICON_REGISTRY — locally-stored SVGs (vendor + custom) exposed
 * through ds-icon. Files live under public/assets/icons/ following the README
 * convention; here we map a kebab name → asset path so templates only use
 * `<ds-icon name="...">`. Inline render on purpose (currentColor inheritance).
 */
export const DS_EXTERNAL_ICON_REGISTRY: Record<string, string> = {
  // vendor — third-party sources (svgrepo.com, etc.)
  'rocket-launch': 'assets/icons/vendor/tailwindlabs/rocket-launch.svg',
  // brand — social providers (simple-icons, monochrome currentColor)
  'google': 'assets/icons/vendor/brands/google.svg',
  'apple': 'assets/icons/vendor/brands/apple.svg',
  'facebook': 'assets/icons/vendor/brands/facebook.svg',
  'linkedin': 'assets/icons/vendor/brands/linkedin.svg',
  'github': 'assets/icons/vendor/brands/github.svg',
  // custom — hand-designed, stored locally
  'ds-agent': 'assets/icons/custom/ds-agent.svg',
};

export type DsExternalIconName = keyof typeof DS_EXTERNAL_ICON_REGISTRY;