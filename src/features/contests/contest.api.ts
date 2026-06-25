import { baseApi } from '@store/api/base.api';
import { toPaginatedResponseNullable } from '@store/api/pagination.helpers';

import type { PaginationMeta } from '@shared/types/pagination.types';
import { serialiseQuery } from '@utils/query';

import type { ContestEntryStatus, ContestStatus, ContestType } from '@shared/enums';

import type {
  Contest,
  ContestEntry,
  ContestJoinResult,
  ContestSummary,
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
} = contestApi;
