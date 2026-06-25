import { ArrowRight, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';

import {
  formatPoints,
  formatRankOrdinal,
  MOVEMENT_META,
} from '../leaderboard.utils';
import { useGetMyRecentRankHistoryQuery } from '../leaderboard.api';
import { RankMovementIndicator } from '../components';

/**
 * "My Rankings" — flat history of the user's latest rank movements
 * across every contest they've played. Each card jumps into the
 * relevant contest leaderboard.
 */
const MyRankingsScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const historyQuery = useGetMyRecentRankHistoryQuery({ limit: 25 });

  const rows = useMemo(() => historyQuery.data?.history ?? [], [historyQuery.data]);

  if (historyQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3 pb-20">
        <PageHeader />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-3 pb-20">
        <PageHeader />
        <Card padding="md" className="text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-text-muted" aria-hidden />
          <Typography variant="body" className="font-semibold">
            No rankings yet
          </Typography>
          <Typography variant="caption" tone="muted">
            Join contests and your rank history will appear here.
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-20">
      <PageHeader />
      {rows.map((row) => {
        const meta = MOVEMENT_META[row.movement];
        return (
          <Card
            key={`${row.scopeId}:${row.capturedAt}`}
            padding="md"
            variant="flat"
            className="cursor-pointer border border-border transition-all hover:border-border-strong hover:bg-bg-elevated"
            onClick={() =>
              navigate(
                ROUTES.CONTEST_LEADERBOARD.replace(
                  ':matchId',
                  row.matchId,
                ).replace(':contestId', row.scopeId),
              )
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Trophy className="h-5 w-5" aria-hidden />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <Typography
                  variant="body"
                  className="truncate text-sm font-bold leading-tight"
                >
                  Contest {row.scopeId.slice(-6)}
                </Typography>
                <div className="mt-0.5 flex items-center gap-2">
                  <Typography
                    variant="caption"
                    className="text-[12px] font-semibold tabular-nums"
                  >
                    {formatRankOrdinal(row.rank)}
                  </Typography>
                  <span className="text-text-muted">·</span>
                  <Typography variant="caption" tone="muted" className="text-[11px]">
                    {formatPoints(row.points)} pts
                  </Typography>
                  <RankMovementIndicator
                    movement={row.movement}
                    delta={row.rankDelta}
                  />
                </div>
                <Typography variant="caption" tone="muted" className="mt-0.5 text-[10px]">
                  {meta.label} · {new Date(row.capturedAt).toLocaleString('en-IN')}
                </Typography>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const PageHeader = (): JSX.Element => (
  <div className="mb-1 px-1">
    <Typography variant="h3" className="text-lg font-extrabold">
      My Rankings
    </Typography>
    <Typography variant="caption" tone="muted">
      Latest rank movements across your contests
    </Typography>
  </div>
);

export default MyRankingsScreen;
