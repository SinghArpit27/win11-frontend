import { ArrowLeft, Check, Plus, Wallet as WalletIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, Skeleton, Typography } from '@components/ui';
import { QueryErrorState } from '@components/common/QueryErrorState';
import { ROUTES } from '@constants/routes.constants';
import { buildRoute } from '@utils/routes.util';
import { cn } from '@utils/cn';

import { useListMyFantasyTeamsQuery } from '@features/fantasy/fantasy.api';
import { useGetMyWalletQuery } from '@features/wallet/wallet.api';
import { formatMoney } from '@features/wallet/wallet.utils';

import { ContestStatus } from '@shared/enums';

import { JoinConfirmModal } from '../components';
import { useGetContestQuery, useListMyEntriesForContestQuery } from '../contest.api';
import { isFreeContest, canJoinContest } from '../contest.utils';

/**
 * Team picker + confirmation step.
 *
 *  Mobile-first single column. On desktop we keep the same 420 → 640px
 *  feel — joining a contest is a *focused task*, not a dashboard.
 *
 *  Disabled-team rules:
 *   - Already used for this contest      → "Already joined"
 *   - Contest reached `maxEntriesPerUser` → none selectable
 */
const JoinContestScreen = (): JSX.Element => {
  const { matchId = '', contestId = '' } = useParams<{
    matchId: string;
    contestId: string;
  }>();
  const navigate = useNavigate();

  const detailQuery = useGetContestQuery({ contestId }, { skip: !contestId });
  const teamsQuery = useListMyFantasyTeamsQuery({ matchId, limit: 50 }, { skip: !matchId });
  const entriesQuery = useListMyEntriesForContestQuery(
    { contestId },
    { skip: !contestId },
  );
  const walletQuery = useGetMyWalletQuery();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const contest = detailQuery.data;
  const teams = teamsQuery.data?.items ?? [];

  /** Set of team ids already used for this contest. */
  const usedTeamIds = useMemo<Set<string>>(
    () => new Set((entriesQuery.data ?? []).map((e) => e.teamId)),
    [entriesQuery.data],
  );

  const joinedCount = entriesQuery.data?.length ?? 0;
  const remainingEntries = contest ? contest.maxEntriesPerUser - joinedCount : 0;
  const canSelectMore =
    remainingEntries > 0 && contest && canJoinContest(contest);

  const handleConfirm = useCallback(() => {
    if (!selectedTeamId) return;
    setModalOpen(true);
  }, [selectedTeamId]);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    setSelectedTeamId(null);
    navigate(ROUTES.MY_CONTESTS);
  }, [navigate]);

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
    return (
      <div className="flex flex-col gap-3 p-3">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const wallet = walletQuery.data?.wallet;
  const spendable = wallet?.balances.spendable ?? 0;
  const insufficient = !isFreeContest(contest) && spendable < contest.entryFee;

  return (
    <div className="flex flex-col gap-3 pb-28">
      <header className="flex items-center gap-2 border-b border-border bg-surface px-3 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="rounded-full p-2 text-text-muted hover:text-text"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
            Choose team to join
          </Typography>
          <Typography variant="body" className="block truncate font-bold">
            {contest.name}
          </Typography>
        </div>
        <div className="text-right">
          <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
            Entry
          </Typography>
          <Typography variant="body" className="block font-extrabold tabular-nums">
            {isFreeContest(contest)
              ? 'FREE'
              : formatMoney(contest.entryFee, { currency: contest.currency })}
          </Typography>
        </div>
      </header>

      {/* Wallet strip */}
      {!isFreeContest(contest) && (
        <Card
          padding="md"
          className={cn(
            'mx-3 flex items-center justify-between gap-3',
            insufficient && 'border-warning/40 bg-warning/5',
          )}
        >
          <div className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-text-muted" />
            <Typography variant="caption" className="text-xs font-semibold">
              Wallet balance
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <Typography variant="body" className="font-bold tabular-nums">
              {formatMoney(spendable, { currency: contest.currency })}
            </Typography>
            {insufficient && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(ROUTES.WALLET)}
              >
                Add Cash
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Team list */}
      <div className="flex flex-col gap-2 px-3">
        {teamsQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : teams.length === 0 ? (
          <EmptyTeams onCreate={() =>
            navigate(buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId }))
          } />
        ) : (
          teams.map((team) => {
            const isUsed = usedTeamIds.has(team.id);
            const isSelected = selectedTeamId === team.id;
            const disabled = isUsed || !canSelectMore;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => !disabled && setSelectedTeamId(team.id)}
                aria-pressed={isSelected}
                disabled={disabled}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-2xl border bg-surface px-4 py-3 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary-soft shadow-sm'
                    : 'border-border hover:border-border-strong',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-surface text-text-muted',
                    )}
                    aria-hidden
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </div>
                  <div>
                    <Typography variant="body" className="block font-semibold">
                      {team.name}
                    </Typography>
                    <Typography variant="caption" tone="muted" className="block text-xs">
                      {team.totalCreditsUsed.toFixed(1)} Cr ·{' '}
                      {Object.entries(team.roleBreakdown)
                        .map(([k, v]) => `${k.slice(0, 2)} ${v}`)
                        .join(' · ')}
                    </Typography>
                  </div>
                </div>
                {isUsed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Joined
                  </span>
                )}
              </button>
            );
          })
        )}

        {teams.length > 0 && canSelectMore && (
          <Button
            variant="ghost"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() =>
              navigate(buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId }))
            }
            className="mt-1"
          >
            Create new team
          </Button>
        )}
      </div>

      {/* Sticky confirm bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[640px] border-t border-border bg-surface/95 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur sm:px-4">
        <Button
          fullWidth
          size="lg"
          variant="primary"
          disabled={
            !selectedTeamId ||
            insufficient ||
            !canSelectMore ||
            contest.status === ContestStatus.FULL
          }
          onClick={handleConfirm}
        >
          {selectedTeamId
            ? isFreeContest(contest)
              ? 'Continue'
              : `Pay ${formatMoney(contest.entryFee, { currency: contest.currency })} & Join`
            : 'Select a team'}
        </Button>
      </div>

      <JoinConfirmModal
        open={modalOpen}
        contest={contest}
        teamId={selectedTeamId}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

const EmptyTeams = ({ onCreate }: { onCreate: () => void }): JSX.Element => (
  <Card padding="xl" className="border-dashed text-center">
    <Typography variant="h3" className="block">
      Create a team first
    </Typography>
    <Typography variant="caption" tone="muted" className="mt-1 block">
      You need at least one fantasy team for this match before you can join a contest.
    </Typography>
    <Button
      variant="primary"
      onClick={onCreate}
      className="mt-3"
      leftIcon={<Plus className="h-4 w-4" />}
    >
      Create team
    </Button>
  </Card>
);

export { JoinContestScreen };
export default JoinContestScreen;
