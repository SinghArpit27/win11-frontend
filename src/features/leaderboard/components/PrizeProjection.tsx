import { Coins } from 'lucide-react';
import { memo } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { formatPrizeCompact } from '@features/contests/contest.utils';

/**
 * Projected winnings strip — rendered below the user-rank card while
 * the contest is live so the user sees what they'd cash out if the
 * board froze right now.
 *
 *  Renders nothing when `projectedAmount` is null / zero — the empty
 *  state lives on the consumer screen.
 */
interface PrizeProjectionProps {
  projectedAmount: number | null;
  currentRank: number | null;
  contestPool: number;
  currency?: string;
  className?: string;
}

const PrizeProjectionComponent = ({
  projectedAmount,
  currentRank,
  contestPool,
  currency = 'INR',
  className,
}: PrizeProjectionProps): JSX.Element | null => {
  if (projectedAmount === null || projectedAmount <= 0 || currentRank === null) return null;

  const sharePct = contestPool > 0 ? (projectedAmount / contestPool) * 100 : 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-success/30 bg-success/5 px-3 py-2',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-success" aria-hidden />
        <Typography variant="caption" tone="muted" className="text-[11px]">
          Projected winning at rank #{currentRank}
        </Typography>
      </div>
      <div className="flex flex-col items-end leading-tight">
        <Typography
          variant="body"
          className="text-sm font-extrabold tabular-nums text-success"
        >
          {formatPrizeCompact(projectedAmount, currency)}
        </Typography>
        {sharePct > 0 && (
          <Typography variant="caption" tone="muted" className="text-[9px]">
            {sharePct.toFixed(2)}% of pool
          </Typography>
        )}
      </div>
    </div>
  );
};

export const PrizeProjection = memo(PrizeProjectionComponent);
PrizeProjection.displayName = 'PrizeProjection';
