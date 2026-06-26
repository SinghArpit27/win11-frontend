import { Plus, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { useListMatchesQuery } from '@features/sports/sports.api';
import { cn } from '@utils/cn';

import { formatMoney, formatRelative } from '@features/wallet/wallet.utils';

import { ContestStatus } from '@shared/enums';

import {
  useAdminListContestsQuery,
  useAdminTransitionContestStatusMutation,
} from '../contest.api';
import { STATUS_META, TYPE_META, formatPrizeCompact } from '../contest.utils';
import { buildMatchMap, formatMatchLabel } from '../admin.contest.utils';
import { AdminContestTemplatesPanel } from '../components/admin/AdminContestTemplatesPanel';
import { AdminCreateContestModal } from '../components/admin/AdminCreateContestModal';

const STATUS_TABS: ReadonlyArray<{ id: ContestStatus | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: ContestStatus.DRAFT, label: 'Draft' },
  { id: ContestStatus.SCHEDULED, label: 'Scheduled' },
  { id: ContestStatus.OPEN, label: 'Open' },
  { id: ContestStatus.FULL, label: 'Full' },
  { id: ContestStatus.LIVE, label: 'Live' },
  { id: ContestStatus.COMPLETED, label: 'Completed' },
  { id: ContestStatus.CANCELLED, label: 'Cancelled' },
];

type AdminContestTab = 'live' | 'templates';

const AdminContestsScreen = (): JSX.Element => {
  const [panel, setPanel] = useState<AdminContestTab>('templates');
  const [status, setStatus] = useState<ContestStatus | 'ALL'>('ALL');
  const [matchFilter, setMatchFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const query = useAdminListContestsQuery({
    status: status === 'ALL' ? undefined : status,
    matchId: matchFilter || undefined,
    page: 1,
    limit: 200,
  });
  const matchesQuery = useListMatchesQuery({ limit: 200 });
  const [transitionStatus] = useAdminTransitionContestStatusMutation();

  const matchMap = useMemo(
    () => buildMatchMap(matchesQuery.data?.items ?? []),
    [matchesQuery.data],
  );
  const items = query.data?.items ?? [];

  const aggregates = useMemo(() => {
    const totalSpots = items.reduce((acc, c) => acc + c.totalSpots, 0);
    const filledSpots = items.reduce((acc, c) => acc + c.filledSpots, 0);
    const totalPool = items.reduce((acc, c) => acc + c.prizePoolAmount, 0);
    const guaranteedCount = items.filter((c) => c.isGuaranteed).length;
    return {
      contestCount: items.length,
      fillRate: totalSpots === 0 ? 0 : Math.round((filledSpots / totalSpots) * 100),
      totalPool,
      guaranteedCount,
    };
  }, [items]);

  const publishDraft = async (contestId: string): Promise<void> => {
    await transitionStatus({ contestId, status: ContestStatus.OPEN }).unwrap();
  };

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Typography variant="h2" className="block text-xl font-extrabold">
            Contests
          </Typography>
          <Typography variant="caption" tone="muted">
            Manage templates, attach contests to matches, and monitor live contests.
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Custom contest
          </Button>
        </div>
      </header>

      {toast ? (
        <Card padding="sm" className="border-success/30 bg-success/5 text-sm text-success">
          {toast}
        </Card>
      ) : null}

      <div
        role="tablist"
        className="flex w-full items-center gap-1 rounded-xl bg-surface p-1 shadow-sm"
      >
        {(
          [
            { id: 'templates' as const, label: 'Templates & attach' },
            { id: 'live' as const, label: 'Live contests' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPanel(t.id)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
              panel === t.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {panel === 'templates' ? (
        <AdminContestTemplatesPanel
          onAttachSuccess={(message) => {
            setToast(message);
            setTimeout(() => setToast(null), 5000);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total contests" value={aggregates.contestCount.toLocaleString('en-IN')} />
            <Metric label="Fill rate" value={`${aggregates.fillRate}%`} />
            <Metric label="Total pool" value={formatPrizeCompact(aggregates.totalPool)} />
            <Metric
              label="Guaranteed"
              value={aggregates.guaranteedCount.toLocaleString('en-IN')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="h-10 max-w-xs rounded-lg border border-border bg-surface px-3 text-sm"
              aria-label="Filter by match"
            >
              <option value="">All matches</option>
              {(matchesQuery.data?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {formatMatchLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div
            role="tablist"
            className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-xl bg-surface p-1 shadow-sm"
          >
            {STATUS_TABS.map((t) => {
              const isActive = status === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStatus(t.id)}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-text-muted hover:text-text',
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {query.isLoading ? (
            <Skeleton className="h-72 w-full rounded-2xl" />
          ) : items.length === 0 ? (
            <Card padding="xl" className="border-dashed text-center">
              <Trophy className="mx-auto h-8 w-8 text-text-muted" />
              <Typography variant="h3" className="mt-3 block">
                No contests
              </Typography>
              <Typography variant="caption" tone="muted" className="mt-1 block">
                Attach a template from the Templates tab or create a custom contest.
              </Typography>
            </Card>
          ) : (
            <Card padding="none" className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-bg-elevated/60 text-[11px] uppercase tracking-wider text-text-muted">
                  <tr>
                    <Th>Name</Th>
                    <Th>Match</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Entry</Th>
                    <Th className="text-right">Pool</Th>
                    <Th className="text-right">Spots</Th>
                    <Th className="text-right">Fill</Th>
                    <Th>Joins close</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => {
                    const statusMeta = STATUS_META[c.status];
                    const typeMeta = TYPE_META[c.type];
                    const match = matchMap.get(c.matchId);
                    return (
                      <tr
                        key={c.id}
                        className="border-t border-border transition-colors hover:bg-surface-hover"
                      >
                        <Td className="font-semibold">{c.name}</Td>
                        <Td>
                          <span className="text-xs">{formatMatchLabel(match)}</span>
                        </Td>
                        <Td>
                          <span className={cn('text-xs font-bold uppercase', typeMeta.accent)}>
                            {typeMeta.label}
                          </span>
                        </Td>
                        <Td>
                          <Badge tone={statusMeta.tone} className="text-[10px]">
                            {statusMeta.label}
                          </Badge>
                        </Td>
                        <Td className="text-right tabular-nums">
                          {formatMoney(c.entryFee, { currency: c.currency })}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {formatPrizeCompact(c.prizePoolAmount, c.currency)}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {c.filledSpots.toLocaleString('en-IN')} /{' '}
                          {c.totalSpots.toLocaleString('en-IN')}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {Math.round(c.fillPercentage)}%
                        </Td>
                        <Td>
                          {c.joinClosesAt ? formatRelative(c.joinClosesAt) : '—'}
                        </Td>
                        <Td>
                          {c.status === ContestStatus.DRAFT ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => void publishDraft(c.id)}
                            >
                              Publish
                            </Button>
                          ) : null}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      <AdminCreateContestModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <Card padding="md">
    <Typography variant="caption" tone="muted" className="block text-[10px] uppercase">
      {label}
    </Typography>
    <Typography variant="h3" className="mt-1 block text-lg font-extrabold tabular-nums">
      {value}
    </Typography>
  </Card>
);

const Th = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element => (
  <th className={cn('px-3 py-2 text-xs font-semibold', className)}>{children}</th>
);

const Td = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element => (
  <td className={cn('px-3 py-2.5 align-middle', className)}>{children}</td>
);

export { AdminContestsScreen };
export default AdminContestsScreen;
