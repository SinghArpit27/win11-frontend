import type {
  ContestSettlementStatus,
  LeaderboardScope,
  LeaderboardSnapshotReason,
  PlayerRole,
  RankMovement,
  ScoreEventStatus,
  ScoreEventType,
} from '@shared/enums';

/**
 * Frontend mirror of backend `leaderboard.types.ts` / `scoring.types.ts`.
 *
 * All numeric `points` / `score` values are float-quantised to 2 decimals
 * by the backend, so the client can render them as-is.
 *
 * NEVER duplicate enums — import from `@shared/enums`.
 */

// ─── Leaderboard rows ────────────────────────────────────────────────

export interface LeaderboardRow {
  rank: number;
  entryId: string;
  userId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  fantasyTeamId: string | null;
  fantasyTeamName: string | null;
  points: number;
  winningAmount: number | null;
  movement: RankMovement;
  previousRank: number | null;
  isSelf: boolean;
}

export interface LeaderboardMeta {
  scope: LeaderboardScope;
  scopeId: string;
  matchId: string | null;
  totalEntries: number;
  topScore: number;
  lastSnapshotAt: string | null;
}

export interface LeaderboardPage {
  meta: LeaderboardMeta;
  rows: LeaderboardRow[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// ─── User rank ───────────────────────────────────────────────────────

export interface UserRank {
  scope: LeaderboardScope;
  scopeId: string;
  userId: string;
  rank: number | null;
  points: number;
  totalEntries: number;
  bestEntryId: string | null;
}

// ─── Rank history ────────────────────────────────────────────────────

export interface RankHistoryPoint {
  rank: number;
  points: number;
  movement: RankMovement;
  rankDelta: number;
  pointsDelta: number;
  capturedAt: string;
}

export interface RankHistoryEntry {
  scope: LeaderboardScope;
  scopeId: string;
  entryId: string;
  userId: string;
  matchId: string;
  rank: number;
  points: number;
  previousRank: number | null;
  movement: RankMovement;
  rankDelta: number;
  pointsDelta: number;
  capturedAt: string;
}

// ─── Snapshots ───────────────────────────────────────────────────────

export interface LeaderboardSnapshot {
  id: string;
  scope: LeaderboardScope;
  scopeId: string;
  matchId: string;
  reason: LeaderboardSnapshotReason;
  totalEntries: number;
  topScore: number;
  topEntries: Array<{
    rank: number;
    entryId: string;
    userId: string;
    fantasyTeamId: string | null;
    points: number;
  }>;
  capturedAt: string;
}

// ─── Contest result ──────────────────────────────────────────────────

export interface ContestResultWinner {
  rank: number;
  entryId: string;
  userId: string;
  fantasyTeamId: string | null;
  points: number;
  winningAmount: number;
}

export interface ContestResult {
  id: string;
  contestId: string;
  matchId: string;
  status: ContestSettlementStatus;
  poolAmount: number;
  totalPaidOut: number;
  commissionAmount: number;
  currency: string;
  totalEntries: number;
  totalWinners: number;
  topScore: number;
  topEntries: ContestResultWinner[];
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
}

// ─── Fantasy points (player breakdown) ───────────────────────────────

export interface FantasyPointBreakdownItem {
  code: string;
  category: string;
  label: string;
  points: number;
  rawValue: number;
  multiplier: number;
}

export interface FantasyPointBreakdown {
  batting: number;
  bowling: number;
  fielding: number;
  bonus: number;
  penalty: number;
  total: number;
  items: FantasyPointBreakdownItem[];
}

export interface FantasyPoints {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string | null;
  role: PlayerRole;
  basePoints: number;
  breakdown: FantasyPointBreakdown;
  isPlayed: boolean;
  isPlayerOfMatch: boolean;
  computedAt: string;
}

// ─── Score events (admin) ────────────────────────────────────────────

export interface ScoreEvent {
  id: string;
  matchId: string;
  playerId: string | null;
  type: ScoreEventType;
  status: ScoreEventStatus;
  inputRowsCount: number;
  teamsUpdatedCount: number;
  playersUpdatedCount: number;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  errorCode: string | null;
}
