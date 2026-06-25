import type { ReactNode } from 'react';

import { cn } from '@utils/cn';

/**
 * Bottom-anchored action bar used by every step of the create-team flow.
 *
 *  On mobile  : `fixed` to the bottom edge above the global bottom tab
 *               bar so the primary CTA stays in the thumb zone.
 *  On desktop : becomes part of the scroll flow as a 'sticky' footer of
 *               the section card.
 *
 *  Composition slot:
 *   - `summary` (top)   — meters, role chips, validation feedback
 *   - `actions` (right) — primary + secondary buttons
 */
interface StickyActionBarProps {
  summary?: ReactNode;
  actions: ReactNode;
  className?: string;
}

export const StickyActionBar = ({
  summary,
  actions,
  className,
}: StickyActionBarProps): JSX.Element => {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-30 mx-auto w-full max-w-screen-xl border-t border-border bg-surface/95 px-3 py-3 backdrop-blur',
        'shadow-[0_-8px_24px_rgba(0,0,0,0.18)] sm:px-4',
        className,
      )}
    >
      {summary ? <div className="mb-3">{summary}</div> : null}
      <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {actions}
      </div>
    </div>
  );
};
