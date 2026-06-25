import { Crown } from 'lucide-react';
import { memo, useCallback } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

import type { LeaderboardRow as LeaderboardRowDTO } from '../leaderboard.types';
import { formatWinning } from '../leaderboard.utils';
import { RankBadge } from './RankBadge';
import { RankMovementIndicator } from './RankMovementIndicator';
import { ScorePill } from './ScorePill';

/**
 * Single row of the contest leaderboard table.
 *
 *  Layout (mobile):
 *    [Rank][Avatar][Team / User][Movement] · · · [Score][Winnings]
 *
 *  Highlights:
 *    - The signed-in user's row is sticky-highlighted (`isSelf`).
 *    - Pure + memoised — list paints stay cheap for 10k entries.
 */
interface LeaderboardRowProps {
  row: LeaderboardRowDTO;
  currency?: string;
  onClick?: (row: LeaderboardRowDTO) => void;
}

const LeaderboardRowComponent = ({
  row,
  currency = 'INR',
  onClick,
}: LeaderboardRowProps): JSX.Element => {
  const handleClick = useCallback(() => {
    onClick?.(row);
  }, [onClick, row]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
        'border-border bg-surface hover:border-border-strong hover:bg-bg-elevated',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        row.isSelf && 'border-primary bg-primary/5 hover:border-primary',
      )}
      data-self={row.isSelf}
      aria-label={`Rank ${row.rank}: ${row.displayName} with ${row.points} points`}
    >
      <RankBadge rank={row.rank} size="sm" />

      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg-elevated ring-1 ring-border">
        {row.avatarUrl ? (
          <img
            src={row.avatarUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-text-muted">
            {row.displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        {row.isSelf && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 rounded-full bg-primary p-0.5 text-white shadow"
          >
            <Crown className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <Typography
            variant="body"
            className={cn(
              'truncate text-[13px] font-bold leading-tight',
              row.isSelf ? 'text-primary' : 'text-text',
            )}
          >
            {row.displayName}
            {row.isSelf && <span className="ml-1 text-[10px] font-semibold opacity-75">(You)</span>}
          </Typography>
          <RankMovementIndicator
            movement={row.movement}
            delta={row.previousRank !== null ? row.previousRank - row.rank : 0}
            compact
          />
        </div>
        {row.fantasyTeamName && (
          <Typography variant="caption" tone="muted" className="truncate text-[11px]">
            {row.fantasyTeamName}
          </Typography>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {row.winningAmount !== null && row.winningAmount > 0 && (
          <Typography
            variant="caption"
            className="text-[11px] font-bold tabular-nums text-success"
          >
            {formatWinning(row.winningAmount, currency)}
          </Typography>
        )}
        <ScorePill
          points={row.points}
          size="md"
          tone={row.isSelf ? 'primary' : 'default'}
        />
      </div>
    </button>
  );
};

export const LeaderboardRow = memo(LeaderboardRowComponent);
LeaderboardRow.displayName = 'LeaderboardRow';
