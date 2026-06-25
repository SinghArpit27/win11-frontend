import { memo } from 'react';

import { cn } from '@utils/cn';

/**
 * Visual credit budget progress bar. Used inside the sticky bottom
 * action bar on the create-team screen.
 *
 * Colour shifts:
 *   - < 80% used → primary gradient
 *   - 80–100%     → warning amber
 *   - > 100%      → danger red + outline pulse
 */
interface CreditsBarProps {
  used: number;
  budget: number;
  className?: string;
}

const CreditsBarComponent = ({ used, budget, className }: CreditsBarProps): JSX.Element => {
  const pct = budget > 0 ? Math.min(100, (used / budget) * 100) : 0;
  const over = used > budget;
  const remaining = budget - used;

  const fillTone = over
    ? 'bg-gradient-to-r from-danger to-danger/60'
    : pct > 80
      ? 'bg-gradient-to-r from-warning to-warning/60'
      : 'bg-gradient-primary';

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        <span>Credits</span>
        <span className={cn(over ? 'text-danger' : 'text-text')}>
          {used.toFixed(1)} / {budget}
        </span>
      </div>
      <div
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-surface-elevated',
          over && 'ring-1 ring-danger/40 animate-pulse',
        )}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-[width]', fillTone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-text-muted">
        {over
          ? `Over budget by ${Math.abs(remaining).toFixed(1)} credits`
          : `${remaining.toFixed(1)} credits remaining`}
      </div>
    </div>
  );
};

export const CreditsBar = memo(CreditsBarComponent);
