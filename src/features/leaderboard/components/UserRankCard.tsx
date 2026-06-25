import { TrendingUp, Trophy } from 'lucide-react';
import { memo, useMemo } from 'react';

import { Card, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { RankMovement } from '@shared/enums';

import type { RankHistoryEntry, UserRank } from '../leaderboard.types';
import {
  formatPoints,
  formatRankOrdinal,
  formatWinning,
  percentileOf,
} from '../leaderboard.utils';
import { RankMovementIndicator } from './RankMovementIndicator';

/**
 * Sticky "Your Rank" card pinned above the leaderboard table.
 *
 *  Shows:
 *    - Current rank (with movement indicator)
 *    - Current fantasy points
 *    - Projected winnings (if any)
 *    - Percentile bar (top X%)
 *
 *  Uses the rank-history endpoint to derive the latest movement so we
 *  don't need a separate `previousRank` field on the user-rank DTO.
 */
interface UserRankCardProps {
  rank: UserRank | null;
  latestHistory?: RankHistoryEntry | null;
  winningAmount?: number | null;
  currency?: string;
  className?: string;
}

const UserRankCardComponent = ({
  rank,
  latestHistory,
  winningAmount = null,
  currency = 'INR',
  className,
}: UserRankCardProps): JSX.Element => {
  const percentile = useMemo(
    () => (rank?.rank ? percentileOf(rank.rank, rank.totalEntries) : 0),
    [rank?.rank, rank?.totalEntries],
  );

  if (!rank || rank.rank === null || rank.rank === 0) {
    return (
      <Card padding="md" variant="flat" className={cn('border border-border', className)}>
        <Typography variant="caption" tone="muted">
          Join this contest with a team to appear on the leaderboard.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      padding="none"
      variant="flat"
      className={cn(
        'overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent',
        className,
      )}
      data-testid="user-rank-card"
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
        <div className="flex flex-col items-center">
          <Trophy className="h-5 w-5 text-warning" aria-hidden />
          <Typography variant="caption" tone="muted" className="text-[9px] uppercase">
            Your Rank
          </Typography>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-baseline gap-2">
            <Typography
              variant="h3"
              className="text-2xl font-extrabold tabular-nums leading-none text-text"
            >
              {formatRankOrdinal(rank.rank)}
            </Typography>
            {latestHistory && (
              <RankMovementIndicator
                movement={latestHistory.movement}
                delta={latestHistory.rankDelta}
              />
            )}
          </div>
          <Typography variant="caption" tone="muted" className="text-[11px]">
            of {rank.totalEntries.toLocaleString('en-IN')} ·{' '}
            <span className="font-semibold text-text">
              {formatPoints(rank.points)} pts
            </span>
          </Typography>
        </div>

        {winningAmount !== null && winningAmount > 0 && (
          <div className="flex flex-col items-end">
            <Typography variant="caption" tone="muted" className="text-[9px] uppercase">
              Winning
            </Typography>
            <Typography variant="body" className="text-base font-extrabold tabular-nums text-success">
              {formatWinning(winningAmount, currency)}
            </Typography>
          </div>
        )}
      </div>

      {percentile > 0 && (
        <div className="border-t border-border bg-bg-elevated/40 px-4 py-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-text-muted">
              <TrendingUp className="h-3 w-3" aria-hidden />
              Top{' '}
              <span className="font-bold text-text">
                {percentile >= 99
                  ? '1%'
                  : `${Math.max(1, Math.round(100 - percentile))}%`}
              </span>
            </span>
            {latestHistory && latestHistory.movement === RankMovement.UP && (
              <span className="text-[10px] font-semibold text-success">
                Climbed {Math.abs(latestHistory.rankDelta)} places
              </span>
            )}
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg">
            <div
              className="h-full bg-gradient-to-r from-primary via-success to-warning transition-all duration-500"
              style={{ width: `${Math.min(100, percentile)}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export const UserRankCard = memo(UserRankCardComponent);
UserRankCard.displayName = 'UserRankCard';
