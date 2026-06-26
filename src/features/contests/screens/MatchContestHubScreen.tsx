import { Trophy } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PageContainer } from '@components/layout';
import { QueryErrorState } from '@components/common/QueryErrorState';
import { Skeleton } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useListMyFantasyTeamsQuery } from '@features/fantasy/fantasy.api';
import { useGetMatchDetailQuery } from '@features/sports/sports.api';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import type { Dream11Palette } from '@features/sports/dream11.tokens';
import { ContestType } from '@shared/enums';
import { buildContestConfirmJoinRoute, buildCreateTeamRoute, buildRoute } from '@utils/routes.util';

import {
  Dream11ContestCard,
  Dream11ContestFilterChips,
  Dream11ContestFilterModal,
  JoinConfirmModal,
  MatchHubCreateTeamFab,
  MatchHubMyMatchesPanel,
  MatchHubTeamsPanel,
  MatchFixtureBar,
  MatchHubTabs,
  type MatchHubTabId,
  MatchWinPoll,
} from '../components';
import type { ContestFiltersValue } from '../components/ContestFilters';
import {
  applyDream11AdvancedFilters,
  countAdvancedFilters,
  EMPTY_ADVANCED_FILTERS,
  type Dream11AdvancedFilters,
} from '../dream11.contest-filters';
import {
  useGetContestQuery,
  useListContestsQuery,
  useListMyContestEntriesQuery,
} from '../contest.api';
import type { ContestSummary } from '../contest.types';
import { CONTEST_SECTION_LABEL, CONTEST_SECTION_ORDER } from '../contest.utils';

const DEFAULT_FILTERS: ContestFiltersValue = {
  query: '',
  hideFull: false,
  sort: 'prize',
};

/**
 * Dream11 match lobby — same AppTopBar as Home, fixture bar, poll, tabs, contests.
 */
const MatchContestHubScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const palette = useDream11Palette();

  const confirmContestId = searchParams.get('confirmJoin');
  const confirmTeamId = searchParams.get('teamId');

  const confirmContestQuery = useGetContestQuery(
    { contestId: confirmContestId ?? '' },
    { skip: !confirmContestId },
  );

  const clearConfirmParams = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('confirmJoin');
    next.delete('teamId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const confirmModalOpen = Boolean(
    confirmContestId && confirmTeamId && confirmContestQuery.data,
  );

  const [hubTab, setHubTab] = useState<MatchHubTabId>('contests');
  const [filters, setFilters] = useState<ContestFiltersValue>(DEFAULT_FILTERS);
  const [advancedFilters, setAdvancedFilters] =
    useState<Dream11AdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const matchQuery = useGetMatchDetailQuery({ matchId }, { skip: !matchId });
  const teamsQuery = useListMyFantasyTeamsQuery({ matchId, limit: 50 }, { skip: !matchId });
  const contestsQuery = useListContestsQuery({
    matchId,
    hideFull: filters.hideFull,
    q: filters.query.trim() || undefined,
    limit: 50,
    page: 1,
  });
  const entriesQuery = useListMyContestEntriesQuery({ matchId, limit: 100 }, { skip: !matchId });

  const entries = entriesQuery.data?.items ?? [];
  const teams = teamsQuery.data?.items ?? [];
  const myMatchesCount = useMemo(() => {
    const ids = new Set(entries.map((e) => e.contestId));
    return ids.size;
  }, [entries]);

  const entryCounts = useMemo<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const e of entries) {
      out[e.contestId] = (out[e.contestId] ?? 0) + 1;
    }
    return out;
  }, [entries]);

  const sortedItems = useMemo<ContestSummary[]>(() => {
    let items = [...(contestsQuery.data?.items ?? [])];
    if (filters.hideFull) {
      items = items.filter((c) => c.spotsLeft > 0);
    }
    items = applyDream11AdvancedFilters(items, advancedFilters);
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
  }, [contestsQuery.data, filters.sort, filters.hideFull, advancedFilters]);

  const groupedContests = useMemo(() => {
    const map = new Map<ContestType, ContestSummary[]>();
    for (const contest of sortedItems) {
      const bucket = map.get(contest.type) ?? [];
      bucket.push(contest);
      map.set(contest.type, bucket);
    }
    return CONTEST_SECTION_ORDER.filter((type) => (map.get(type)?.length ?? 0) > 0).map(
      (type) => ({
        type,
        label: CONTEST_SECTION_LABEL[type],
        items: map.get(type) ?? [],
      }),
    );
  }, [sortedItems]);

  const handleOpenContest = useCallback(
    (contest: ContestSummary) => {
      navigate(buildRoute(ROUTES.CONTEST_DETAIL, { matchId, contestId: contest.id }));
    },
    [matchId, navigate],
  );

  const handleJoin = useCallback(
    (contest: ContestSummary) => {
      const teams = teamsQuery.data?.items ?? [];
      const joinedForContest = new Set(
        (entriesQuery.data?.items ?? [])
          .filter((e) => e.contestId === contest.id)
          .map((e) => e.teamId),
      );
      const remaining = contest.maxEntriesPerUser - (entryCounts[contest.id] ?? 0);
      const selectable = teams.filter(
        (t) => !joinedForContest.has(t.id) && remaining > 0,
      );

      if (selectable.length === 0) {
        navigate(buildCreateTeamRoute(matchId, { contestId: contest.id }));
        return;
      }
      if (selectable.length === 1) {
        navigate(buildContestConfirmJoinRoute(matchId, contest.id, selectable[0]!.id));
        return;
      }
      navigate(buildRoute(ROUTES.CONTEST_JOIN, { matchId, contestId: contest.id }));
    },
    [matchId, navigate, teamsQuery.data, entriesQuery.data, entryCounts],
  );

  const handleHubTab = useCallback((tab: MatchHubTabId) => {
    setHubTab(tab);
  }, []);

  const handleCreateTeam = useCallback(() => {
    navigate(buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId }));
  }, [matchId, navigate]);

  const match = matchQuery.data;
  const loading = matchQuery.isLoading || contestsQuery.isLoading;
  const hasError = matchQuery.isError || contestsQuery.isError;

  if (loading && !match) {
    return (
      <PageContainer padded={false} width="wide" className="mx-0 max-w-none !px-0">
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="mx-2 mt-2 h-24 rounded-xl" />
        <Skeleton className="mx-2 mt-2 h-10 w-full" />
        <div className="flex flex-col gap-2 p-2 pt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (hasError || !match) {
    return (
      <PageContainer padded className="gap-4">
        <QueryErrorState
          error={matchQuery.error ?? contestsQuery.error}
          title="Unable to load match"
          onRetry={() => {
            void matchQuery.refetch();
            void contestsQuery.refetch();
          }}
        />
      </PageContainer>
    );
  }

  const showPlaceholder = hubTab === 'gurus' || hubTab === 'stats';
  const hubBg =
    hubTab === 'teams' ? '#ffffff' : palette.greyBg;

  return (
    <PageContainer
      as="main"
      padded={false}
      width="wide"
      className="mx-0 min-h-full w-full max-w-none !px-0 pb-28"
      style={{ backgroundColor: hubBg }}
    >
      <MatchFixtureBar match={match} />
      <MatchWinPoll match={match} />
      <MatchHubTabs
        active={hubTab}
        onChange={handleHubTab}
        myMatchesCount={myMatchesCount}
        teamsCount={teams.length}
      />

      {hubTab === 'contests' ? (
        <>
          <Dream11ContestFilterChips
            activeSort={filters.sort}
            defaultSort="prize"
            onSortChange={(sort) => setFilters((f) => ({ ...f, sort }))}
            onClearSort={() => setFilters((f) => ({ ...f, sort: 'prize' }))}
            onFilterClick={() => setFilterModalOpen(true)}
            contestCount={sortedItems.length}
            advancedFilterCount={countAdvancedFilters(advancedFilters)}
            onClearAdvanced={() => setAdvancedFilters(EMPTY_ADVANCED_FILTERS)}
          />

          <Dream11ContestFilterModal
            open={filterModalOpen}
            value={advancedFilters}
            onOpenChange={setFilterModalOpen}
            onApply={setAdvancedFilters}
          />

          {sortedItems.length === 0 ? (
            <HubEmptyState palette={palette} />
          ) : (
            <div className="flex flex-col gap-3 px-2 pb-4 pt-1">
              {groupedContests.map((section) => (
                <section key={section.type}>
                  <h2
                    className="mb-1.5 px-0.5 text-[13px] font-bold leading-none"
                    style={{ color: palette.textPrimary }}
                  >
                    {section.label}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {section.items.map((contest) => (
                      <Dream11ContestCard
                        key={contest.id}
                        contest={contest}
                        joinedCount={entryCounts[contest.id] ?? 0}
                        onClick={handleOpenContest}
                        onJoinClick={handleJoin}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      ) : hubTab === 'my-contests' ? (
        <MatchHubMyMatchesPanel matchId={matchId} entries={entries} teams={teams} />
      ) : hubTab === 'teams' ? (
        <MatchHubTeamsPanel
          matchId={matchId}
          teams={teams}
          matchLocked={Boolean(match.completedAt)}
        />
      ) : showPlaceholder ? (
        <div
          className="mx-2 mt-2 rounded-xl border px-4 py-10 text-center"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.card,
            color: palette.textMuted,
          }}
        >
          <p className="text-sm font-semibold capitalize" style={{ color: palette.textPrimary }}>
            {hubTab.replace('-', ' ')}
          </p>
          <p className="mt-1 text-xs">Coming soon for this match.</p>
        </div>
      ) : null}

      {hubTab === 'teams' ? (
        <MatchHubCreateTeamFab
          disabled={Boolean(match.completedAt)}
          onClick={handleCreateTeam}
        />
      ) : null}

      <JoinConfirmModal
        open={confirmModalOpen}
        contest={confirmContestQuery.data ?? null}
        teamId={confirmTeamId}
        onOpenChange={(open) => {
          if (!open) clearConfirmParams();
        }}
        onSuccess={() => {
          clearConfirmParams();
          setHubTab('my-contests');
        }}
      />
    </PageContainer>
  );
};

const HubEmptyState = ({ palette }: { palette: Dream11Palette }): JSX.Element => (
  <div
    className="mx-2 mt-1 rounded-[10px] border px-4 py-14 text-center"
    style={{
      borderColor: palette.border,
      backgroundColor: palette.card,
    }}
  >
    <Trophy
      className="mx-auto h-9 w-9"
      strokeWidth={1.25}
      style={{ color: palette.textTertiary }}
    />
    <p className="mt-3 text-[13px] font-bold" style={{ color: palette.textPrimary }}>
      No contests yet
    </p>
  </div>
);

export default MatchContestHubScreen;
