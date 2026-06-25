import { ArrowLeft, CheckCircle2, ChevronRight, Clock, Lock, ShieldCheck, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { QueryErrorState } from '@components/common/QueryErrorState';
import { ROUTES } from '@constants/routes.constants';
import { buildRoute } from '@utils/routes.util';
import { cn } from '@utils/cn';

import { formatRelative } from '@features/wallet/wallet.utils';

import { ContestStatus } from '@shared/enums';

import { PrizeBreakdown, SpotsLeftBar } from '../components';
import {
  useGetContestQuery,
  useListMyEntriesForContestQuery,
} from '../contest.api';
import {
  STATUS_META,
  TYPE_META,
  formatPrizeCompact,
  canJoinContest,
  isFreeContest,
  isJoinWindowOpen,
} from '../contest.utils';
import { formatMoney } from '@features/wallet/wallet.utils';

/**
 * Contest detail screen.
 *
 *   Hero: prize-pool + countdown + sticky join CTA.
 *   Body: spots bar, key stats grid, prize breakdown, rules.
 *
 *  Pulls a single contest by id (cached + tagged) and the user's existing
 *  entries for that contest so we can render "You joined 2 / 5 teams"
 *  without an extra round-trip.
 */
const ContestDetailScreen = (): JSX.Element => {
  const { matchId = '', contestId = '' } = useParams<{
    matchId: string;
    contestId: string;
  }>();
  const navigate = useNavigate();

  const detailQuery = useGetContestQuery(
    { contestId },
    { skip: !contestId },
  );
  const myEntriesQuery = useListMyEntriesForContestQuery(
    { contestId },
    { skip: !contestId },
  );

  const contest = detailQuery.data;
  const joinedCount = myEntriesQuery.data?.length ?? 0;
  const canJoin =
    !!contest &&
    canJoinContest(contest) &&
    joinedCount < contest.maxEntriesPerUser;
  const reachedMax = !!contest && joinedCount >= contest.maxEntriesPerUser;

  const ctaLabel = useMemo(() => {
    if (!contest) return 'Join';
    if (contest.status === ContestStatus.FULL) return 'Contest Full';
    if (contest.status === ContestStatus.LOCKED) return 'Locked';
    if (contest.status === ContestStatus.CANCELLED) return 'Cancelled';
    if (!isJoinWindowOpen(contest)) return 'Joining closed';
    if (reachedMax) return 'Max teams joined';
    if (isFreeContest(contest)) return 'Join FREE';
    return `Join · ${formatMoney(contest.entryFee, { currency: contest.currency })}`;
  }, [contest, reachedMax]);

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

  if (detailQuery.isLoading || !contest) {
    return <DetailSkeleton />;
  }

  const status = STATUS_META[contest.status];
  const type = TYPE_META[contest.type];

  return (
    <div className="relative flex flex-col gap-3 pb-28">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-fantasy-header px-4 pb-5 pt-3 text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="rounded-full p-2 text-white/90 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Badge
            tone={status.tone}
            className="text-[10px] uppercase tracking-wider"
          >
            {status.label}
          </Badge>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <Typography
            variant="caption"
            className={cn('text-[10px] font-bold uppercase tracking-wider', 'text-white/70')}
          >
            {type.label}
          </Typography>
          <Typography variant="h2" className="text-xl font-extrabold leading-tight">
            {contest.name}
          </Typography>
          {contest.match && (
            <Typography variant="caption" className="text-white/70">
              {contest.match.homeTeam?.shortName} vs {contest.match.awayTeam?.shortName} ·{' '}
              {formatRelative(contest.match.scheduledAt)}
            </Typography>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat
            label="Prize Pool"
            value={formatPrizeCompact(contest.prizePoolAmount, contest.currency)}
          />
          <Stat
            label="Entry"
            value={
              isFreeContest(contest)
                ? 'FREE'
                : formatMoney(contest.entryFee, { currency: contest.currency })
            }
          />
        </div>

        <div className="mt-4">
          <SpotsLeftBar
            filled={contest.filledSpots}
            total={contest.totalSpots}
            fillPercentage={contest.fillPercentage}
          />
        </div>
      </header>

      <main className="flex flex-col gap-3 px-3 sm:px-4">
        {/* Stat grid */}
        <Card padding="md" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Top Prize"
            value={formatPrizeCompact(contest.topPrize, contest.currency)}
            light
          />
          <Stat
            label="Winners"
            value={contest.prizeSnapshot.maxWinningRank.toLocaleString('en-IN')}
            light
          />
          <Stat
            label="Spots"
            value={contest.totalSpots.toLocaleString('en-IN')}
            light
          />
          <Stat
            label="Per User"
            value={`Up to ${contest.maxEntriesPerUser}`}
            light
          />
        </Card>

        {/* Prize breakdown */}
        <PrizeBreakdown snapshot={contest.prizeSnapshot} currency={contest.currency} />

        {/* Rules */}
        <Card padding="md" className="flex flex-col gap-2">
          <Typography
            variant="caption"
            tone="muted"
            className="text-[10px] font-bold uppercase tracking-wider"
          >
            Contest Rules
          </Typography>
          <Rule
            Icon={Users}
            text={`Max ${contest.maxEntriesPerUser} team${contest.maxEntriesPerUser > 1 ? 's' : ''} per user`}
          />
          {contest.isGuaranteed && (
            <Rule Icon={ShieldCheck} text="Prize money is guaranteed — runs even if spots aren't full." />
          )}
          {contest.hasInviteCode && (
            <Rule Icon={Lock} text="Private contest — joinable only with an invite code." />
          )}
          {contest.joinClosesAt && (
            <Rule
              Icon={Clock}
              text={`Joining closes ${formatRelative(contest.joinClosesAt)}`}
            />
          )}
          {!contest.isGuaranteed && (
            <Rule
              Icon={CheckCircle2}
              text="Prize pool grows as more users join. Confirmed at the start of the contest."
            />
          )}
        </Card>

        {/* Leaderboard CTA — PHASE 7 — visible once the contest has at least
            one entry; lives above "Your entries" so users can jump into live
            ranks immediately. */}
        {(joinedCount > 0 ||
          contest.status === ContestStatus.LIVE ||
          contest.status === ContestStatus.COMPLETED ||
          contest.status === ContestStatus.LOCKED) && (
          <Card padding="md" className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
                Live Leaderboard
              </Typography>
              <Typography variant="body" className="block font-bold">
                {contest.status === ContestStatus.COMPLETED
                  ? 'Final results & winnings'
                  : 'Real-time ranks & projected winnings'}
              </Typography>
            </div>
            <Button
              variant="primary"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() =>
                navigate(
                  buildRoute(ROUTES.CONTEST_LEADERBOARD, { matchId, contestId: contest.id }),
                )
              }
            >
              View
            </Button>
          </Card>
        )}

        {/* My entries */}
        {joinedCount > 0 && (
          <Card padding="md" className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
                Your entries
              </Typography>
              <Typography variant="body" className="block font-bold">
                {joinedCount} of {contest.maxEntriesPerUser} joined
              </Typography>
            </div>
            <Button
              variant="ghost"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => navigate(ROUTES.MY_CONTESTS)}
            >
              View
            </Button>
          </Card>
        )}
      </main>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[640px] border-t border-border bg-surface/95 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur sm:px-4">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          disabled={!canJoin}
          onClick={() =>
            navigate(buildRoute(ROUTES.CONTEST_JOIN, { matchId, contestId: contest.id }))
          }
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

// ─── Pieces ────────────────────────────────────────────────────────────

const Stat = ({
  label,
  value,
  light = false,
}: {
  label: string;
  value: string;
  light?: boolean;
}): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span
      className={cn(
        'text-[10px] font-bold uppercase tracking-wider',
        light ? 'text-text-muted' : 'text-white/70',
      )}
    >
      {label}
    </span>
    <span
      className={cn(
        'text-base font-extrabold tabular-nums',
        light ? 'text-text' : 'text-white',
      )}
    >
      {value}
    </span>
  </div>
);

const Rule = ({
  Icon,
  text,
}: {
  Icon: typeof Users;
  text: string;
}): JSX.Element => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
    <span className="text-text">{text}</span>
  </div>
);

const DetailSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-3 p-3">
    <Skeleton className="h-44 w-full rounded-none" />
    <Skeleton className="h-24 w-full rounded-2xl" />
    <Skeleton className="h-60 w-full rounded-2xl" />
    <Skeleton className="h-40 w-full rounded-2xl" />
  </div>
);

export { ContestDetailScreen };
export default ContestDetailScreen;
