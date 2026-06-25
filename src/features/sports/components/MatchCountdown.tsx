import { useCountdown } from '@hooks/useCountdown';
import { cn } from '@utils/cn';

import { pad2 } from '../sports.utils';

/**
 * Compact ticker for an upcoming match.
 *
 * - Renders DD:HH:MM:SS while > 1 day away.
 * - Drops to HH:MM:SS once we're under a day.
 * - Collapses to MM:SS in the final hour for tighter rhythm.
 * - Returns null once the target has passed — the parent should swap in
 *   a "Live" indicator instead.
 */
interface MatchCountdownProps {
  scheduledAt: string;
  /** Allow consumers to render their own "live" indicator on expiry. */
  expiredLabel?: string;
  className?: string;
}

export const MatchCountdown = ({
  scheduledAt,
  expiredLabel,
  className,
}: MatchCountdownProps): JSX.Element | null => {
  const { days, hours, minutes, seconds, isStarted } = useCountdown(scheduledAt);

  if (isStarted) {
    if (!expiredLabel) return null;
    return (
      <span className={cn('text-xs font-semibold uppercase tracking-wider text-text-muted', className)}>
        {expiredLabel}
      </span>
    );
  }

  const renderUnit = (value: number, label: string): JSX.Element => (
    <span className="flex flex-col items-center leading-none">
      <span className="font-bold tabular-nums">{pad2(value)}</span>
      <span className="text-[9px] uppercase tracking-wider text-text-muted">{label}</span>
    </span>
  );

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs',
        className,
      )}
      role="timer"
      aria-label="Match starts in"
    >
      {days > 0 ? renderUnit(days, 'd') : null}
      {days > 0 || hours > 0 ? renderUnit(hours, 'h') : null}
      {renderUnit(minutes, 'm')}
      {days === 0 ? renderUnit(seconds, 's') : null}
    </div>
  );
};
