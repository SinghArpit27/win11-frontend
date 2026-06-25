import { baseApi } from '@store/api/base.api';
import { toPaginatedResponse } from '@store/api/pagination.helpers';

import type { PaginationMeta } from '@shared/types/pagination.types';

import type {
  MatchFeedArgs,
  MatchListArgs,
  PlayerListArgs,
  SportsMatchDetail,
  SportsMatchSummary,
  SportsMatchUpdate,
  SportsPlayer,
  SportsPlayerStats,
  SportsTeam,
  SportsTournament,
  TeamListArgs,
  TournamentListArgs,
} from './sports.types';

/**
 * Sports endpoints — public reads.
 *
 *  Injected into the shared `baseApi` so they ride the existing
 *  request-id headers, refresh-token interceptor, and tag invalidation
 *  pipeline alongside auth, wallet, and admin APIs.
 *
 *  Tag strategy:
 *    - Lists: `provide` the `'Match' | 'Player' | 'Team' | 'Tournament'`
 *      tag. Mutations that change a single entity should `invalidate`
 *      the matching `{ type, id }` so detail caches refetch.
 *
 *  Polling note:
 *    - Live match endpoints should be polled via `pollingInterval` at
 *      the component level — keep that decision out of the API layer.
 */

interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export const sportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Matches ────────────────────────────────────────────────────────
    listMatches: build.query<ListResponse<SportsMatchSummary>, MatchListArgs | void>({
      query: (args) => ({ url: '/sports/matches', params: args ?? {} }),
      transformResponse: (data: SportsMatchSummary[], meta) => toPaginatedResponse(data, meta),
      providesTags: (res) =>
        res
          ? [
              { type: 'Match', id: 'LIST' },
              ...res.items.map((m) => ({ type: 'Match' as const, id: m.id })),
            ]
          : [{ type: 'Match', id: 'LIST' }],
    }),

    listLiveMatches: build.query<SportsMatchSummary[], MatchFeedArgs | void>({
      query: (args) => ({ url: '/sports/matches/live', params: args ?? {} }),
      providesTags: [{ type: 'Match', id: 'LIVE' }],
    }),

    listUpcomingMatches: build.query<SportsMatchSummary[], MatchFeedArgs | void>({
      query: (args) => ({ url: '/sports/matches/upcoming', params: args ?? {} }),
      providesTags: [{ type: 'Match', id: 'UPCOMING' }],
    }),

    listFeaturedMatches: build.query<SportsMatchSummary[], MatchFeedArgs | void>({
      query: (args) => ({ url: '/sports/matches/featured', params: args ?? {} }),
      providesTags: [{ type: 'Match', id: 'FEATURED' }],
    }),

    listTrendingMatches: build.query<SportsMatchSummary[], MatchFeedArgs | void>({
      query: (args) => ({ url: '/sports/matches/trending', params: args ?? {} }),
      providesTags: [{ type: 'Match', id: 'TRENDING' }],
    }),

    getMatchDetail: build.query<SportsMatchDetail, { matchId: string }>({
      query: ({ matchId }) => ({ url: `/sports/matches/${matchId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: arg.matchId }],
    }),

    getMatchUpdates: build.query<
      SportsMatchUpdate[],
      { matchId: string; sinceSequence?: number; limit?: number }
    >({
      query: ({ matchId, sinceSequence, limit }) => ({
        url: `/sports/matches/${matchId}/updates`,
        params: { sinceSequence, limit },
      }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `${arg.matchId}:updates` }],
    }),

    getMatchPlayers: build.query<SportsPlayerStats[], { matchId: string }>({
      query: ({ matchId }) => ({ url: `/sports/matches/${matchId}/players` }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `${arg.matchId}:players` }],
    }),

    // ── Tournaments ───────────────────────────────────────────────────
    listTournaments: build.query<ListResponse<SportsTournament>, TournamentListArgs | void>({
      query: (args) => ({ url: '/sports/tournaments', params: args ?? {} }),
      transformResponse: (data: SportsTournament[], meta) => toPaginatedResponse(data, meta),
      providesTags: [{ type: 'Match', id: 'TOURNAMENTS' }],
    }),

    getTournament: build.query<SportsTournament, { tournamentId: string }>({
      query: ({ tournamentId }) => ({ url: `/sports/tournaments/${tournamentId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `tour:${arg.tournamentId}` }],
    }),

    // ── Teams ─────────────────────────────────────────────────────────
    listTeams: build.query<ListResponse<SportsTeam>, TeamListArgs | void>({
      query: (args) => ({ url: '/sports/teams', params: args ?? {} }),
      transformResponse: (data: SportsTeam[], meta) => toPaginatedResponse(data, meta),
      providesTags: [{ type: 'Match', id: 'TEAMS' }],
    }),

    getTeam: build.query<SportsTeam, { teamId: string }>({
      query: ({ teamId }) => ({ url: `/sports/teams/${teamId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `team:${arg.teamId}` }],
    }),

    getTeamRoster: build.query<SportsPlayer[], { teamId: string }>({
      query: ({ teamId }) => ({ url: `/sports/teams/${teamId}/roster` }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `team-roster:${arg.teamId}` }],
    }),

    // ── Players ───────────────────────────────────────────────────────
    listPlayers: build.query<ListResponse<SportsPlayer>, PlayerListArgs | void>({
      query: (args) => ({ url: '/sports/players', params: args ?? {} }),
      transformResponse: (data: SportsPlayer[], meta) => toPaginatedResponse(data, meta),
      providesTags: [{ type: 'Match', id: 'PLAYERS' }],
    }),

    getPlayer: build.query<SportsPlayer, { playerId: string }>({
      query: ({ playerId }) => ({ url: `/sports/players/${playerId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `player:${arg.playerId}` }],
    }),

    getPlayerStats: build.query<
      ListResponse<SportsPlayerStats>,
      { playerId: string; page?: number; limit?: number }
    >({
      query: ({ playerId, page, limit }) => ({
        url: `/sports/players/${playerId}/stats`,
        params: { page, limit },
      }),
      transformResponse: (data: SportsPlayerStats[], meta) => toPaginatedResponse(data, meta),
      providesTags: (_res, _err, arg) => [{ type: 'Match', id: `player-stats:${arg.playerId}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListMatchesQuery,
  useListLiveMatchesQuery,
  useListUpcomingMatchesQuery,
  useListFeaturedMatchesQuery,
  useListTrendingMatchesQuery,
  useGetMatchDetailQuery,
  useGetMatchUpdatesQuery,
  useGetMatchPlayersQuery,
  useListTournamentsQuery,
  useGetTournamentQuery,
  useListTeamsQuery,
  useGetTeamQuery,
  useGetTeamRosterQuery,
  useListPlayersQuery,
  useGetPlayerQuery,
  useGetPlayerStatsQuery,
} = sportsApi;
