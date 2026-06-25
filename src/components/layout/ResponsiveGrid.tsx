import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@utils/cn';

type ColCount = 1 | 2 | 3 | 4 | 5 | 6;
type GapToken = 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Column counts per breakpoint. Mobile-first — `base` applies under
   * `sm`, every other key extends the previous one.
   *
   * Example: `{ base: 1, sm: 2, lg: 4 }` → 1 col mobile, 2 col tablet,
   * 4 col desktop.
   */
  cols?: {
    base?: ColCount;
    sm?: ColCount;
    md?: ColCount;
    lg?: ColCount;
    xl?: ColCount;
  };
  /** Gap between cells. Maps to Tailwind gap-* utilities. */
  gap?: GapToken;
}

const COL_BASE: Record<ColCount, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};
const COL_SM: Record<ColCount, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
};
const COL_MD: Record<ColCount, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};
const COL_LG: Record<ColCount, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};
const COL_XL: Record<ColCount, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
};

const GAP_CLASS: Record<GapToken, string> = {
  sm: 'gap-2',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-5 lg:gap-6',
  xl: 'gap-6 sm:gap-8',
};

/**
 * Declarative responsive grid. Saves consumers from spelling out
 * `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` on every dashboard
 * section while keeping the underlying mechanism Tailwind-native (no
 * JS reflow, full SSR friendliness).
 */
export const ResponsiveGrid = ({
  children,
  cols = { base: 1, sm: 2, lg: 3 },
  gap = 'md',
  className,
  ...props
}: ResponsiveGridProps): JSX.Element => (
  <div
    className={cn(
      'grid',
      cols.base && COL_BASE[cols.base],
      cols.sm && COL_SM[cols.sm],
      cols.md && COL_MD[cols.md],
      cols.lg && COL_LG[cols.lg],
      cols.xl && COL_XL[cols.xl],
      GAP_CLASS[gap],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
