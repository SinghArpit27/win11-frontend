import { memo } from 'react';

import { cn } from '@utils/cn';

/**
 * Compact player counter shown in the sticky bottom bar. Renders the
 * count next to the rule's max + a horizontal segmented strip so the
 * user can see at a glance how full the lineup is.
 */
interface TeamCounterProps {
  selected: number;
  required: number;
  className?: string;
}

const TeamCounterComponent = ({ selected, required, className }: TeamCounterProps): JSX.Element => {
  const filled = Math.min(selected, required);
  const overflow = Math.max(0, selected - required);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        <span>Players</span>
        <span className="text-text">
          {selected}/{required}
        </span>
      </div>
      <div
        className="flex w-full gap-1"
        role="progressbar"
        aria-valuenow={selected}
        aria-valuemin={0}
        aria-valuemax={required}
      >
        {Array.from({ length: required }).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              idx < filled ? 'bg-gradient-primary' : 'bg-surface-elevated',
            )}
          />
        ))}
        {overflow > 0 ? (
          <span className="h-2 w-3 rounded-full bg-danger" aria-hidden />
        ) : null}
      </div>
    </div>
  );
};

export const TeamCounter = memo(TeamCounterComponent);
