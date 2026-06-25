import { Palette } from './colors';

/**
 * Gradient registry — every gradient resolves to a valid CSS
 * `linear-gradient`. The theme engine writes them into CSS variables so
 * component code only needs to read `bg-gradient-primary`, etc.
 *
 * The fantasy-sports identity is crimson-driven. Each theme can override
 * specific gradient stops (notably `card` which differs between dark and
 * light surfaces) while keeping the visual language consistent.
 */
export interface GradientStops {
  angle: number;
  stops: ReadonlyArray<{ color: string; at: number }>;
}

export const Gradients = {
  primary: {
    angle: 135,
    stops: [
      { color: Palette.crimson500, at: 0 },
      { color: Palette.crimson400, at: 100 },
    ],
  },
  accent: {
    angle: 135,
    stops: [
      { color: Palette.crimson200, at: 0 },
      { color: Palette.crimson500, at: 100 },
    ],
  },
  hero: {
    angle: 135,
    stops: [
      { color: Palette.crimson700, at: 0 },
      { color: Palette.crimson500, at: 55 },
      { color: Palette.crimson400, at: 100 },
    ],
  },
  card: {
    angle: 180,
    stops: [
      { color: Palette.ink800, at: 0 },
      { color: Palette.ink750, at: 100 },
    ],
  },
  cardLight: {
    angle: 180,
    stops: [
      { color: Palette.white, at: 0 },
      { color: Palette.ink50, at: 100 },
    ],
  },
  surface: {
    angle: 180,
    stops: [
      { color: Palette.ink900, at: 0 },
      { color: Palette.ink850, at: 100 },
    ],
  },
  surfaceLight: {
    angle: 180,
    stops: [
      { color: Palette.ink50, at: 0 },
      { color: Palette.white, at: 100 },
    ],
  },
  success: {
    angle: 135,
    stops: [
      { color: Palette.success, at: 0 },
      { color: Palette.successDeep, at: 100 },
    ],
  },
  danger: {
    angle: 135,
    stops: [
      { color: Palette.crimson400, at: 0 },
      { color: Palette.crimson600, at: 100 },
    ],
  },
  /**
   * Cricket / fantasy field — deep emerald body with a slightly darker
   * frame so player chips and pitch lines have contrast. Used by the
   * team preview screen and the saved-team card.
   */
  field: {
    angle: 180,
    stops: [
      { color: '#0F3B23', at: 0 },
      { color: '#0B5530', at: 35 },
      { color: '#0A4327', at: 70 },
      { color: '#072516', at: 100 },
    ],
  },
  /**
   * Header strip for the fantasy create-team flow. Dark navy gradient
   * matches the Dream11 / My11Circle reference (#041220 → #071b2e) so
   * the white team labels, score, and "PTS" pill all read clearly.
   */
  fantasyHeader: {
    angle: 180,
    stops: [
      { color: '#041220', at: 0 },
      { color: '#071b2e', at: 100 },
    ],
  },
} as const satisfies Record<string, GradientStops>;

export type GradientKey = keyof typeof Gradients;

/** Serialise a `GradientStops` into a valid CSS `linear-gradient(...)` string. */
export const gradientToCss = (g: GradientStops): string => {
  const stops = g.stops.map((s) => `${s.color} ${s.at}%`).join(', ');
  return `linear-gradient(${g.angle}deg, ${stops})`;
};
