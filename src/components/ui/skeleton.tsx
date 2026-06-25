import type { HTMLAttributes } from 'react';

import { cn } from '@utils/cn';

/**
 * Skeleton placeholder. The shimmer gradient resolves through theme
 * vars so it adapts to white-label themes without any hardcoded colour.
 */
export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn(
      'animate-shimmer rounded-md bg-[length:200%_100%]',
      'bg-[linear-gradient(110deg,var(--w11-color-surface)_8%,var(--w11-color-surface-elevated)_18%,var(--w11-color-surface)_33%)]',
      className,
    )}
    {...props}
  />
);
