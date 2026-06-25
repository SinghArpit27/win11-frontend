import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@utils/cn';

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Horizontal cap for the inner content.
   *
   * - `content` (default) — large premium dashboard width (`max-w-content`).
   * - `wide`              — uncapped, full available width.
   * - `narrow`            — readable column (`max-w-3xl`), good for forms / settings.
   * - `app`               — legacy mobile-style 480px column. Avoid for new screens.
   */
  width?: 'content' | 'wide' | 'narrow' | 'app';
  /**
   * Whether to apply the default responsive padding. Set to `false` for
   * full-bleed hero sections that supply their own padding.
   */
  padded?: boolean;
  /**
   * Render as `<main>` instead of `<div>`. Use exactly one per screen,
   * typically the outermost container.
   */
  as?: 'main' | 'div' | 'section';
}

const WIDTH_CLASS: Record<NonNullable<PageContainerProps['width']>, string> = {
  content: 'max-w-content',
  wide: 'max-w-none',
  narrow: 'max-w-3xl',
  app: 'max-w-app',
};

/**
 * Responsive content wrapper for authenticated user screens.
 *
 * - Always centers horizontally with `mx-auto`.
 * - Mobile: snug horizontal padding (`px-4`), comfortable vertical rhythm.
 * - Tablet+: roomier padding (`sm:px-6 lg:px-8`).
 * - Caps at `--w11-layout-content-max-width` by default so 32" monitors
 *   don't stretch tracking-tight headers to 200ch.
 *
 * Replaces the legacy `max-w-app` mobile-emulator wrap on desktop.
 */
export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ children, width = 'content', padded = true, as = 'div', className, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        className={cn(
          'mx-auto flex w-full flex-1 flex-col',
          WIDTH_CLASS[width],
          padded && 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
PageContainer.displayName = 'PageContainer';
