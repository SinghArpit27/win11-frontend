import type { HTMLAttributes } from 'react';

import { cn } from '@utils/cn';

interface SafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  top?: boolean;
  bottom?: boolean;
}

/**
 * Adds iOS/Android safe-area padding on the requested edges. Wrap the
 * outermost content node of each screen with `<SafeArea top bottom>` so
 * notches and home indicators never overlap content.
 */
export const SafeArea = ({
  top = true,
  bottom = true,
  className,
  ...props
}: SafeAreaProps): JSX.Element => (
  <div
    className={cn(top && 'safe-pt', bottom && 'safe-pb', className)}
    {...props}
  />
);
