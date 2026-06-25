import { AlertTriangle, CheckCircle2, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, Input, Skeleton, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { ScoreEventStatus, ScoreEventType } from '@shared/enums';

import {
  useAdminGetScoringStatusQuery,
  useAdminListScoreEventsQuery,
  useAdminRecomputeMatchMutation,
} from '../leaderboard.api';
import { ScorePill } from '../components';

const STATUS_TONE: Record<
  ScoreEventStatus,
  { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }
> = {
  [ScoreEventStatus.PENDING]: { tone: 'neutral', label: 'Pending' },
  [ScoreEventStatus.IN_PROGRESS]: { tone: 'warning', label: 'Running' },
  [ScoreEventStatus.COMPLETED]: { tone: 'success', label: 'Done' },
  [ScoreEventStatus.FAILED]: { tone: 'danger', label: 'Failed' },
  [ScoreEventStatus.SKIPPED]: { tone: 'neutral', label: 'Skipped' },
};

const TYPE_LABEL: Record<ScoreEventType, string> = {
  [ScoreEventType.LIVE_TICK]: 'Live tick',
  [ScoreEventType.FINAL_RECONCILE]: 'Final reconcile',
  [ScoreEventType.MANUAL_RECOMPUTE]: 'Manual recompute',
  [ScoreEventType.POINTS_ADJUSTMENT]: 'Points adjusted',
  [ScoreEventType.RULE_CHANGE]: 'Rule change',
};

/**
 * Admin Scoring Monitor.
 *
 * Lets ops:
 *   - Look up a match id and see scoring readiness + recent events.
 *   - Trigger a manual recompute (FINAL_RECONCILE).
 *
 *  Form-light by design — this is a debugging surface, not a CRUD app.
 *  Heavy lifting (rule editing) lives in `ADMIN_FANTASY_SCORING`.
 */
const AdminScoringScreen = (): JSX.Element => {
  const [matchIdInput, setMatchIdInput] = useState('');
  const [matchId, setMatchId] = useState('');

  const statusQuery = useAdminGetScoringStatusQuery({ matchId }, { skip: !matchId });
  const eventsQuery = useAdminListScoreEventsQuery(
    { matchId, limit: 25 },
    { skip: !matchId },
  );
  const [recompute, recomputeState] = useAdminRecomputeMatchMutation();

  const handleLookup = (): void => {
    setMatchId(matchIdInput.trim());
  };

  const handleRecompute = async (): Promise<void> => {
    if (!matchId) return;
    await recompute({
      matchId,
      type: ScoreEventType.MANUAL_RECOMPUTE,
      reason: 'admin-ui',
    }).unwrap();
  };

  const events = useMemo(() => eventsQuery.data?.events ?? [], [eventsQuery.data]);
  const status = statusQuery.data;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-1">
        <Typography variant="h3" className="text-lg font-extrabold">
          Scoring Monitor
        </Typography>
        <Typography variant="caption" tone="muted">
          Inspect match scoring events and trigger manual recomputes.
        </Typography>
      </div>

      <Card padding="md" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Typography variant="caption" tone="muted" className="mb-1 block text-[11px]">
            Match ID
          </Typography>
          <Input
            value={matchIdInput}
            onChange={(e) => setMatchIdInput(e.target.value)}
            placeholder="e.g. 6645f3c1b3e5..."
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>
        <Button onClick={handleLookup} variant="primary" disabled={!matchIdInput.trim()}>
          <Search className="mr-1 h-4 w-4" /> Lookup
        </Button>
        {matchId && (
          <Button
            onClick={handleRecompute}
            variant="success"
            disabled={recomputeState.isLoading || (status && !status.canScore)}
          >
            <RefreshCw
              className={cn('mr-1 h-4 w-4', recomputeState.isLoading && 'animate-spin')}
            />
            Recompute
          </Button>
        )}
      </Card>

      {matchId && statusQuery.isLoading && <Skeleton className="h-24 w-full rounded-lg" />}

      {status && (
        <Card padding="md">
          <div className="flex flex-wrap items-center gap-3">
            {status.canScore ? (
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" /> Ready
              </Badge>
            ) : (
              <Badge tone="danger">
                <AlertTriangle className="h-3 w-3" /> {status.reason ?? 'Not ready'}
              </Badge>
            )}
            {status.latestEvent && (
              <>
                <Typography variant="caption" tone="muted">
                  Last event:{' '}
                  <span className="font-semibold text-text">
                    {TYPE_LABEL[status.latestEvent.type]}
                  </span>
                </Typography>
                <Typography variant="caption" tone="muted">
                  Updated{' '}
                  <span className="font-semibold text-text tabular-nums">
                    {status.latestEvent.playersUpdatedCount}
                  </span>{' '}
                  players ·{' '}
                  <span className="font-semibold text-text tabular-nums">
                    {status.latestEvent.teamsUpdatedCount}
                  </span>{' '}
                  teams
                </Typography>
              </>
            )}
          </div>
        </Card>
      )}

      {matchId && (
        <div className="flex flex-col gap-1.5">
          <Typography
            variant="caption"
            tone="muted"
            className="px-1 text-[10px] font-bold uppercase tracking-wider"
          >
            Recent Score Events
          </Typography>
          {eventsQuery.isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : events.length === 0 ? (
            <Card padding="md" className="text-center">
              <Typography variant="caption" tone="muted">
                No scoring events yet for this match.
              </Typography>
            </Card>
          ) : (
            events.map((evt) => {
              const meta = STATUS_TONE[evt.status];
              return (
                <Card
                  key={evt.id}
                  padding="sm"
                  variant="flat"
                  className="border border-border"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={meta.tone} className="text-[10px]">
                          {meta.label}
                        </Badge>
                        <Typography
                          variant="caption"
                          className="text-[11px] font-bold text-text"
                        >
                          {TYPE_LABEL[evt.type]}
                        </Typography>
                      </div>
                      <Typography variant="caption" tone="muted" className="text-[10px]">
                        {new Date(evt.startedAt).toLocaleString('en-IN')} ·{' '}
                        {evt.durationMs ? `${evt.durationMs}ms` : '—'}
                      </Typography>
                      {evt.errorMessage && (
                        <Typography variant="caption" className="text-[10px] text-danger">
                          {evt.errorMessage}
                        </Typography>
                      )}
                    </div>
                    <ScorePill
                      points={evt.playersUpdatedCount}
                      label="players"
                      size="sm"
                    />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AdminScoringScreen;
