import { baseApi } from '@store/api/base.api';
import { serialiseQuery } from '@utils/query';

import type {
  ContestResult,
  FantasyPoints,
  LeaderboardPage,
  LeaderboardSnapshot,
  RankHistoryEntry,
  ScoreEvent,
  UserRank,
} from './leaderboard.types';

/**
 * Leaderboard + scoring API surface.
 *
 *  Tag strategy:
 *    - `Leaderboard` per contest (`LIST:<contestId>`) so a settlement or
 *      rebuild invalidates exactly that page.
 *    - `UserRank` keyed by `<contestId>:<userId>` for the rank widget.
 *    - `RankHistory` keyed the same way for sparkline / movement.
 *    - `ContestResult` per contest for the post-match summary screen.
 *    - `FantasyPoints` per match for the breakdown drawer.
 */

interface LeaderboardArgs {
  contestId: string;
  page?: number;
  limit?: number;
}

interface UserRankArgs {
  contestId: string;
}

interface RankHistoryArgs {
  contestId: string;
  limit?: number;
}

interface FantasyPointsListResponse {
  matchId: string;
  players: FantasyPoints[];
}

interface PlayerFantasyPointsResponse {
  matchId: string;
  playerId: string;
  points: FantasyPoints | null;
}

interface RecomputeArgs {
  matchId: string;
  type?: string;
  reason?: string;
}

interface AdjustPlayerArgs {
  matchId: string;
  playerId: string;
  delta: number;
  reason: string;
}

interface RebuildArgs {
  contestId: string;
  reason?: string;
}

interface SettleArgs {
  contestId: string;
  force?: boolean;
}

export const leaderboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── USER ROUTES ──────────────────────────────────────────────────

    getContestLeaderboard: build.query<LeaderboardPage, LeaderboardArgs>({
      query: ({ contestId, page, limit }) => ({
        url: `/leaderboard/contests/${contestId}`,
        params: serialiseQuery({ page, limit }),
      }),
      providesTags: (_res, _err, arg) => [
        { type: 'Leaderboard', id: `LIST:${arg.contestId}` },
      ],
    }),

    getMyContestRank: build.query<{ rank: UserRank | null }, UserRankArgs>({
      query: ({ contestId }) => ({ url: `/leaderboard/contests/${contestId}/me` }),
      providesTags: (_res, _err, arg) => [{ type: 'UserRank', id: arg.contestId }],
    }),

    getMyRankHistory: build.query<{ history: RankHistoryEntry[] }, RankHistoryArgs>({
      query: ({ contestId, limit }) => ({
        url: `/leaderboard/contests/${contestId}/me/history`,
        params: serialiseQuery({ limit }),
      }),
      providesTags: (_res, _err, arg) => [{ type: 'RankHistory', id: arg.contestId }],
    }),

    getContestResult: build.query<
      { contestId: string; result: ContestResult | null },
      UserRankArgs
    >({
      query: ({ contestId }) => ({ url: `/leaderboard/contests/${contestId}/result` }),
      providesTags: (_res, _err, arg) => [{ type: 'ContestResult', id: arg.contestId }],
    }),

    getMyRecentRankHistory: build.query<
      { history: RankHistoryEntry[] },
      { limit?: number } | void
    >({
      query: (args) => ({
        url: `/leaderboard/me/history`,
        params: serialiseQuery((args ?? {}) as Record<string, unknown>),
      }),
      providesTags: [{ type: 'RankHistory', id: 'MINE' }],
    }),

    // ── SCORING ──────────────────────────────────────────────────────

    getMatchFantasyPoints: build.query<FantasyPointsListResponse, { matchId: string }>({
      query: ({ matchId }) => ({ url: `/scoring/matches/${matchId}/fantasy-points` }),
      providesTags: (_res, _err, arg) => [
        { type: 'FantasyPoints', id: `MATCH:${arg.matchId}` },
      ],
    }),

    getPlayerFantasyPoints: build.query<
      PlayerFantasyPointsResponse,
      { matchId: string; playerId: string }
    >({
      query: ({ matchId, playerId }) => ({
        url: `/scoring/matches/${matchId}/players/${playerId}/fantasy-points`,
      }),
      providesTags: (_res, _err, arg) => [
        { type: 'FantasyPoints', id: `PLAYER:${arg.matchId}:${arg.playerId}` },
      ],
    }),

    // ── ADMIN ────────────────────────────────────────────────────────

    adminRecomputeMatch: build.mutation<unknown, RecomputeArgs>({
      query: ({ matchId, ...body }) => ({
        url: `/scoring/admin/matches/${matchId}/recompute`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'FantasyPoints', id: `MATCH:${arg.matchId}` },
        { type: 'Leaderboard', id: 'LIST' },
      ],
    }),

    adminAdjustPlayerPoints: build.mutation<unknown, AdjustPlayerArgs>({
      query: ({ matchId, playerId, ...body }) => ({
        url: `/scoring/admin/matches/${matchId}/players/${playerId}/adjust`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'FantasyPoints', id: `MATCH:${arg.matchId}` },
        { type: 'FantasyPoints', id: `PLAYER:${arg.matchId}:${arg.playerId}` },
      ],
    }),

    adminListScoreEvents: build.query<
      { matchId: string; events: ScoreEvent[] },
      { matchId: string; limit?: number }
    >({
      query: ({ matchId, limit }) => ({
        url: `/scoring/admin/matches/${matchId}/events`,
        params: serialiseQuery({ limit }),
      }),
      providesTags: (_res, _err, arg) => [
        { type: 'ScoreEvent', id: `MATCH:${arg.matchId}` },
      ],
    }),

    adminGetScoringStatus: build.query<
      { matchId: string; canScore: boolean; reason: string | null; latestEvent: ScoreEvent | null },
      { matchId: string }
    >({
      query: ({ matchId }) => ({ url: `/scoring/admin/matches/${matchId}/status` }),
    }),

    adminRebuildLeaderboard: build.mutation<unknown, RebuildArgs>({
      query: ({ contestId, ...body }) => ({
        url: `/leaderboard/admin/contests/${contestId}/rebuild`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Leaderboard', id: `LIST:${arg.contestId}` },
        { type: 'UserRank', id: arg.contestId },
      ],
    }),

    adminListSnapshots: build.query<
      { snapshots: LeaderboardSnapshot[] },
      { contestId: string; limit?: number }
    >({
      query: ({ contestId, limit }) => ({
        url: `/leaderboard/admin/contests/${contestId}/snapshots`,
        params: serialiseQuery({ limit }),
      }),
    }),

    adminSettleContest: build.mutation<unknown, SettleArgs>({
      query: ({ contestId, ...body }) => ({
        url: `/leaderboard/admin/contests/${contestId}/settle`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'ContestResult', id: arg.contestId },
        { type: 'Leaderboard', id: `LIST:${arg.contestId}` },
        { type: 'Contest', id: arg.contestId },
        { type: 'Wallet' },
      ],
    }),

    adminResetSettlement: build.mutation<unknown, { contestId: string }>({
      query: ({ contestId }) => ({
        url: `/leaderboard/admin/contests/${contestId}/settle`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'ContestResult', id: arg.contestId }],
    }),

    adminGetSettlement: build.query<
      { contestId: string; result: ContestResult | null },
      { contestId: string }
    >({
      query: ({ contestId }) => ({ url: `/leaderboard/admin/contests/${contestId}/settlement` }),
      providesTags: (_res, _err, arg) => [{ type: 'ContestResult', id: arg.contestId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContestLeaderboardQuery,
  useGetMyContestRankQuery,
  useGetMyRankHistoryQuery,
  useGetContestResultQuery,
  useGetMyRecentRankHistoryQuery,
  useGetMatchFantasyPointsQuery,
  useGetPlayerFantasyPointsQuery,
  useAdminRecomputeMatchMutation,
  useAdminAdjustPlayerPointsMutation,
  useAdminListScoreEventsQuery,
  useAdminGetScoringStatusQuery,
  useAdminRebuildLeaderboardMutation,
  useAdminListSnapshotsQuery,
  useAdminSettleContestMutation,
  useAdminResetSettlementMutation,
  useAdminGetSettlementQuery,
} = leaderboardApi;
