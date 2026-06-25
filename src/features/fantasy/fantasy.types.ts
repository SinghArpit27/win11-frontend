import type {
  FantasyScoringCategory,
  FantasyTeamStatus,
  FantasyValidationIssueCode,
  FantasyValidationSeverity,
  MatchFormat,
  PlayerRole,
  Sport,
} from '@shared/enums';

/**
 * Frontend mirror of backend `fantasy.types.ts`.
 * Mongo `_id` arrives as `id`; dates as ISO-8601 strings.
 *
 * NEVER duplicate enums here — import from `@shared/enums` so the
 * backend stays the source of truth.
 */

// ─── Rules ────────────────────────────────────────────────────────────

export interface FantasyRoleConstraint {
  role: PlayerRole;
  min: number;
  max: number;
}

export interface FantasyRule {
  id: string;
  sport: Sport;
  format: MatchFormat;
  name: string;
  description: string | null;
  isActive: boolean;
  teamSize: number;
  creditBudget: number;
  minPerPlayerCredits: number;
  maxPerPlayerCredits: number;
  minFromSingleTeam: number;
  maxFromSingleTeam: number;
  roleConstraints: FantasyRoleConstraint[];
  captainMultiplier: number;
  viceCaptainMultiplier: number;
  maxTeamsPerUserPerMatch: number;
  warnAtTeamsPerUserPerMatch: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Scoring rules ────────────────────────────────────────────────────

export interface FantasyScoringEvent {
  code: string;
  category: FantasyScoringCategory;
  label: string;
  statKey: string;
  points: number;
  threshold: number | null;
  unit: number | null;
  appliesTo: PlayerRole[];
  sortOrder: number;
}

export interface FantasyScoringRule {
  id: string;
  sport: Sport;
  format: MatchFormat;
  name: string;
  description: string | null;
  isActive: boolean;
  version: number;
  events: FantasyScoringEvent[];
  createdAt: string;
  updatedAt: string;
}

// ─── Teams ────────────────────────────────────────────────────────────

export interface FantasyTeamPlayer {
  playerId: string;
  player: {
    id: string;
    name: string;
    shortName: string | null;
    photoUrl: string | null;
  } | null;
  teamId: string;
  team: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    primaryColor: string | null;
  } | null;
  role: PlayerRole;
  credits: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  pointsEarned: number;
}

export interface FantasyTeamPointsBreakdown {
  batting: number;
  bowling: number;
  fielding: number;
  bonus: number;
  penalty: number;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  matchId: string;
  sport: Sport;
  format: MatchFormat;
  ruleId: string;
  ruleVersion: number;
  name: string;
  accentColor: string | null;
  status: FantasyTeamStatus;
  lockedAt: string | null;
  players: FantasyTeamPlayer[];
  totalCreditsUsed: number;
  captainPlayerId: string;
  viceCaptainPlayerId: string;
  roleBreakdown: Record<string, number>;
  teamBreakdown: Record<string, number>;
  totalPoints: number;
  pointsBreakdown: FantasyTeamPointsBreakdown;
  pointsLastComputedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Drafts ───────────────────────────────────────────────────────────

export interface FantasyDraftPlayer {
  playerId: string;
  role: PlayerRole;
  teamId: string | null;
  credits: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface FantasyDraft {
  id: string;
  userId: string;
  matchId: string;
  sport: Sport;
  format: MatchFormat;
  clientDraftId: string | null;
  ruleId: string | null;
  ruleVersion: number | null;
  name: string;
  players: FantasyDraftPlayer[];
  totalCreditsUsed: number;
  captainPlayerId: string | null;
  viceCaptainPlayerId: string | null;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Validation ───────────────────────────────────────────────────────

export interface FantasyValidationIssue {
  code: FantasyValidationIssueCode;
  severity: FantasyValidationSeverity;
  message: string;
  context?: Record<string, string | number | string[] | undefined>;
}

export interface FantasyValidationSummary {
  playersSelected: number;
  creditsUsed: number;
  creditsRemaining: number;
  roleBreakdown: Record<string, number>;
  teamBreakdown: Record<string, number>;
  hasCaptain: boolean;
  hasViceCaptain: boolean;
}

export interface FantasyValidationResult {
  isValid: boolean;
  issues: FantasyValidationIssue[];
  summary: FantasyValidationSummary;
}

// ─── Match-context bundle ─────────────────────────────────────────────

export interface FantasyMatchPlayer {
  id: string;
  name: string;
  shortName: string | null;
  photoUrl: string | null;
  role: PlayerRole;
  country: string | null;
  team: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    primaryColor: string | null;
  } | null;
  credits: number;
  selectionPercent: number | null;
  isInLineup: boolean | null;
}

/**
 * Compact match metadata embedded into the fantasy context so the
 * create-team header can render scheduled time, status, and live score
 * without an extra round trip.
 */
export interface FantasyMatchSummary {
  id: string;
  status: string;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  resultSummary: string | null;
  venue: { name: string | null; city: string | null; country: string | null } | null;
  tournament: { id: string; name: string; shortName: string } | null;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    primaryColor: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    primaryColor: string | null;
  };
  scores: Array<{
    teamId: string;
    score: number;
    secondary: number | null;
    overs: string | null;
  }>;
}

export interface FantasyMatchContext {
  matchId: string;
  sport: Sport;
  format: MatchFormat;
  lineupLockedAt: string | null;
  isLocked: boolean;
  match: FantasyMatchSummary | null;
  rule: FantasyRule | null;
  scoringRule: FantasyScoringRule | null;
  players: FantasyMatchPlayer[];
}

// ─── In-flight draft client-side ──────────────────────────────────────

/**
 * Client-side draft state — what the UI tracks locally between
 * `useFantasyDraft` and the create-team API. Differs from the
 * persisted `FantasyDraft` in that we only need playerId + flags.
 */
export interface FantasyDraftSelection {
  playerId: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
}
