import { Breakpoints, type BreakpointKey } from '@theme/tokens/breakpoints';

/**
 * Server-safe responsive helpers. Components needing reactive matching
 * should pair these with `useMediaQuery`.
 */

export const minWidth = (bp: BreakpointKey): string =>
  `(min-width: ${Breakpoints[bp]}px)`;

export const maxWidth = (bp: BreakpointKey): string =>
  `(max-width: ${Breakpoints[bp] - 0.02}px)`;

export const between = (a: BreakpointKey, b: BreakpointKey): string =>
  `(min-width: ${Breakpoints[a]}px) and (max-width: ${Breakpoints[b] - 0.02}px)`;

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};
