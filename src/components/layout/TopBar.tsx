import type { ReactNode } from 'react';

import { cn } from '@utils/cn';

interface TopBarProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
  transparent?: boolean;
}

/**
 * Sticky top app bar used by mobile / tablet screens. Defaults to a
 * translucent elevated background so a contest hero image (later phase)
 * can bleed under it on scroll. Always honours safe area.
 *
 * Desktop screens use `AppTopBar` instead — this component should be
 * hidden / unmounted there.
 */
export const TopBar = ({
  title,
  left,
  right,
  className,
  transparent = false,
}: TopBarProps): JSX.Element => (
  <header
    className={cn(
      'sticky top-0 z-30 w-full safe-pt lg:hidden',
      transparent
        ? 'bg-transparent'
        : 'border-b border-border bg-bg-elevated/85 backdrop-blur-md',
      className,
    )}
  >
    <div className="mx-auto flex h-top-bar max-w-content items-center gap-3 px-4">
      <div className="flex w-10 items-center justify-start">{left}</div>
      <div className="flex flex-1 items-center justify-center">
        {title ? (
          <h1 className="truncate text-base font-semibold text-text">{title}</h1>
        ) : null}
      </div>
      <div className="flex w-10 items-center justify-end">{right}</div>
    </div>
  </header>
);
