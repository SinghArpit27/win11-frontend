/**
 * Shadow scale. Values are valid CSS `box-shadow` strings — the theme
 * engine injects them as CSS variables so they can be hot-swapped at
 * runtime.
 *
 * Two registries:
 *  - `DarkShadow`  — deeper shadows tuned for `#0F0F10`-style backgrounds.
 *  - `LightShadow` — softer shadows tuned for `#F7F7F8`-style backgrounds.
 *
 * Each theme picks the appropriate set. `glow` is a brand-aware ring used
 * for primary CTAs — both registries use the crimson primary so it tracks
 * the fantasy sports identity regardless of mode.
 */

const CRIMSON_RGB = '229, 57, 53';

export const DarkShadow = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.32)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.32), 0 1px 2px rgba(0, 0, 0, 0.20)',
  md: '0 6px 16px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.24)',
  lg: '0 16px 40px rgba(0, 0, 0, 0.48), 0 6px 16px rgba(0, 0, 0, 0.32)',
  xl: '0 28px 72px rgba(0, 0, 0, 0.56), 0 10px 28px rgba(0, 0, 0, 0.36)',
  glow: `0 0 0 1px rgba(${CRIMSON_RGB}, 0.36), 0 10px 32px rgba(${CRIMSON_RGB}, 0.40)`,
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
} as const;

export const LightShadow = {
  none: 'none',
  xs: '0 1px 2px rgba(15, 15, 16, 0.06)',
  sm: '0 2px 4px rgba(15, 15, 16, 0.08), 0 1px 2px rgba(15, 15, 16, 0.04)',
  md: '0 6px 16px rgba(15, 15, 16, 0.10), 0 2px 6px rgba(15, 15, 16, 0.06)',
  lg: '0 16px 40px rgba(15, 15, 16, 0.12), 0 6px 16px rgba(15, 15, 16, 0.08)',
  xl: '0 28px 72px rgba(15, 15, 16, 0.16), 0 10px 28px rgba(15, 15, 16, 0.10)',
  glow: `0 0 0 1px rgba(${CRIMSON_RGB}, 0.18), 0 10px 28px rgba(${CRIMSON_RGB}, 0.22)`,
  inset: 'inset 0 1px 0 rgba(15, 15, 16, 0.04)',
} as const;

/** Backward-compat default — dark shadows. Themes can override. */
export const Shadow = DarkShadow;

export type ShadowKey = keyof typeof DarkShadow;
