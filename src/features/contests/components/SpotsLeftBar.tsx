import { memo } from 'react';

import { cn } from '@utils/cn';

interface SpotsLeftBarProps {
  filled: number;
  total: number;
  fillPercentage: number;
  className?: string;
  compact?: boolean;
}

/**
 * Dream11-style horizontal "spots filled" bar. Renders three pieces:
 *   - filled gradient track
 *   - spots-left label (right) — turns red when ≤ 20% remain
 *   - total spots label (left, optional in compact mode)
 *
 * Pure / memoised — re-renders only when the percentage changes.
 */
const SpotsLeftBarComponent = ({
  filled,
  total,
  fillPercentage,
  className,
  compact = false,
}: SpotsLeftBarProps): JSX.Element => {
  const left = Math.max(0, total - filled);
  // Hot-zone styling kicks in below 20% capacity left.
  const isHot = total > 0 && left / total <= 0.2 && left > 0;
  const isFull = left === 0 && total > 0;
  const pct = Math.min(100, Math.max(0, Math.round(fillPercentage)));

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-elevated">
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-500 ease-app-out',
            isFull
              ? 'bg-text-muted/40'
              : isHot
                ? 'bg-gradient-to-r from-warning to-danger'
                : 'bg-gradient-primary',
          )}
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div
        className={cn(
          'flex items-center justify-between text-[11px] font-medium leading-none',
          compact ? 'text-text-muted' : '',
        )}
      >
        <span className={cn(isHot && !isFull && 'text-danger', isFull && 'text-text-muted')}>
          {isFull ? 'Contest Full' : `${left.toLocaleString('en-IN')} spots left`}
        </span>
        {!compact && (
          <span className="text-text-muted">
            {total.toLocaleString('en-IN')} spots
          </span>
        )}
      </div>
    </div>
  );
};

export const SpotsLeftBar = memo(SpotsLeftBarComponent);
SpotsLeftBar.displayName = 'SpotsLeftBar';
