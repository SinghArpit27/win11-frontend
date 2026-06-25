/**
 * Motion tokens. Durations are in ms; easings are CSS-compatible strings
 * that also work as Framer Motion `ease` arrays after conversion.
 */
export const Motion = {
  duration: {
    instant: 80,
    fast: 150,
    base: 220,
    slow: 320,
    page: 420,
  },
  easing: {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export type MotionDurationKey = keyof typeof Motion.duration;
export type MotionEasingKey = keyof typeof Motion.easing;
