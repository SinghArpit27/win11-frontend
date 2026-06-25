import { RefreshCw, Search, ShieldCheck, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, Input, Skeleton, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { formatPrizeCompact } from '@features/contests/contest.utils';

import { ContestSettlementStatus } from '@shared/enums';

import {
  useAdminGetSettlementQuery,
  useAdminListSnapshotsQuery,
  useAdminRebuildLeaderboardMutation,
  useAdminResetSettlementMutation,
  useAdminSettleContestMutation,
  useGetContestLeaderboardQuery,
} from '../leaderboard.api';
import {
  LeaderboardRow as LeaderboardRowComponent,
} from '../components';

const SETTLEMENT_TONE: Record<
  ContestSettlementStatus,
  { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }
> = {
  [ContestSettlementStatus.NOT_STARTED]: { tone: 'neutral', label: 'Not started' },
  [ContestSettlementStatus.IN_PROGRESS]: { tone: 'warning', label: 'In progress' },
  [ContestSettlementStatus.SETTLED]: { tone: 'success', label: 'Settled' },
  [ContestSettlementStatus.FAILED]: { tone: 'danger', label: 'Failed' },
};

/**
 * Admin Leaderboard Monitor.
 *
 *  Operations:
 *    - Lookup any contestId.
 *    - Rebuild leaderboard from Mongo (drops + repopulates Redis ZSET).
 *    - Force settle / reset settlement.
 *    - View latest snapshots + top-N entries.
 */
const AdminLeaderboardScreen = (): JSX.Element => {
  const [contestIdInput, setContestIdInput] = useState('');
  const [contestId, setContestId] = useState('');

  const leaderboard = useGetContestLeaderboardQuery(
    { contestId, page: 1, limit: 25 },
    { skip: !contestId },
  );
  const snapshots = useAdminListSnapshotsQuery(
    { contestId, limit: 10 },
    { skip: !contestId },
  );
  const settlement = useAdminGetSettlementQuery(
    { contestId },
    { skip: !contestId },
  );

  const [rebuild, rebuildState] = useAdminRebuildLeaderboardMutation();
  const [settle, settleState] = useAdminSettleContestMutation();
  const [reset, resetState] = useAdminResetSettlementMutation();

  const handleLookup = (): void => setContestId(contestIdInput.trim());

  const handleRebuild = async (): Promise<void> => {
    if (!contestId) return;
    await rebuild({ contestId, reason: 'MANUAL' }).unwrap();
  };

  const handleSettle = async (force = false): Promise<void> => {
    if (!contestId) return;
    await settle({ contestId, force }).unwrap();
  };

  const handleReset = async (): Promise<void> => {
    if (!contestId) return;
    await reset({ contestId }).unwrap();
  };

  const result = settlement.data?.result;
  const rows = useMemo(() => leaderboard.data?.rows ?? [], [leaderboard.data]);
  const lastSnapshot = snapshots.data?.snapshots?.[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="px-1">
        <Typography variant="h3" className="text-lg font-extrabold">
          Leaderboard Monitor
        </Typography>
        <Typography variant="caption" tone="muted">
          Inspect contest leaderboards, rebuild caches, and manage settlements.
        </Typography>
      </div>

      <Card padding="md" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Typography variant="caption" tone="muted" className="mb-1 block text-[11px]">
            Contest ID
          </Typography>
          <Input
            value={contestIdInput}
            onChange={(e) => setContestIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="e.g. 6645f3c1b3e5..."
          />
        </div>
        <Button onClick={handleLookup} variant="primary" disabled={!contestIdInput.trim()}>
          <Search className="mr-1 h-4 w-4" /> Lookup
        </Button>
      </Card>

      {contestId && (
        <Card padding="md" className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRebuild}
            disabled={rebuildState.isLoading}
          >
            <RefreshCw className={cn('mr-1 h-3.5 w-3.5', rebuildState.isLoading && 'animate-spin')} />
            Rebuild
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleSettle(false)}
            disabled={settleState.isLoading}
          >
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Settle
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleSettle(true)}
            disabled={settleState.isLoading}
          >
            Force settle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={resetState.isLoading}
          >
            <Undo2 className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        </Card>
      )}

      {contestId && result && (
        <Card padding="md">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={SETTLEMENT_TONE[result.status].tone}>
              {SETTLEMENT_TONE[result.status].label}
            </Badge>
            <Typography variant="caption" tone="muted">
              Pool:{' '}
              <span className="font-bold text-text">
                {formatPrizeCompact(result.poolAmount, result.currency)}
              </span>
            </Typography>
            <Typography variant="caption" tone="muted">
              Paid:{' '}
              <span className="font-bold text-text">
                {formatPrizeCompact(result.totalPaidOut, result.currency)}
              </span>
            </Typography>
            <Typography variant="caption" tone="muted">
              Winners:{' '}
              <span className="font-bold text-text tabular-nums">{result.totalWinners}</span>
            </Typography>
            <Typography variant="caption" tone="muted">
              Top Score:{' '}
              <span className="font-bold text-text tabular-nums">
                {result.topScore.toFixed(2)}
              </span>
            </Typography>
          </div>
          {result.completedAt && (
            <Typography variant="caption" tone="muted" className="mt-1 block text-[10px]">
              Completed at {new Date(result.completedAt).toLocaleString('en-IN')} ·{' '}
              {result.durationMs ?? 0}ms
            </Typography>
          )}
        </Card>
      )}

      {contestId && lastSnapshot && (
        <Card padding="md">
          <Typography
            variant="caption"
            tone="muted"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider"
          >
            Latest snapshot
          </Typography>
          <Typography variant="caption">
            {new Date(lastSnapshot.capturedAt).toLocaleString('en-IN')} ·{' '}
            {lastSnapshot.totalEntries.toLocaleString('en-IN')} entries · top score{' '}
            <span className="font-bold tabular-nums">
              {lastSnapshot.topScore.toFixed(2)}
            </span>
          </Typography>
        </Card>
      )}

      {contestId && (
        <div className="flex flex-col gap-1.5">
          <Typography
            variant="caption"
            tone="muted"
            className="px-1 text-[10px] font-bold uppercase tracking-wider"
          >
            Top 25 (live)
          </Typography>
          {leaderboard.isLoading ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : rows.length === 0 ? (
            <Card padding="md" className="text-center">
              <Typography variant="caption" tone="muted">
                No leaderboard rows.
              </Typography>
            </Card>
          ) : (
            rows.map((row) => <LeaderboardRowComponent key={row.entryId} row={row} />)
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboardScreen;
