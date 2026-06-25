import { useEffect, useState } from 'react';

import { Breakpoints, type BreakpointKey } from '@theme/tokens/breakpoints';

/**
 * Reactive `matchMedia` hook. Server-safe: returns `false` on the first
 * paint when window is unavailable (effectively SSR-friendly, even
 * though we ship CSR-only today — keeps the door open for PWA prerender).
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent): void => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export const useMinWidth = (bp: BreakpointKey): boolean =>
  useMediaQuery(`(min-width: ${Breakpoints[bp]}px)`);

export const useMaxWidth = (bp: BreakpointKey): boolean =>
  useMediaQuery(`(max-width: ${Breakpoints[bp] - 0.02}px)`);

export const useIsMobile = (): boolean => useMaxWidth('md');
export const useIsTablet = (): boolean => useMediaQuery(`(min-width: ${Breakpoints.md}px) and (max-width: ${Breakpoints.lg - 0.02}px)`);
export const useIsDesktop = (): boolean => useMinWidth('lg');
