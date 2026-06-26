import { ChevronDown, CircleCheck, Medal, TrendingUp, Trophy } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { ContestStatus } from '@shared/enums';
import { cn } from '@utils/cn';

import type { ContestSummary } from '../contest.types';
import {
  formatEntryFeeLabel,
  formatPoolHeadline,
  formatPrizeCompact,
  isContestJoinable,
  isFreeContest,
} from '../contest.utils';

interface Dream11ContestCardProps {
  contest: ContestSummary;
  joinedCount?: number;
  onClick?: (contest: ContestSummary) => void;
  onJoinClick?: (contest: ContestSummary) => void;
  className?: string;
}

const estimateWinnersPercent = (contest: ContestSummary): number => {
  if (contest.totalSpots <= 0) return 0;
  const winners = Math.max(1, Math.round(contest.totalSpots * 0.22));
  return Math.min(99, Math.round((winners / contest.totalSpots) * 100));
};

/** Dream11 contest card — prize row, spots bar, grey stats footer. */
const Dream11ContestCardComponent = ({
  contest,
  joinedCount = 0,
  onClick,
  onJoinClick,
  className,
}: Dream11ContestCardProps): JSX.Element => {
  const palette = useDream11Palette();
  const joinable = isContestJoinable(contest.status);
  const free = isFreeContest(contest);
  const left = Math.max(0, contest.totalSpots - contest.filledSpots);
  const fillPct = Math.min(100, Math.max(0, Math.round(contest.fillPercentage)));
  const entryLabel = free ? 'FREE' : formatEntryFeeLabel(contest.entryFee, contest.currency);
  const poolLabel = formatPoolHeadline(contest.prizePoolAmount, contest.currency);
  const firstPrize = formatPrizeCompact(contest.topPrize, contest.currency);
  const megaTotal = formatPoolHeadline(contest.prizePoolAmount, contest.currency);
  const winPct = useMemo(() => estimateWinnersPercent(contest), [contest]);

  const handleCardClick = useCallback(() => onClick?.(contest), [contest, onClick]);
  const handleJoin = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onJoinClick?.(contest);
    },
    [contest, onJoinClick],
  );

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        'cursor-pointer overflow-hidden rounded-[10px] border shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/30',
        className,
      )}
      style={{
        borderColor: palette.border,
        backgroundColor: palette.card,
      }}
    >
      <div className="px-3 pb-2.5 pt-2.5">
        {contest.isGuaranteed ? (
          <div
            className="mb-1.5 flex items-center gap-1 text-[11px] font-normal leading-none"
            style={{ color: palette.textTertiary }}
          >
            <CircleCheck className="h-3.5 w-3.5 shrink-0 text-[#2e7d32]" aria-hidden />
            <span>
              Guaranteed<sup className="text-[8px]">+</sup> Prize Pool
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <p
            className="text-[22px] font-extrabold leading-none tabular-nums tracking-tight"
            style={{ color: palette.textPrimary }}
          >
            {poolLabel}
          </p>
          {joinable ? (
            <button
              type="button"
              onClick={handleJoin}
              className="min-w-[52px] shrink-0 rounded-[6px] px-3 py-1.5 text-[13px] font-bold leading-none text-white"
              style={{ backgroundColor: '#2e7d32' }}
            >
              {entryLabel}
            </button>
          ) : (
            <span className="text-sm font-bold" style={{ color: palette.textMuted }}>
              {contest.status === ContestStatus.FULL ? 'Full' : entryLabel}
            </span>
          )}
        </div>

        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold leading-none">
            <span style={{ color: palette.red }}>
              {left === 0 ? 'Full' : `${left.toLocaleString('en-IN')} Left`}
            </span>
            <span style={{ color: palette.textMuted }}>
              {contest.totalSpots.toLocaleString('en-IN')} spots
            </span>
          </div>
          <div
            className="h-[3px] w-full overflow-hidden rounded-full"
            style={{ backgroundColor: '#ececec' }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${fillPct}%`, backgroundColor: palette.red }}
            />
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 border-t px-3 py-2"
        style={{
          borderColor: palette.border,
          backgroundColor: palette.panel,
        }}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
          <span
            className="inline-flex items-center gap-1 font-semibold"
            style={{ color: palette.textPrimary }}
          >
            <Medal className="h-3.5 w-3.5 text-[#f4c430]" aria-hidden />
            {firstPrize}
          </span>
          <span className="inline-flex items-center gap-1" style={{ color: palette.textTertiary }}>
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            {winPct}%
          </span>
          <span
            className="inline-flex items-center gap-1 font-semibold"
            style={{ color: palette.textPrimary }}
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#c9a000] bg-[#fff8e1] text-[8px] font-bold text-[#5c4a00]">
              M
            </span>
            {contest.maxEntriesPerUser}
          </span>
          {joinedCount > 0 ? (
            <span className="font-semibold" style={{ color: palette.red }}>
              Joined {joinedCount}x
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold" style={{ color: palette.textPrimary }}>
          <TrendingUp className="h-3.5 w-3.5 text-[#757575]" aria-hidden />
          <span className="tabular-nums">{megaTotal}</span>
          <ChevronDown className="h-3 w-3 text-[#757575]" aria-hidden />
        </div>
      </div>
    </article>
  );
};

export const Dream11ContestCard = memo(Dream11ContestCardComponent);
Dream11ContestCard.displayName = 'Dream11ContestCard';

interface CreateTeamFabProps {
  disabled?: boolean;
  onClick: () => void;
  /** When true, bottom tab bar is hidden (immersive match flows). */
  immersive?: boolean;
}

export const CreateTeamFab = ({
  disabled,
  onClick,
  immersive = true,
}: CreateTeamFabProps): JSX.Element => (
  <div
    className={cn(
      'pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4',
      immersive
        ? 'bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]'
        : 'bottom-[calc(var(--w11-layout-tab-bar-height,4rem)+0.75rem)]',
    )}
  >
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] disabled:opacity-50 sm:px-6 sm:py-3 sm:text-xs"
      style={{ backgroundColor: '#1a2332' }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/35 text-sm leading-none sm:h-6 sm:w-6">
        +
      </span>
      Create Team
    </button>
  </div>
);
