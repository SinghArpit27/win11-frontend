import { CircleCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PageContainer } from '@components/layout';
import { QueryErrorState } from '@components/common/QueryErrorState';
import { Skeleton } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useGetMatchDetailQuery } from '@features/sports/sports.api';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { ContestStatus } from '@shared/enums';
import { buildRoute } from '@utils/routes.util';

import {
  ContestDetailGloryBar,
  ContestDetailLeaderboardPanel,
  ContestDetailTabs,
  ContestDetailWinningsPanel,
  MatchFixtureBar,
  type ContestDetailTabId,
} from '../components';
import {
  useGetContestQuery,
  useListMyContestEntriesQuery,
  useListMyEntriesForContestQuery,
} from '../contest.api';
import { canJoinContest } from '../contest.utils';

/**
 * Come-style contest detail — summary, JOIN, Glory bar, Winnings / Leaderboard tabs.
 */
const ContestDetailScreen = (): JSX.Element => {
  const { matchId = '', contestId = '' } = useParams<{
    matchId: string;
    contestId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const palette = useDream11Palette();

  const initialTab = (searchParams.get('tab') as ContestDetailTabId | null) ?? 'winnings';
  const [activeTab, setActiveTab] = useState<ContestDetailTabId>(
    initialTab === 'leaderboard' ? 'leaderboard' : 'winnings',
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'leaderboard' || tab === 'winnings') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const matchQuery = useGetMatchDetailQuery({ matchId }, { skip: !matchId });
  const detailQuery = useGetContestQuery({ contestId }, { skip: !contestId });
  const myEntriesQuery = useListMyEntriesForContestQuery(
    { contestId },
    { skip: !contestId },
  );
  const matchEntriesQuery = useListMyContestEntriesQuery(
    { matchId },
    { skip: !matchId },
  );

  const contest = detailQuery.data;
  const match = matchQuery.data;

  const joinedCount = useMemo(() => {
    const fromEntries = myEntriesQuery.data?.length ?? 0;
    const fromContest = contest?.myActiveEntryCount ?? 0;
    const fromMatch =
      matchEntriesQuery.data?.items.filter((e) => e.contestId === contestId).length ?? 0;
    return Math.max(fromEntries, fromContest, fromMatch);
  }, [
    myEntriesQuery.data,
    contest?.myActiveEntryCount,
    matchEntriesQuery.data,
    contestId,
  ]);

  const hasJoined = joinedCount > 0;
  const entriesLoading = myEntriesQuery.isLoading || matchEntriesQuery.isLoading;

  const canJoin = useMemo(() => {
    if (!contest || entriesLoading) return false;
    if (hasJoined) return false;
    return (
      canJoinContest(contest) &&
      contest.status !== ContestStatus.FULL &&
      contest.spotsLeft > 0
    );
  }, [contest, hasJoined, entriesLoading]);

  const joinLabel = useMemo(() => {
    if (!contest) return 'JOIN';
    if (hasJoined) return 'JOINED';
    if (contest.status === ContestStatus.FULL || contest.spotsLeft === 0) return 'FULL';
    return 'JOIN';
  }, [contest, hasJoined]);

  const handleBack = useCallback(() => {
    navigate(buildRoute(ROUTES.MATCH_CONTESTS, { matchId }));
  }, [matchId, navigate]);

  const handleTabChange = useCallback(
    (tab: ContestDetailTabId) => {
      setActiveTab(tab);
      const next = new URLSearchParams(searchParams);
      if (tab === 'winnings') next.delete('tab');
      else next.set('tab', tab);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleJoin = useCallback(() => {
    if (!canJoin || !contest) return;
    navigate(buildRoute(ROUTES.CONTEST_JOIN, { matchId, contestId: contest.id }));
  }, [canJoin, contest, matchId, navigate]);

  if (detailQuery.isError) {
    return (
      <QueryErrorState
        error={detailQuery.error}
        title="Unable to load contest"
        onRetry={() => detailQuery.refetch()}
        className="mx-3 mt-3"
      />
    );
  }

  if (detailQuery.isLoading || matchQuery.isLoading || !contest || !match) {
    return (
      <PageContainer padded={false} width="wide" className="mx-0 max-w-none !px-0">
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="h-44 w-full rounded-none" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mx-4 mt-4 h-48 w-[calc(100%-2rem)] rounded-xl" />
      </PageContainer>
    );
  }

  const left = Math.max(0, contest.totalSpots - contest.filledSpots);
  const fillPct = Math.min(100, Math.max(0, Math.round(contest.fillPercentage)));
  const isFull = contest.status === ContestStatus.FULL || left === 0;

  return (
    <PageContainer
      as="main"
      padded={false}
      width="wide"
      className="mx-0 min-h-full w-full max-w-none !px-0 pb-10"
      style={{ backgroundColor: palette.greyBg }}
    >
      <MatchFixtureBar match={match} onBack={handleBack} />

      <section className="bg-white px-3 pb-4 pt-3">
        {contest.isGuaranteed ? (
          <div
            className="mb-1 flex items-center gap-1 text-[11px] font-semibold leading-none"
            style={{ color: '#2e7d32' }}
          >
            <CircleCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Guaranteed
          </div>
        ) : null}

        <h1 className="text-[20px] font-extrabold leading-tight" style={{ color: '#1a237e' }}>
          {contest.name}
        </h1>

        <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
          {isFull ? (
            <span style={{ color: palette.red }}>Full</span>
          ) : (
            <span style={{ color: palette.red }}>{left} Left</span>
          )}
          <span style={{ color: palette.textMuted }}>
            {contest.totalSpots.toLocaleString('en-IN')} spots
          </span>
        </div>

        <div
          className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: '#ececec' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${fillPct}%`, backgroundColor: palette.red }}
          />
        </div>

        <button
          type="button"
          disabled={!canJoin}
          onClick={handleJoin}
          className="mt-4 w-full rounded-[6px] py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-90"
          style={{
            backgroundColor: canJoin ? '#1a2332' : '#bdbdbd',
          }}
          aria-disabled={!canJoin}
        >
          {joinLabel}
        </button>
      </section>

      <ContestDetailGloryBar />
      <ContestDetailTabs active={activeTab} onChange={handleTabChange} />

      <div className="bg-white">
        {activeTab === 'winnings' ? (
          <ContestDetailWinningsPanel contest={contest} />
        ) : (
          <ContestDetailLeaderboardPanel contestId={contest.id} />
        )}
      </div>
    </PageContainer>
  );
};

export { ContestDetailScreen };
export default ContestDetailScreen;
