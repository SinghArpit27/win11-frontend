import { Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge, Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';

import { formatRelative } from '@features/wallet/wallet.utils';
import { formatMoney } from '@features/wallet/wallet.utils';

import { ContestEntryStatus, ContestStatus } from '@shared/enums';

import { useListMyContestEntriesQuery } from '../contest.api';
import type { ContestEntry } from '../contest.types';
import { STATUS_META } from '../contest.utils';

type TabId = 'live' | 'upcoming' | 'completed';

/**
 * "My Contests" — flat list of every entry the user has, bucketed into
 * upcoming / live / completed. We use the contest status (cached on every
 * entry by the server) to pick the right bucket without re-fetching.
 */
const MyContestsScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('upcoming');

  const entriesQuery = useListMyContestEntriesQuery({ limit: 100 });

  const grouped = useMemo<Record<TabId, ContestEntry[]>>(() => {
    const buckets: Record<TabId, ContestEntry[]> = {
      upcoming: [],
      live: [],
      completed: [],
    };
    for (const entry of entriesQuery.data?.items ?? []) {
      const status = entry.contest?.status;
      if (status === ContestStatus.LIVE) {
        buckets.live.push(entry);
      } else if (
        status === ContestStatus.COMPLETED ||
        entry.status === ContestEntryStatus.REFUNDED ||
        entry.status === ContestEntryStatus.SETTLED ||
        entry.status === ContestEntryStatus.CANCELLED
      ) {
        buckets.completed.push(entry);
      } else {
        buckets.upcoming.push(entry);
      }
    }
    return buckets;
  }, [entriesQuery.data]);

  const tabs: ReadonlyArray<{ id: TabId; label: string; count: number }> = useMemo(
    () => [
      { id: 'upcoming', label: 'Upcoming', count: grouped.upcoming.length },
      { id: 'live', label: 'Live', count: grouped.live.length },
      { id: 'completed', label: 'Completed', count: grouped.completed.length },
    ],
    [grouped],
  );

  const items = grouped[tab];

  return (
    <div className="flex flex-col gap-3 px-3 pb-24 pt-3 sm:px-4 lg:px-6">
      <Typography variant="h2" className="block text-xl font-extrabold">
        My Contests
      </Typography>

      <div
        role="tablist"
        className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-xl bg-surface p-1 shadow-sm"
      >
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text',
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                    isActive
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'bg-surface-elevated text-text-muted',
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {entriesQuery.isLoading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {items.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => {
                if (entry.contest) {
                  navigate(
                    ROUTES.CONTEST_DETAIL.replace(':matchId', entry.matchId).replace(
                      ':contestId',
                      entry.contestId,
                    ),
                  );
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Pieces ────────────────────────────────────────────────────────────

const EntryCard = ({
  entry,
  onClick,
}: {
  entry: ContestEntry;
  onClick: () => void;
}): JSX.Element => {
  const contest = entry.contest;
  const status = contest ? STATUS_META[contest.status] : null;
  const settled =
    entry.status === ContestEntryStatus.SETTLED && entry.winningAmount > 0;
  const refunded = entry.status === ContestEntryStatus.REFUNDED;

  return (
    <Card
      padding="md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Typography variant="body" className="block truncate font-bold">
            {contest?.name ?? 'Contest'}
          </Typography>
          {contest?.match && (
            <Typography variant="caption" tone="muted" className="block">
              {contest.match.homeTeam?.shortName} vs {contest.match.awayTeam?.shortName} ·{' '}
              {formatRelative(contest.match.scheduledAt)}
            </Typography>
          )}
        </div>
        {status && (
          <Badge tone={status.tone} className="text-[10px] uppercase">
            {status.label}
          </Badge>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini label="Team" value={entry.team?.name ?? '—'} />
        <Mini
          label="Entry"
          value={formatMoney(entry.entryFee, { currency: entry.currency })}
        />
        <Mini
          label={settled ? 'Won' : refunded ? 'Refunded' : 'Rank'}
          value={
            settled
              ? formatMoney(entry.winningAmount, { currency: entry.currency })
              : refunded
                ? formatMoney(entry.entryFee, { currency: entry.currency })
                : entry.rank
                  ? `#${entry.rank}`
                  : '—'
          }
          accent={settled ? 'success' : refunded ? 'warning' : 'default'}
        />
      </div>
    </Card>
  );
};

const Mini = ({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: string;
  accent?: 'default' | 'success' | 'warning';
}): JSX.Element => (
  <div>
    <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
      {label}
    </span>
    <span
      className={cn(
        'block truncate text-sm font-bold tabular-nums',
        accent === 'success' && 'text-success',
        accent === 'warning' && 'text-warning',
      )}
    >
      {value}
    </span>
  </div>
);

const ListSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-28 w-full rounded-2xl" />
    ))}
  </div>
);

const EmptyState = ({ tab }: { tab: TabId }): JSX.Element => (
  <Card padding="xl" className="border-dashed text-center">
    <Trophy className="mx-auto h-8 w-8 text-text-muted" />
    <Typography variant="h3" className="mt-3 block">
      No {tab} contests
    </Typography>
    <Typography variant="caption" tone="muted" className="mt-1 block">
      Join a contest from a match and it'll appear here.
    </Typography>
  </Card>
);

export { MyContestsScreen };
export default MyContestsScreen;
