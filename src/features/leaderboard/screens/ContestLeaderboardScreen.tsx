import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useSocketRoom } from '@hooks/index';
import { cn } from '@utils/cn';

import { useGetContestQuery } from '@features/contests/contest.api';
import { formatPrizeCompact } from '@features/contests/contest.utils';

import { LeaderboardScope, SocketNamespace } from '@shared/enums';

import {
  useGetContestLeaderboardQuery,
  useGetContestResultQuery,
  useGetMyContestRankQuery,
  useGetMyRankHistoryQuery,
} from '../leaderboard.api';
import {
  LeaderboardRow as LeaderboardRowComponent,
  PrizeProjection,
  UserRankCard,
} from '../components';

/**
 * Contest leaderboard — live ranks, score updates, winning projections.
 *
 *  Polling: every 15s while the contest is live; switches to static
 *  result mode once a `ContestResult` exists for the contest.
 *
 *  Layout:
 *    ┌──────────────────────────────────────┐
 *    │ ← Back · Contest Name · Refresh      │
 *    │ Prize Pool · Spots · Status          │
 *    │ ────────────────────────────────────  │
 *    │ Your Rank Card (sticky)              │
 *    │ Projected Winning (live only)        │
 *    │ ────────────────────────────────────  │
 *    │ Top 100 leaderboard rows             │
 *    │ Load more →                          │
 *    └──────────────────────────────────────┘
 */
const ContestLeaderboardScreen = (): JSX.Element => {
  const { matchId = '', contestId = '' } = useParams<{
    matchId: string;
    contestId: string;
  }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const contestQuery = useGetContestQuery({ contestId }, { skip: !contestId });
  const contest = contestQuery.data;
  const isLive = contest?.status === 'LIVE' || contest?.status === 'LOCKED';

  useSocketRoom(
    SocketNamespace.LEADERBOARDS,
    contestId ? `contest:${contestId}` : null,
  );

  const pollMs = isLive ? 60_000 : 0;

  const leaderboardQuery = useGetContestLeaderboardQuery(
    { contestId, page, limit: pageSize },
    {
      skip: !contestId,
      pollingInterval: pollMs,
    },
  );

  const myRankQuery = useGetMyContestRankQuery(
    { contestId },
    { skip: !contestId, pollingInterval: pollMs },
  );

  const myHistoryQuery = useGetMyRankHistoryQuery(
    { contestId, limit: 1 },
    { skip: !contestId, pollingInterval: pollMs },
  );

  const resultQuery = useGetContestResultQuery(
    { contestId },
    { skip: !contestId },
  );

  const handleBack = useCallback(() => {
    if (contest && matchId) {
      navigate(
        ROUTES.CONTEST_DETAIL.replace(':matchId', matchId).replace(
          ':contestId',
          contestId,
        ),
      );
      return;
    }
    navigate(-1);
  }, [contest, contestId, matchId, navigate]);

  const handleLoadMore = useCallback(() => setPage((p) => p + 1), []);

  const myRank = myRankQuery.data?.rank ?? null;
  const latestMovement = myHistoryQuery.data?.history?.[0] ?? null;
  const result = resultQuery.data?.result ?? null;

  const projectedAmount = useMemo<number | null>(() => {
    if (result && myRank?.rank) {
      const winner = result.topEntries.find((w) => w.rank === myRank.rank);
      return winner?.winningAmount ?? 0;
    }
    return null;
  }, [result, myRank?.rank]);

  const renderHeader = (): JSX.Element => (
    <div className="sticky top-0 z-20 -mx-3 mb-2 border-b border-border bg-bg px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 w-8 p-0"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <Typography
            variant="body"
            className="truncate text-sm font-bold leading-tight text-text"
          >
            {contest?.name ?? 'Leaderboard'}
          </Typography>
          <Typography variant="caption" tone="muted" className="text-[11px]">
            {contest
              ? `${formatPrizeCompact(contest.prizePoolAmount, contest.currency)} · ${contest.filledSpots.toLocaleString('en-IN')}/${contest.totalSpots.toLocaleString('en-IN')} joined`
              : '—'}
          </Typography>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            leaderboardQuery.refetch();
            myRankQuery.refetch();
          }}
          disabled={leaderboardQuery.isFetching}
          className="h-8 w-8 p-0"
          aria-label="Refresh"
        >
          <RefreshCw
            className={cn('h-4 w-4', leaderboardQuery.isFetching && 'animate-spin')}
          />
        </Button>
      </div>
    </div>
  );

  if (leaderboardQuery.isLoading || contestQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3 pb-20">
        {renderHeader()}
        <Skeleton className="h-20 w-full rounded-lg" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const page$ = leaderboardQuery.data;

  if (!page$ || page$.rows.length === 0) {
    return (
      <div className="flex flex-col gap-3 pb-20">
        {renderHeader()}
        <Card padding="md" className="text-center">
          <Typography variant="body" tone="muted">
            No entries yet. The leaderboard will populate as scores update.
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-20">
      {renderHeader()}

      <UserRankCard
        rank={myRank}
        latestHistory={latestMovement}
        winningAmount={projectedAmount}
        currency={contest?.currency}
      />

      {isLive && projectedAmount !== null && projectedAmount > 0 && contest && (
        <PrizeProjection
          projectedAmount={projectedAmount}
          currentRank={myRank?.rank ?? null}
          contestPool={contest.prizePoolAmount}
          currency={contest.currency}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <Typography
            variant="caption"
            tone="muted"
            className="text-[10px] font-semibold uppercase tracking-wider"
          >
            Rank · Player · Score
          </Typography>
          <Typography variant="caption" tone="muted" className="text-[10px]">
            Page {page$.page} of {page$.totalPages || 1}
          </Typography>
        </div>

        {page$.rows.map((row) => (
          <LeaderboardRowComponent
            key={row.entryId}
            row={row}
            currency={contest?.currency ?? 'INR'}
          />
        ))}

        {page$.hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={leaderboardQuery.isFetching}
            className="mt-2 w-full"
          >
            {leaderboardQuery.isFetching ? 'Loading…' : 'Load more'}
          </Button>
        )}
      </div>

      {/* Sentinel so the leaderboard scope binding stays correct */}
      <span hidden data-scope={LeaderboardScope.CONTEST} data-scope-id={contestId} />
    </div>
  );
};

export default ContestLeaderboardScreen;
