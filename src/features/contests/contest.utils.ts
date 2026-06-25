import { ContestStatus, ContestType } from '@shared/enums';

import { formatMoney } from '@features/wallet/wallet.utils';

import type { ContestMatchSummary, ContestSummary } from './contest.types';

/**
 * Pure presentation helpers for the contest feature. Centralised so every
 * card, badge, and breakdown renders the same numbers + tone classes.
 */

/** Compact INR display — `₹1,00,000` becomes `₹1 Lakh+`. */
export const formatPrizeCompact = (minor: number, currency = 'INR'): string => {
  const major = Math.floor(minor / 100);
  if (currency !== 'INR') return formatMoney(minor, { currency });
  if (major >= 1_00_00_000) return `₹${(major / 1_00_00_000).toFixed(2)} Cr`;
  if (major >= 1_00_000) return `₹${(major / 1_00_000).toFixed(2)} Lakhs`;
  if (major >= 1_000) return `₹${(major / 1_000).toFixed(1)}K`;
  return `₹${major.toLocaleString('en-IN')}`;
};

export const isContestJoinable = (status: ContestStatus): boolean =>
  status === ContestStatus.OPEN || status === ContestStatus.SCHEDULED;

type JoinWindowContest = ContestSummary & { match?: ContestMatchSummary | null };

/** Match-aware join close — mirrors backend `resolveJoinClosesAt`. */
export const resolveJoinClosesAt = (contest: JoinWindowContest): string | null => {
  const matchClose = contest.match?.lineupLockedAt ?? contest.match?.scheduledAt ?? null;
  const contestClose = contest.joinClosesAt ?? null;
  if (matchClose && contestClose) {
    return new Date(matchClose) > new Date(contestClose) ? matchClose : contestClose;
  }
  return matchClose ?? contestClose;
};

/** True when the contest join window is still open (status + timing). */
export const isJoinWindowOpen = (contest: JoinWindowContest, now = new Date()): boolean => {
  if (contest.joinOpensAt && new Date(contest.joinOpensAt) > now) return false;
  const closesAt = resolveJoinClosesAt(contest);
  if (closesAt && new Date(closesAt) <= now) return false;
  return true;
};

export const canJoinContest = (contest: JoinWindowContest): boolean =>
  isContestJoinable(contest.status) && isJoinWindowOpen(contest);

export const isContestClosed = (status: ContestStatus): boolean =>
  status === ContestStatus.LOCKED ||
  status === ContestStatus.LIVE ||
  status === ContestStatus.COMPLETED ||
  status === ContestStatus.CANCELLED;

/** Compute the absolute prize amount for a slab given a pool. */
export const slabPrize = (slab: PrizeSlab, poolMinor: number): number => {
  if (slab.percentageBps > 0) {
    return Math.floor((poolMinor * slab.percentageBps) / 10_000);
  }
  return slab.prizeAmount;
};

/** Build a human label for a slab — `Rank 1`, `Rank 2-5`, etc. */
export const slabRankLabel = (slab: PrizeSlab): string => {
  if (slab.fromRank === slab.toRank) return `Rank ${slab.fromRank}`;
  return `Rank ${slab.fromRank} - ${slab.toRank}`;
};

/** Status → human label + tone class for badges + chips. */
export type ContestTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export const STATUS_META: Record<ContestStatus, { label: string; tone: ContestTone }> = {
  [ContestStatus.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [ContestStatus.SCHEDULED]: { label: 'Scheduled', tone: 'primary' },
  [ContestStatus.OPEN]: { label: 'Open', tone: 'success' },
  [ContestStatus.FULL]: { label: 'Full', tone: 'warning' },
  [ContestStatus.LOCKED]: { label: 'Locked', tone: 'neutral' },
  [ContestStatus.LIVE]: { label: 'Live', tone: 'danger' },
  [ContestStatus.COMPLETED]: { label: 'Completed', tone: 'neutral' },
  [ContestStatus.CANCELLED]: { label: 'Cancelled', tone: 'danger' },
};

export const TYPE_META: Record<ContestType, { label: string; accent: string }> = {
  [ContestType.MEGA]: { label: 'Mega', accent: 'text-warning' },
  [ContestType.GUARANTEED]: { label: 'Guaranteed', accent: 'text-success' },
  [ContestType.HEAD_TO_HEAD]: { label: 'H2H', accent: 'text-primary' },
  [ContestType.PRACTICE]: { label: 'Practice', accent: 'text-text-muted' },
  [ContestType.PRIVATE]: { label: 'Private', accent: 'text-text-muted' },
  [ContestType.REGULAR]: { label: 'Contest', accent: 'text-text' },
};

/** True when the contest has no entry fee. */
export const isFreeContest = (contest: ContestSummary): boolean =>
  contest.isPractice || contest.entryFee === 0;
