import { Trophy } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, Skeleton, Typography } from '@components/ui';
import { QueryErrorState } from '@components/common/QueryErrorState';
import { ROUTES } from '@constants/routes.constants';
import { buildRoute } from '@utils/routes.util';

import { useGetMatchDetailQuery } from '@features/sports/sports.api';

import { ContestType } from '@shared/enums';

import {
  ContestCard,
  ContestFilters,
  type ContestFiltersValue,
  ContestTabs,
  type ContestTabId,
} from '../components';
import {
  useListContestsQuery,
  useListMyContestEntriesQuery,
} from '../contest.api';
import type { ContestSummary } from '../contest.types';

/**
 * Contest list for a specific match — surfaced from the match-detail
 * "Contests" tab and from a deep link `/matches/:matchId/contests`.
 *
 *  Layout responsibilities:
 *   - Sticky type-tabs.
 *   - Sticky filter row (search · sort · hide-full).
 *   - Single-column on mobile; 2-col grid on lg+; 3-col on 2xl.
 *
 *  Data:
 *   - One contest-list query per (matchId, type filter).
 *   - One my-entries query per matchId — used to render "Joined Nx".
 *   - Tag-based invalidation refreshes everything after `joinContest`.
 */
const DEFAULT_FILTERS: ContestFiltersValue = {
  query: '',
  hideFull: false,
  sort: 'prize',
};

const ContestListScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const matchQuery = useGetMatchDetailQuery({ matchId }, { skip: !matchId });
  const [activeTab, setActiveTab] = useState<ContestTabId>('all');
  const [filters, setFilters] = useState<ContestFiltersValue>(DEFAULT_FILTERS);

  const contestsQuery = useListContestsQuery({
    matchId,
    type: activeTab === 'all' ? undefined : activeTab,
    hideFull: filters.hideFull,
    q: filters.query.trim() || undefined,
    limit: 50,
    page: 1,
  });

  const entriesQuery = useListMyContestEntriesQuery(
    { matchId, limit: 100 },
    { skip: !matchId },
  );

  /** Quick lookup `{ contestId → joinedCount }`. */
  const entryCounts = useMemo<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const e of entriesQuery.data?.items ?? []) {
      out[e.contestId] = (out[e.contestId] ?? 0) + 1;
    }
    return out;
  }, [entriesQuery.data]);

  /** Tab badges — derived from the **all** result so counts stay stable. */
  const tabCounts = useMemo<Partial<Record<ContestTabId, number>>>(() => {
    if (!contestsQuery.data || activeTab !== 'all') return {};
    const out: Partial<Record<ContestTabId, number>> = { all: contestsQuery.data.items.length };
    for (const c of contestsQuery.data.items) {
      out[c.type] = (out[c.type] ?? 0) + 1;
    }
    return out;
  }, [contestsQuery.data, activeTab]);

  const sortedItems = useMemo<ContestSummary[]>(() => {
    const items = [...(contestsQuery.data?.items ?? [])];
    items.sort((a, b) => {
      switch (filters.sort) {
        case 'entry-asc':
          return a.entryFee - b.entryFee;
        case 'entry-desc':
          return b.entryFee - a.entryFee;
        case 'spots':
          return b.spotsLeft - a.spotsLeft;
        case 'prize':
        default:
          return b.prizePoolAmount - a.prizePoolAmount;
      }
    });
    return items;
  }, [contestsQuery.data, filters.sort]);

  const handleOpenContest = useCallback(
    (contest: ContestSummary) => {
      navigate(buildRoute(ROUTES.CONTEST_DETAIL, { matchId, contestId: contest.id }));
    },
    [matchId, navigate],
  );

  const handleJoin = useCallback(
    (contest: ContestSummary) => {
      navigate(buildRoute(ROUTES.CONTEST_JOIN, { matchId, contestId: contest.id }));
    },
    [matchId, navigate],
  );

  const loading = contestsQuery.isLoading || matchQuery.isLoading;
  const hasError = contestsQuery.isError || matchQuery.isError;

  return (
    <div className="flex flex-col gap-3 px-3 pb-24 pt-3 sm:px-4 lg:px-6">
      {/* Sticky tabs */}
      <div className="sticky top-0 z-20 -mx-3 bg-bg/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6">
        <ContestTabs active={activeTab} onChange={setActiveTab} counts={tabCounts} />
      </div>

      <ContestFilters value={filters} onChange={setFilters} />

      {hasError ? (
        <QueryErrorState
          error={contestsQuery.error ?? matchQuery.error}
          title="Unable to load contests"
          onRetry={() => {
            void contestsQuery.refetch();
            void matchQuery.refetch();
          }}
        />
      ) : loading ? (
        <ListSkeleton />
      ) : sortedItems.length === 0 ? (
        <EmptyState type={activeTab === 'all' ? null : activeTab} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {sortedItems.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              joinedCount={entryCounts[contest.id] ?? 0}
              onClick={handleOpenContest}
              onJoinClick={handleJoin}
            />
          ))}
        </div>
      )}

    </div>
  );
};

// ─── Pieces ────────────────────────────────────────────────────────────

const ListSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-48 w-full rounded-2xl" />
    ))}
  </div>
);

const EmptyState = ({ type }: { type: ContestType | null }): JSX.Element => (
  <Card padding="xl" className="border-dashed text-center">
    <Trophy className="mx-auto h-8 w-8 text-text-muted" />
    <Typography variant="h3" className="mt-3 block">
      {type ? `No ${type.replace('_', ' ').toLowerCase()} contests yet` : 'No contests yet'}
    </Typography>
    <Typography variant="caption" tone="muted" className="mt-1 block">
      New contests open closer to match time. Pull to refresh or try a different tab.
    </Typography>
  </Card>
);

export { ContestListScreen };
export default ContestListScreen;
