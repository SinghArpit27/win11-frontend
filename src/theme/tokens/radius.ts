/**
 * Corner radius scale.
 *  - `pill` is large enough to fully round any normal-height button.
 */
export const Radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof Radius;
