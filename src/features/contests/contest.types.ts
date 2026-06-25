import type {
  ContestEntryStatus,
  ContestStatus,
  ContestType,
  ContestVisibility,
  MatchFormat,
  PrizeDistributionType,
  Sport,
} from '@shared/enums';

/**
 * Frontend mirror of backend `contest.types.ts`.
 *
 *  - Mongo `_id` arrives as `id`.
 *  - Money values are in **minor units** (paise / cents) unless the
 *    field name ends with `Major`. The contest formatter utils convert.
 *  - Dates are ISO-8601 strings.
 *
 * NEVER duplicate enums here — import from `@shared/enums`.
 */

// ─── Prize ───────────────────────────────────────────────────────────

export interface PrizeSlab {
  fromRank: number;
  toRank: number;
  prizeAmount: number;
  percentageBps: number;
  bonusLabel: string | null;
}

export interface PrizeDistribution {
  id: string;
  name: string;
  description: string | null;
  type: PrizeDistributionType;
  referencePoolAmount: number;
  currency: string;
  slabs: PrizeSlab[];
  maxWinningRank: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Templates ───────────────────────────────────────────────────────

export interface ContestTemplate {
  id: string;
  name: string;
  description: string | null;
  type: ContestType;
  visibility: ContestVisibility;
  sport: Sport | null;
  format: MatchFormat | null;
  entryFee: number;
  prizePoolAmount: number;
  currency: string;
  isGuaranteed: boolean;
  totalSpots: number;
  maxEntriesPerUser: number;
  prizeDistributionId: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Contests ────────────────────────────────────────────────────────

export interface ContestMatchSummary {
  id: string;
  sport: Sport;
  format: MatchFormat;
  scheduledAt: string;
  lineupLockedAt: string | null;
  status: string;
  homeTeam: { id: string; name: string; shortName: string; logoUrl: string | null } | null;
  awayTeam: { id: string; name: string; shortName: string; logoUrl: string | null } | null;
}

export interface ContestPrizeSnapshot {
  distributionId: string | null;
  name: string;
  type: PrizeDistributionType;
  poolAmount: number;
  maxWinningRank: number;
  slabs: PrizeSlab[];
}

export interface ContestSummary {
  id: string;
  matchId: string;
  sport: Sport;
  format: MatchFormat;
  name: string;
  description: string | null;
  type: ContestType;
  visibility: ContestVisibility;
  status: ContestStatus;
  isPractice: boolean;
  isGuaranteed: boolean;
  entryFee: number;
  prizePoolAmount: number;
  currency: string;
  topPrize: number;
  totalSpots: number;
  filledSpots: number;
  spotsLeft: number;
  fillPercentage: number;
  maxEntriesPerUser: number;
  joinOpensAt: string | null;
  joinClosesAt: string | null;
  publishedAt: string | null;
  hasInviteCode: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contest extends ContestSummary {
  cancelledAt: string | null;
  cancellationReason: string | null;
  prizeSnapshot: ContestPrizeSnapshot;
  templateId: string | null;
  clonedFromId: string | null;
  match: ContestMatchSummary | null;
  myActiveEntryCount: number | null;
}

// ─── Entries ─────────────────────────────────────────────────────────

export interface ContestEntryTeamSummary {
  id: string;
  name: string;
  accentColor: string | null;
  totalPoints: number;
}

export interface ContestEntry {
  id: string;
  contestId: string;
  userId: string;
  matchId: string;
  teamId: string;
  entryFee: number;
  currency: string;
  entryNumber: number;
  status: ContestEntryStatus;
  rank: number | null;
  winningAmount: number;
  walletTransactionId: string | null;
  refundTransactionId: string | null;
  refundedAt: string | null;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  team: ContestEntryTeamSummary | null;
  contest: ContestSummary | null;
}

// ─── Join flow ───────────────────────────────────────────────────────

export interface ContestJoinResult {
  entry: ContestEntry;
  contest: ContestSummary;
  wallet: {
    spendable: number;
    locked: number;
    currency: string;
  };
}
