import { memo } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { formatPoints } from '../leaderboard.utils';

/**
 * Bold tabular-nums points chip. Auto-grows for 4-digit scores so the
 * leaderboard table stays aligned.
 */
interface ScorePillProps {
  points: number;
  /** Optional label rendered above the number (e.g. "PTS"). */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tone?: 'default' | 'primary' | 'success';
}

const ScorePillComponent = ({
  points,
  label,
  size = 'md',
  className,
  tone = 'default',
}: ScorePillProps): JSX.Element => {
  const dim = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-[18px]',
  }[size];

  return (
    <div className={cn('flex flex-col items-end leading-tight', className)}>
      {label && (
        <Typography
          variant="caption"
          tone="muted"
          className="text-[9px] font-semibold uppercase tracking-wider"
        >
          {label}
        </Typography>
      )}
      <Typography
        variant="body"
        className={cn(
          'font-extrabold tabular-nums',
          dim,
          tone === 'primary' && 'text-primary',
          tone === 'success' && 'text-success',
          tone === 'default' && 'text-text',
        )}
      >
        {formatPoints(points)}
      </Typography>
    </div>
  );
};

export const ScorePill = memo(ScorePillComponent);
ScorePill.displayName = 'ScorePill';
