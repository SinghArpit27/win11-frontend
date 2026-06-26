import { memo, type ReactNode } from 'react';

import { cn } from '@utils/cn';

/**
 * Mobile-first frame for the create-team flow.
 * Outer `bg-bg` + inner `bg-surface` so light/dark/system themes stay readable.
 */
interface FantasyFlowShellProps {
  children: ReactNode;
  /** Reserve space for a fixed bottom action bar. */
  withFooter?: boolean;
  className?: string;
}

const FantasyFlowShellComponent = ({
  children,
  withFooter = false,
  className,
}: FantasyFlowShellProps): JSX.Element => (
  <div className="flex min-h-0 flex-1 flex-col bg-bg">
    <div
      className={cn(
        'relative flex min-h-0 w-full flex-1 flex-col bg-surface text-text',
        withFooter && 'pb-24',
        className,
      )}
    >
      {children}
    </div>
  </div>
);

export const FantasyFlowShell = memo(FantasyFlowShellComponent);

interface FantasyStickyFooterProps {
  children: ReactNode;
  className?: string;
}

/** Themed bottom bar — works in light, dark, and system themes. */
const FantasyStickyFooterComponent = ({
  children,
  className,
}: FantasyStickyFooterProps): JSX.Element => (
  <div
    className={cn(
      'fixed inset-x-0 bottom-0 z-40 w-full',
      'border-t border-border bg-surface/95 px-3 py-2.5 safe-pb backdrop-blur-md',
      'shadow-[0_-8px_24px_rgba(0,0,0,0.12)]',
      className,
    )}
  >
    {children}
  </div>
);

export const FantasyStickyFooter = memo(FantasyStickyFooterComponent);

/** Primary / secondary pill buttons used in fantasy footers. */
export const fantasyFooterBtn = {
  ghost: cn(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5',
    'text-xs font-bold uppercase tracking-wider transition-all',
    'bg-text text-bg shadow-md hover:brightness-110',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  primary: cn(
    'inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5',
    'text-xs font-bold uppercase tracking-wider transition-all',
    'bg-success text-text-inverse shadow-md hover:brightness-110',
    'disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-text-muted',
  ),
};
