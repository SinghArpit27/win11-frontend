import { baseApi } from '@store/api/base.api';
import { toPaginatedResponseNullable } from '@store/api/pagination.helpers';

import type { PaginationMeta } from '@shared/types/pagination.types';
import { serialiseQuery } from '@utils/query';

import type { ContestEntryStatus, ContestStatus, ContestType, ContestVisibility } from '@shared/enums';

import type {
  Contest,
  ContestEntry,
  ContestJoinResult,
  ContestSummary,
  ContestTemplate,
  PrizeDistribution,
} from './contest.types';

/**
 * Contest endpoints — public reads + authed join / my-entries.
 *
 *  Tag strategy:
 *    - `Contest` for list + detail; tag id is either `'LIST:<matchId>'`
 *      or the contest id so a single mutation invalidates exactly the
 *      caches that depend on it.
 *    - `ContestEntry` for "my entries" (LIST + per-id) and per-contest
 *      "my entries" panels (`MINE:<contestId>`).
 *    - `Wallet` invalidated on every join so the balance widget refreshes.
 */

interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta | null;
}

interface ListContestsArgs {
  matchId?: string;
  type?: ContestType;
  status?: ContestStatus;
  minEntryFee?: number;
  maxEntryFee?: number;
  hideFull?: boolean;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface JoinContestArgs {
  contestId: string;
  teamId: string;
  inviteCode?: string;
  idempotencyKey?: string;
}

interface MyEntriesArgs {
  contestId?: string;
  matchId?: string;
  status?: ContestEntryStatus;
  page?: number;
  limit?: number;
}

interface AdminCreateContestBody {
  matchId: string;
  templateId?: string | null;
  name: string;
  description?: string | null;
  type: ContestType;
  visibility?: ContestVisibility;
  entryFee: number;
  prizePoolAmount: number;
  currency: string;
  totalSpots: number;
  maxEntriesPerUser: number;
  isGuaranteed?: boolean;
  isPractice?: boolean;
  prizeDistributionId?: string | null;
  publishImmediately?: boolean;
}

interface AdminFromTemplateBody {
  templateId: string;
  matchIds: string[];
  publishImmediately?: boolean;
  skipExisting?: boolean;
}

interface AdminTemplateBody {
  name: string;
  description?: string | null;
  type: ContestType;
  visibility: ContestVisibility;
  entryFee: number;
  prizePoolAmount: number;
  currency: string;
  totalSpots: number;
  maxEntriesPerUser: number;
  isGuaranteed?: boolean;
  prizeDistributionId?: string | null;
  tags?: string[];
  isActive?: boolean;
}

interface ListTemplatesArgs {
  type?: ContestType;
  isActive?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

interface ListPrizeDistributionsArgs {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const contestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Public listings ────────────────────────────────────────────
    listContests: build.query<ListResponse<ContestSummary>, ListContestsArgs>({
      query: (args) => ({
        url: '/contests',
        params: serialiseQuery(args),
      }),
      transformResponse: (data: ContestSummary[], meta) =>
        toPaginatedResponseNullable(data, meta),
      providesTags: (res, _err, arg) =>
        res
          ? [
              { type: 'Contest' as const, id: `LIST:${arg.matchId ?? 'ALL'}` },
              ...res.items.map((c) => ({ type: 'Contest' as const, id: c.id })),
            ]
          : [{ type: 'Contest', id: `LIST:${arg.matchId ?? 'ALL'}` }],
    }),

    getContest: build.query<Contest, { contestId: string }>({
      query: ({ contestId }) => ({ url: `/contests/${contestId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Contest', id: arg.contestId }],
    }),

    lookupContestByCode: build.query<Contest, { code: string }>({
      query: ({ code }) => ({ url: '/contests/lookup', params: { code } }),
    }),

    // ── Join flow ──────────────────────────────────────────────────
    joinContest: build.mutation<ContestJoinResult, JoinContestArgs>({
      query: ({ contestId, ...body }) => ({
        url: `/contests/${contestId}/join`,
        method: 'POST',
        body,
        headers: body.idempotencyKey ? { 'Idempotency-Key': body.idempotencyKey } : undefined,
      }),
      invalidatesTags: (res, _err, arg) => {
        const tags: Array<{ type: 'Contest' | 'ContestEntry' | 'Wallet' | 'Leaderboard'; id?: string }> = [
          { type: 'Contest', id: arg.contestId },
          { type: 'ContestEntry', id: 'LIST' },
          { type: 'ContestEntry', id: `MINE:${arg.contestId}` },
          { type: 'Wallet' },
          { type: 'Leaderboard', id: arg.contestId },
          { type: 'Leaderboard', id: `RANK:${arg.contestId}` },
        ];
        if (res?.contest?.matchId) {
          tags.push({ type: 'Contest', id: `LIST:${res.contest.matchId}` });
        }
        return tags;
      },
    }),

    // ── My entries ─────────────────────────────────────────────────
    listMyContestEntries: build.query<ListResponse<ContestEntry>, MyEntriesArgs | void>({
      query: (args) => ({
        url: '/contests/entries',
        params: serialiseQuery(args ?? {}),
      }),
      transformResponse: (data: ContestEntry[], meta) =>
        toPaginatedResponseNullable(data, meta),
      providesTags: (res) =>
        res
          ? [
              { type: 'ContestEntry' as const, id: 'LIST' },
              ...res.items.map((e) => ({ type: 'ContestEntry' as const, id: e.id })),
            ]
          : [{ type: 'ContestEntry', id: 'LIST' }],
    }),

    getMyContestEntry: build.query<ContestEntry, { entryId: string }>({
      query: ({ entryId }) => ({ url: `/contests/entries/${entryId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'ContestEntry', id: arg.entryId }],
    }),

    listMyEntriesForContest: build.query<ContestEntry[], { contestId: string }>({
      query: ({ contestId }) => ({ url: `/contests/${contestId}/my-entries` }),
      providesTags: (_res, _err, arg) => [
        { type: 'ContestEntry', id: `MINE:${arg.contestId}` },
      ],
    }),

    // ── Admin listings ─────────────────────────────────────────────
    adminListContests: build.query<ListResponse<ContestSummary>, ListContestsArgs>({
      query: (args) => ({
        url: '/contests/admin/contests',
        params: serialiseQuery(args),
      }),
      transformResponse: (data: ContestSummary[], meta) =>
        toPaginatedResponseNullable(data, meta),
      providesTags: (res) =>
        res
          ? [
              { type: 'Contest' as const, id: 'ADMIN:LIST' },
              ...res.items.map((c) => ({ type: 'Contest' as const, id: c.id })),
            ]
          : [{ type: 'Contest', id: 'ADMIN:LIST' }],
    }),

    adminGetContest: build.query<Contest, { contestId: string }>({
      query: ({ contestId }) => ({ url: `/contests/admin/contests/${contestId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Contest', id: arg.contestId }],
    }),

    adminCreateContest: build.mutation<Contest, AdminCreateContestBody>({
      query: (body) => ({
        url: '/contests/admin/contests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Contest', id: 'ADMIN:LIST' }, { type: 'Contest', id: 'LIST' }],
    }),

    adminCreateContestsFromTemplate: build.mutation<
      { items: ContestSummary[]; skippedMatchIds: string[] },
      AdminFromTemplateBody
    >({
      query: (body) => ({
        url: '/contests/admin/contests/from-template',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Contest', id: 'ADMIN:LIST' }, { type: 'Contest', id: 'LIST' }],
    }),

    adminTransitionContestStatus: build.mutation<
      ContestSummary,
      { contestId: string; status: ContestStatus }
    >({
      query: ({ contestId, status }) => ({
        url: `/contests/admin/contests/${contestId}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Contest', id: 'ADMIN:LIST' },
        { type: 'Contest', id: arg.contestId },
      ],
    }),

    adminListTemplates: build.query<ListResponse<ContestTemplate>, ListTemplatesArgs | void>({
      query: (args) => ({
        url: '/contests/admin/templates',
        params: serialiseQuery(args ?? {}),
      }),
      transformResponse: (data: ContestTemplate[], meta) =>
        toPaginatedResponseNullable(data, meta),
      providesTags: (res) =>
        res
          ? [
              { type: 'ContestTemplate' as const, id: 'ADMIN:LIST' },
              ...res.items.map((t) => ({ type: 'ContestTemplate' as const, id: t.id })),
            ]
          : [{ type: 'ContestTemplate', id: 'ADMIN:LIST' }],
    }),

    adminCreateTemplate: build.mutation<ContestTemplate, AdminTemplateBody>({
      query: (body) => ({
        url: '/contests/admin/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ContestTemplate', id: 'ADMIN:LIST' }],
    }),

    adminUpdateTemplate: build.mutation<
      ContestTemplate,
      { templateId: string; body: Partial<AdminTemplateBody> }
    >({
      query: ({ templateId, body }) => ({
        url: `/contests/admin/templates/${templateId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'ContestTemplate', id: 'ADMIN:LIST' },
        { type: 'ContestTemplate', id: arg.templateId },
      ],
    }),

    adminDeleteTemplate: build.mutation<void, { templateId: string }>({
      query: ({ templateId }) => ({
        url: `/contests/admin/templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ContestTemplate', id: 'ADMIN:LIST' }],
    }),

    adminListPrizeDistributions: build.query<
      ListResponse<PrizeDistribution>,
      ListPrizeDistributionsArgs | void
    >({
      query: (args) => ({
        url: '/contests/admin/prize-distributions',
        params: serialiseQuery(args ?? {}),
      }),
      transformResponse: (data: PrizeDistribution[], meta) =>
        toPaginatedResponseNullable(data, meta),
      providesTags: [{ type: 'ContestTemplate', id: 'PRIZES' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListContestsQuery,
  useGetContestQuery,
  useLookupContestByCodeQuery,
  useJoinContestMutation,
  useListMyContestEntriesQuery,
  useGetMyContestEntryQuery,
  useListMyEntriesForContestQuery,
  useAdminListContestsQuery,
  useAdminGetContestQuery,
  useAdminCreateContestMutation,
  useAdminCreateContestsFromTemplateMutation,
  useAdminTransitionContestStatusMutation,
  useAdminListTemplatesQuery,
  useAdminCreateTemplateMutation,
  useAdminUpdateTemplateMutation,
  useAdminDeleteTemplateMutation,
  useAdminListPrizeDistributionsQuery,
} = contestApi;
