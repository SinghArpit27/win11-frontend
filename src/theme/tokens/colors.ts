/**
 * Raw color palette.
 *
 * Components MUST NOT reference these directly — always go through the
 * semantic theme tokens (see `themes/*.theme.ts`) so white-label builds
 * and remote theme overrides work uniformly.
 *
 * The palette is intentionally split into two scales:
 *  - `ink*`     — neutral grayscale tuned for premium-app dark surfaces
 *                  (`#0F0F10` to `#F7F7F8`).
 *  - `crimson*` — fantasy sports primary scale (Dream11 / MPL-style).
 *  - semantic   — success / warning / danger / info hex values.
 */
export const Palette = {
  black: '#000000',
  white: '#FFFFFF',

  // Neutral / ink scale — fantasy sports premium black & soft grays
  ink950: '#0A0A0B',
  ink900: '#0F0F10',
  ink850: '#151515',
  ink800: '#1A1A1A',
  ink750: '#1C1C1E',
  ink700: '#222222',
  ink650: '#2A2A2D',
  ink600: '#3A3A3F',
  ink500: '#5A5A60',
  ink400: '#7E7E86',
  ink300: '#A8A8AE',
  ink200: '#D5D5DA',
  ink150: '#E5E5EA',
  ink100: '#EDEDF0',
  ink50: '#F7F7F8',

  // Crimson scale — premium red primary inspired by Dream11 / MPL / My11Circle
  crimson900: '#7F1414',
  crimson800: '#9A1A1A',
  crimson700: '#B71C1C',
  crimson600: '#D32F2F',
  crimson500: '#E53935',
  crimson400: '#FF3B30',
  crimson300: '#FF5252',
  crimson200: '#FF6B6B',
  crimson100: '#FFA199',

  // Sports semantic
  success: '#00C853',
  successDeep: '#00B248',
  warning: '#FFB300',
  warningDeep: '#FF8F00',
  danger: '#FF3B30',
  dangerDeep: '#D32F2F',
  info: '#22D3EE',
} as const;

export type PaletteKey = keyof typeof Palette;
