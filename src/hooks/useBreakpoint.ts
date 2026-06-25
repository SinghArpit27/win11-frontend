import { useMemo } from 'react';

import { Breakpoints } from '@theme/tokens/breakpoints';

import { useMediaQuery } from './useMediaQuery';

/**
 * Coarse breakpoint label used for layout-level decisions (which shell to
 * render, mount/unmount desktop-only widgets, etc.). Three buckets only —
 * use Tailwind responsive classes for finer-grained adaptations.
 *
 *  - `mobile`   width  <  md  (< 768px)
 *  - `tablet`   md  ≤ width < lg  (768–1023px)
 *  - `desktop`  width  ≥  lg (≥ 1024px)
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointState {
  /** Current coarse breakpoint label. */
  current: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Convenience: `isMobile || isTablet`. */
  isTouch: boolean;
}

/**
 * Single source of truth for runtime breakpoint awareness.
 *
 * Prefer this over ad-hoc `useMediaQuery` calls — it returns a memoised
 * object so consumers re-render only when the bucket actually changes.
 *
 * NOTE: most responsive behaviour should still live in CSS (`sm:`, `lg:`
 * classes). Reach for `useBreakpoint` only when you need to:
 *  - mount/unmount components conditionally (sidebar vs drawer),
 *  - choose different framer-motion animations,
 *  - branch business logic on viewport (rare).
 */
export const useBreakpoint = (): BreakpointState => {
  const isTablet = useMediaQuery(
    `(min-width: ${Breakpoints.md}px) and (max-width: ${Breakpoints.lg - 0.02}px)`,
  );
  const isDesktop = useMediaQuery(`(min-width: ${Breakpoints.lg}px)`);
  const isMobile = !isTablet && !isDesktop;

  return useMemo<BreakpointState>(
    () => ({
      current: isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile',
      isMobile,
      isTablet,
      isDesktop,
      isTouch: isMobile || isTablet,
    }),
    [isMobile, isTablet, isDesktop],
  );
};
