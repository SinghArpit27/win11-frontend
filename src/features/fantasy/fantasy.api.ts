import { baseApi } from '@store/api/base.api';
import { toPaginatedResponseNullable } from '@store/api/pagination.helpers';

import type { PaginationMeta } from '@shared/types/pagination.types';

import type {
  FantasyDraft,
  FantasyDraftSelection,
  FantasyMatchContext,
  FantasyTeam,
  FantasyValidationResult,
} from './fantasy.types';

/**
 * Fantasy endpoints — authed reads + writes.
 *
 *  Tag strategy:
 *    - `FantasyMatchContext` keyed by matchId — invalidated when teams
 *      change so selection percentages refresh.
 *    - `FantasyTeam` keyed by matchId + teamId.
 *    - `FantasyDraft` keyed by matchId.
 */

interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta | null;
}

interface FantasyTeamPlayerInput {
  playerId: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

interface CreateFantasyTeamArgs {
  matchId: string;
  name?: string;
  accentColor?: string | null;
  players: FantasyTeamPlayerInput[];
}

interface UpdateFantasyTeamArgs {
  teamId: string;
  matchId: string;
  name?: string;
  accentColor?: string | null;
  players?: FantasyTeamPlayerInput[];
}

interface CloneFantasyTeamArgs {
  teamId: string;
  matchId: string;
  name?: string;
}

interface PreviewFantasyTeamArgs {
  matchId: string;
  players: FantasyTeamPlayerInput[];
}

interface UpsertDraftArgs {
  matchId: string;
  clientDraftId?: string | null;
  name?: string;
  players: FantasyDraftSelection[];
}

export const fantasyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Match context (rules + players + selections) ──────────────────
    getFantasyMatchContext: build.query<FantasyMatchContext, { matchId: string }>({
      query: ({ matchId }) => ({ url: `/fantasy/matches/${matchId}/context` }),
      providesTags: (_res, _err, arg) => [
        { type: 'FantasyMatchContext', id: arg.matchId },
      ],
    }),

    getFantasyMatchRules: build.query<
      { rule: FantasyMatchContext['rule']; scoringRule: FantasyMatchContext['scoringRule'] },
      { matchId: string }
    >({
      query: ({ matchId }) => ({ url: `/fantasy/matches/${matchId}/rules` }),
      providesTags: (_res, _err, arg) => [
        { type: 'FantasyRule', id: arg.matchId },
      ],
    }),

    // ── Teams (auth) ──────────────────────────────────────────────────
    listMyFantasyTeams: build.query<
      ListResponse<FantasyTeam>,
      { matchId?: string; page?: number; limit?: number } | void
    >({
      query: (args) => ({ url: '/fantasy/teams', params: args ?? {} }),
      transformResponse: (data: FantasyTeam[], meta) =>
        toPaginatedResponseNullable(data, meta),
      providesTags: (res) =>
        res
          ? [
              { type: 'FantasyTeam' as const, id: 'LIST' },
              ...res.items.map((t) => ({ type: 'FantasyTeam' as const, id: t.id })),
            ]
          : [{ type: 'FantasyTeam', id: 'LIST' }],
    }),

    getMyFantasyTeam: build.query<FantasyTeam, { teamId: string }>({
      query: ({ teamId }) => ({ url: `/fantasy/teams/${teamId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'FantasyTeam', id: arg.teamId }],
    }),

    previewFantasyTeam: build.mutation<FantasyValidationResult, PreviewFantasyTeamArgs>({
      query: (body) => ({ url: '/fantasy/teams/preview', method: 'POST', body }),
    }),

    createFantasyTeam: build.mutation<FantasyTeam, CreateFantasyTeamArgs>({
      query: (body) => ({ url: '/fantasy/teams', method: 'POST', body }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'FantasyTeam', id: 'LIST' },
        { type: 'FantasyMatchContext', id: arg.matchId },
      ],
    }),

    updateFantasyTeam: build.mutation<FantasyTeam, UpdateFantasyTeamArgs>({
      query: ({ teamId, ...body }) => ({
        url: `/fantasy/teams/${teamId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'FantasyTeam', id: 'LIST' },
        { type: 'FantasyTeam', id: arg.teamId },
        { type: 'FantasyMatchContext', id: arg.matchId },
      ],
    }),

    cloneFantasyTeam: build.mutation<FantasyTeam, CloneFantasyTeamArgs>({
      query: ({ teamId, name }) => ({
        url: `/fantasy/teams/${teamId}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'FantasyTeam', id: 'LIST' },
        { type: 'FantasyMatchContext', id: arg.matchId },
      ],
    }),

    deleteFantasyTeam: build.mutation<void, { teamId: string; matchId: string }>({
      query: ({ teamId }) => ({ url: `/fantasy/teams/${teamId}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'FantasyTeam', id: 'LIST' },
        { type: 'FantasyTeam', id: arg.teamId },
        { type: 'FantasyMatchContext', id: arg.matchId },
      ],
    }),

    // ── Drafts ─────────────────────────────────────────────────────────
    listMyFantasyDrafts: build.query<FantasyDraft[], { matchId: string }>({
      query: ({ matchId }) => ({ url: '/fantasy/drafts', params: { matchId } }),
      providesTags: (_res, _err, arg) => [{ type: 'FantasyDraft', id: arg.matchId }],
    }),

    upsertFantasyDraft: build.mutation<FantasyDraft, UpsertDraftArgs>({
      query: (body) => ({ url: '/fantasy/drafts', method: 'PUT', body }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'FantasyDraft', id: arg.matchId }],
    }),

    deleteFantasyDraft: build.mutation<void, { draftId: string; matchId: string }>({
      query: ({ draftId }) => ({ url: `/fantasy/drafts/${draftId}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'FantasyDraft', id: arg.matchId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFantasyMatchContextQuery,
  useGetFantasyMatchRulesQuery,
  useListMyFantasyTeamsQuery,
  useGetMyFantasyTeamQuery,
  usePreviewFantasyTeamMutation,
  useCreateFantasyTeamMutation,
  useUpdateFantasyTeamMutation,
  useCloneFantasyTeamMutation,
  useDeleteFantasyTeamMutation,
  useListMyFantasyDraftsQuery,
  useUpsertFantasyDraftMutation,
  useDeleteFantasyDraftMutation,
} = fantasyApi;
