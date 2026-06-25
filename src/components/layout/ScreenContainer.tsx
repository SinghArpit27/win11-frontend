import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@utils/cn';

interface ScreenContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

/**
 * Legacy per-screen container. Kept for backward compatibility with
 * Phase-1 placeholder screens. New screens should prefer
 * `<PageContainer>` which exposes responsive width variants.
 *
 * Now responsive instead of mobile-clamped:
 *  - mobile  → full width, snug padding,
 *  - tablet+ → roomier padding,
 *  - desktop → capped at `max-w-content` so wide monitors don't stretch
 *               content to unreadable widths.
 *
 * Renders as `<div>` (not `<main>`) — the outer `AppShell` is the canonical
 * landmark, so nesting another would break the document outline.
 */
export const ScreenContainer = ({
  children,
  padded = true,
  className,
  ...props
}: ScreenContainerProps): JSX.Element => (
  <div
    className={cn(
      'mx-auto flex w-full max-w-content flex-1 flex-col',
      padded && 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
