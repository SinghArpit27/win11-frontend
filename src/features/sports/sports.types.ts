import type {
  MatchFormat,
  MatchStatus,
  PlayerRole,
  Sport,
  TournamentStatus,
} from '@shared/enums';

/**
 * Mirror of the backend `sports.types.ts` DTO shapes.
 *
 * IDs are plain strings on the wire (Mongo `_id` projected as `id` by
 * `createBaseSchema`). Every Date field arrives as an ISO-8601 string —
 * the UI parses on demand to keep the store immutable + serializable.
 *
 * NEVER duplicate domain enums here — import from `@shared/enums` so the
 * backend remains the source of truth.
 */

export interface SportsTournament {
  id: string;
  sport: Sport;
  name: string;
  shortName: string;
  season: string | null;
  country: string | null;
  status: TournamentStatus;
  startDate: string | null;
  endDate: string | null;
  logoUrl: string | null;
  accentColor: string | null;
}

export interface SportsTeam {
  id: string;
  sport: Sport;
  name: string;
  shortName: string;
  country: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface SportsPlayer {
  id: string;
  sport: Sport;
  name: string;
  shortName: string | null;
  role: PlayerRole;
  position: string | null;
  teamId: string | null;
  country: string | null;
  battingStyle: string | null;
  bowlingStyle: string | null;
  jerseyNumber: number | null;
  dateOfBirth: string | null;
  photoUrl: string | null;
  isActive: boolean;
  /** Default fantasy credit value — PHASE 5. */
  baseCredits: number;
}

export interface SportsMatchTeamScore {
  teamId: string;
  score: number;
  secondary: number | null;
  overs: string | null;
}

export interface SportsMatchVenue {
  name: string | null;
  city: string | null;
  country: string | null;
}

export interface SportsMatchSummary {
  id: string;
  sport: Sport;
  format: MatchFormat;
  status: MatchStatus;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  isFeatured: boolean;
  isLive: boolean;
  tournament: Pick<SportsTournament, 'id' | 'name' | 'shortName' | 'season' | 'logoUrl' | 'accentColor'>;
  homeTeam: Pick<SportsTeam, 'id' | 'name' | 'shortName' | 'logoUrl' | 'primaryColor'>;
  awayTeam: Pick<SportsTeam, 'id' | 'name' | 'shortName' | 'logoUrl' | 'primaryColor'>;
  scores: SportsMatchTeamScore[];
  resultSummary: string | null;
  venue: SportsMatchVenue;
  /** Lineups-lock timestamp; UI uses it for the "Lineups Out" pill. */
  lineupLockedAt: string | null;
  lastUpdateAt: string | null;
}

export interface SportsMatchDetail extends SportsMatchSummary {
  winnerTeamId: string | null;
  tossWinnerTeamId: string | null;
  tossDecision: 'BAT' | 'BOWL' | null;
  popularityScore: number;
  viewCount: number;
}

export interface SportsMatchUpdate {
  id: string;
  matchId: string;
  type: string;
  sequence: number;
  providerKey: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface SportsPlayerStats {
  id: string;
  matchId: string;
  playerId: string;
  sport: Sport;
  teamId: string | null;
  isInLineup: boolean;
  isPlayed: boolean;
  isPlayerOfMatch: boolean;
  stats: Record<string, number | string | boolean | null>;
  fantasyPoints: number;
}

// ─── Query argument shapes ────────────────────────────────────────────────

export interface MatchListArgs {
  page?: number;
  limit?: number;
  sport?: Sport;
  status?: MatchStatus;
  format?: MatchFormat;
  tournamentId?: string;
  teamId?: string;
  featured?: boolean;
  q?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MatchFeedArgs {
  sport?: Sport;
  limit?: number;
}

export interface TournamentListArgs {
  page?: number;
  limit?: number;
  sport?: Sport;
  status?: TournamentStatus;
  q?: string;
}

export interface TeamListArgs {
  page?: number;
  limit?: number;
  sport?: Sport;
  q?: string;
}

export interface PlayerListArgs {
  page?: number;
  limit?: number;
  sport?: Sport;
  role?: PlayerRole;
  teamId?: string;
  q?: string;
}
