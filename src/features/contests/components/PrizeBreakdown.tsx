import { Award, Medal, Trophy } from 'lucide-react';
import { memo, useMemo } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { formatMoney } from '@features/wallet/wallet.utils';

import { PrizeDistributionType } from '@shared/enums';

import type { ContestPrizeSnapshot } from '../contest.types';
import { slabPrize, slabRankLabel } from '../contest.utils';

interface PrizeBreakdownProps {
  snapshot: ContestPrizeSnapshot;
  currency?: string;
  className?: string;
  /** When true, only show first N slabs. Defaults to all. */
  limit?: number;
}

const RANK_ICON = (rank: number): JSX.Element => {
  if (rank === 1) return <Trophy className="h-4 w-4 text-warning" aria-hidden />;
  if (rank === 2) return <Medal className="h-4 w-4 text-text-muted" aria-hidden />;
  if (rank === 3) return <Award className="h-4 w-4 text-accent" aria-hidden />;
  return (
    <span
      aria-hidden
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface-elevated text-[9px] font-bold text-text-muted"
    >
      #
    </span>
  );
};

/**
 * Renders the prize slabs as a sectioned list.
 *
 *   ┌──────────────────────────┐
 *   │ 🏆 Rank 1        ₹10,000 │
 *   │ 🥈 Rank 2        ₹5,000  │
 *   │ 🥉 Rank 3        ₹2,500  │
 *   │ #  Rank 4-10     ₹500    │
 *   └──────────────────────────┘
 */
const PrizeBreakdownComponent = ({
  snapshot,
  currency = 'INR',
  className,
  limit,
}: PrizeBreakdownProps): JSX.Element => {
  const rows = useMemo(() => {
    const list = snapshot.slabs.map((slab) => ({
      key: `${slab.fromRank}-${slab.toRank}`,
      label: slabRankLabel(slab),
      amount: slabPrize(slab, snapshot.poolAmount),
      bonus: slab.bonusLabel,
      fromRank: slab.fromRank,
    }));
    return limit ? list.slice(0, limit) : list;
  }, [snapshot, limit]);

  const hidden =
    limit && snapshot.slabs.length > limit
      ? snapshot.slabs.length - limit
      : 0;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Type chip */}
      <div className="mb-2 flex items-center justify-between">
        <Typography
          variant="caption"
          tone="muted"
          className="text-[10px] font-bold uppercase tracking-wider"
        >
          Prize Distribution
        </Typography>
        <Typography
          variant="caption"
          tone="muted"
          className="text-[10px] uppercase"
        >
          {snapshot.type === PrizeDistributionType.PERCENTAGE_BASED
            ? '% of pool'
            : snapshot.type === PrizeDistributionType.FIXED
              ? 'Fixed'
              : 'Rank based'}
        </Typography>
      </div>

      <ul role="list" className="divide-y divide-border rounded-lg border border-border bg-surface">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              {RANK_ICON(row.fromRank)}
              <div className="min-w-0">
                <Typography variant="body" className="block text-sm font-semibold leading-tight">
                  {row.label}
                </Typography>
                {row.bonus && (
                  <Typography variant="caption" tone="muted" className="block text-[11px]">
                    {row.bonus}
                  </Typography>
                )}
              </div>
            </div>
            <Typography
              variant="body"
              className="shrink-0 text-sm font-bold tabular-nums text-text"
            >
              {formatMoney(row.amount, { currency })}
            </Typography>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <Typography variant="caption" tone="muted" className="mt-2 text-center text-[11px]">
          +{hidden} more slab{hidden === 1 ? '' : 's'}
        </Typography>
      )}
    </div>
  );
};

export const PrizeBreakdown = memo(PrizeBreakdownComponent);
PrizeBreakdown.displayName = 'PrizeBreakdown';
