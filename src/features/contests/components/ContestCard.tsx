import { Crown, Lock, ShieldCheck, Trophy, Users } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import { Badge, Button, Card, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { ContestStatus, ContestType } from '@shared/enums';

import type { ContestSummary } from '../contest.types';
import {
  STATUS_META,
  TYPE_META,
  formatPrizeCompact,
  isContestJoinable,
  isFreeContest,
} from '../contest.utils';
import { SpotsLeftBar } from './SpotsLeftBar';

/**
 * Contest card — Dream11/My11Circle style.
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │ 🏆 Prize Pool                                Entry     │
 *   │ ₹57.03 Lakhs                                 ₹49       │
 *   │                                                        │
 *   │ ───── spots gradient bar ─────                         │
 *   │ 8,420 spots left                       6,580 / 15,000  │
 *   │                                                        │
 *   │ 🥇 ₹10 Lakhs    ✓ Guaranteed   👥 Up to 20 teams       │
 *   └────────────────────────────────────────────────────────┘
 *
 * Responsive:
 *   - Mobile  : single column, full-width tap surface.
 *   - Tablet+ : same layout, hover lift + ring for affordance.
 *
 * Optimisations:
 *   - `memo` — list re-renders are extremely common for big match lobbies.
 *   - All derived values via `useMemo` so paint stays cheap.
 *   - Theme tokens only; no hardcoded colours.
 */
interface ContestCardProps {
  contest: ContestSummary;
  /** Already-joined entry count for the current user. Renders a "Joined Nx" badge. */
  joinedCount?: number;
  onClick?: (contest: ContestSummary) => void;
  onJoinClick?: (contest: ContestSummary) => void;
  className?: string;
  /** When true, the card is rendered without an interactive cursor / hover. */
  readOnly?: boolean;
}

const ContestCardComponent = ({
  contest,
  joinedCount = 0,
  onClick,
  onJoinClick,
  className,
  readOnly = false,
}: ContestCardProps): JSX.Element => {
  const status = STATUS_META[contest.status];
  const type = TYPE_META[contest.type];
  const joinable = isContestJoinable(contest.status);
  const free = isFreeContest(contest);

  const handleCardClick = useCallback(() => {
    if (readOnly) return;
    onClick?.(contest);
  }, [contest, onClick, readOnly]);

  const handleJoinClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onJoinClick?.(contest);
    },
    [contest, onJoinClick],
  );

  const topPrizeLabel = useMemo(
    () => formatPrizeCompact(contest.topPrize, contest.currency),
    [contest.topPrize, contest.currency],
  );

  const entryLabel = useMemo(
    () => (free ? 'FREE' : formatPrizeCompact(contest.entryFee, contest.currency)),
    [contest.entryFee, contest.currency, free],
  );

  const showJoinedBadge = joinedCount > 0;
  const showMultiEntry = contest.maxEntriesPerUser > 1;

  return (
    <Card
      padding="none"
      variant="flat"
      onClick={handleCardClick}
      role={readOnly ? undefined : 'button'}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={
        readOnly
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick();
              }
            }
      }
      className={cn(
        'group relative overflow-hidden border border-border bg-surface transition-all duration-200',
        !readOnly &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      data-status={contest.status}
      data-type={contest.type}
    >
      {/* Mega ribbon */}
      {contest.type === ContestType.MEGA && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-warning via-primary to-accent"
        />
      )}

      {/* Status pills row */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Typography
            variant="caption"
            className={cn('text-[10px] font-bold uppercase tracking-wider', type.accent)}
          >
            {type.label}
          </Typography>
          {contest.isGuaranteed && (
            <Badge tone="success" className="text-[10px]">
              <ShieldCheck className="h-2.5 w-2.5" aria-hidden /> Guaranteed
            </Badge>
          )}
          {contest.hasInviteCode && (
            <Badge tone="neutral" className="text-[10px]">
              <Lock className="h-2.5 w-2.5" aria-hidden /> Private
            </Badge>
          )}
          {contest.status !== ContestStatus.OPEN && (
            <Badge tone={status.tone} className="text-[10px]">
              {status.label}
            </Badge>
          )}
        </div>
        {showJoinedBadge && (
          <Badge tone="primary" className="text-[10px]">
            <Crown className="h-2.5 w-2.5" aria-hidden /> Joined {joinedCount}x
          </Badge>
        )}
      </div>

      {/* Prize + Entry row */}
      <div className="grid grid-cols-[1fr_auto] items-end gap-4 px-4 pt-1">
        <div className="min-w-0">
          <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
            Prize Pool
          </Typography>
          <Typography
            variant="h4"
            className="block truncate text-[20px] font-extrabold tabular-nums leading-tight text-text"
          >
            {formatPrizeCompact(contest.prizePoolAmount, contest.currency)}
          </Typography>
        </div>
        <div className="shrink-0 text-right">
          <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
            Entry
          </Typography>
          {joinable ? (
            <Button
              variant={free ? 'success' : 'primary'}
              size="sm"
              onClick={handleJoinClick}
              className="min-w-[72px] font-extrabold tabular-nums"
              aria-label={`Join contest for ${entryLabel}`}
            >
              {entryLabel}
            </Button>
          ) : (
            <Typography variant="body" className="font-bold tabular-nums">
              {entryLabel}
            </Typography>
          )}
        </div>
      </div>

      {/* Spots bar */}
      <div className="px-4 pt-3">
        <SpotsLeftBar
          filled={contest.filledSpots}
          total={contest.totalSpots}
          fillPercentage={contest.fillPercentage}
        />
      </div>

      {/* Footer metadata strip */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border bg-bg-elevated/40 px-4 py-2 text-[11px] text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Trophy className="h-3 w-3 text-warning" aria-hidden />
          <span className="font-semibold text-text">{topPrizeLabel}</span>
        </span>
        {showMultiEntry && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden />
            Upto {contest.maxEntriesPerUser}
          </span>
        )}
        {!contest.isGuaranteed && contest.type !== ContestType.PRACTICE && (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
            Flexible
          </span>
        )}
      </div>
    </Card>
  );
};

export const ContestCard = memo(ContestCardComponent);
ContestCard.displayName = 'ContestCard';
