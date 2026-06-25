import { Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Card, Skeleton, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { formatMoney, formatRelative } from '@features/wallet/wallet.utils';

import { ContestStatus } from '@shared/enums';

import { useAdminListContestsQuery } from '../contest.api';
import { STATUS_META, TYPE_META, formatPrizeCompact } from '../contest.utils';

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

/**
 * Read-only admin contest grid + analytics placeholders.
 *
 *  Phase 6 ships the listing + monitoring surface — write operations
 *  (create / update / cancel / clone) are wired via the backend's
 *  `/admin/contests` REST endpoints and surface here over time.
 *
 *  Why a single tabular screen?
 *  → Most admin actions during this phase are status-driven (cancel
 *    contests that won't fill, monitor mega-contest fill rates) so a
 *    dense, filterable grid beats per-entity forms early.
 */
const AdminContestsScreen = (): JSX.Element => {
  const [status, setStatus] = useState<ContestStatus | 'ALL'>('ALL');

  const query = useAdminListContestsQuery({
    status: status === 'ALL' ? undefined : status,
    page: 1,
    limit: 100,
  });

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

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-6">
      <header className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="block text-xl font-extrabold">
            Contests
          </Typography>
          <Typography variant="caption" tone="muted">
            Monitor fill rates, prize pools and lifecycle transitions.
          </Typography>
        </div>
      </header>

      {/* Analytics placeholders */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Total contests"
          value={aggregates.contestCount.toLocaleString('en-IN')}
        />
        <Metric label="Fill rate" value={`${aggregates.fillRate}%`} />
        <Metric
          label="Total pool"
          value={formatPrizeCompact(aggregates.totalPool)}
        />
        <Metric
          label="Guaranteed"
          value={aggregates.guaranteedCount.toLocaleString('en-IN')}
        />
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
        </Card>
      ) : (
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-bg-elevated/60 text-[11px] uppercase tracking-wider text-text-muted">
              <tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th className="text-right">Entry</Th>
                <Th className="text-right">Pool</Th>
                <Th className="text-right">Spots</Th>
                <Th className="text-right">Fill</Th>
                <Th>Joins close</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const statusMeta = STATUS_META[c.status];
                const typeMeta = TYPE_META[c.type];
                return (
                  <tr
                    key={c.id}
                    className="border-t border-border transition-colors hover:bg-surface-hover"
                  >
                    <Td className="font-semibold">{c.name}</Td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
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
