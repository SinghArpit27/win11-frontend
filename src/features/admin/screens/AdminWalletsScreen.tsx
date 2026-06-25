import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, Input, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { formatMoney, formatTimestamp } from '@features/wallet/wallet.utils';
import { WalletTxStatus, WalletTxType } from '@shared/enums';

import { useAdminListWalletTransactionsQuery } from '../admin.api';

/**
 * Admin → Wallets.
 *
 * Two surfaces in one screen:
 *  1. User lookup by id (jumps to per-user wallet detail).
 *  2. Paginated table of every wallet transaction with filters.
 */
const AdminWalletsScreen = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [type, setType] = useState<WalletTxType | ''>('');
  const [status, setStatus] = useState<WalletTxStatus | ''>('');

  const { data, isFetching } = useAdminListWalletTransactionsQuery({
    page,
    limit: 20,
    userId: userId || undefined,
    type: type || undefined,
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography variant="h3">Wallets</Typography>
          <Typography variant="body" tone="muted">
            {data?.meta.total ?? 0} transactions
          </Typography>
        </div>
      </header>

      <Card padding="md" className="space-y-3">
        <Typography variant="label">User wallet lookup</Typography>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            placeholder="Paste a user id"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value.trim())}
            leftAdornment={<Search className="h-4 w-4" />}
            className="max-w-sm"
          />
          <Button asChild disabled={!lookupId}>
            <Link to={ROUTES.ADMIN_WALLET_USER_DETAIL.replace(':userId', lookupId)}>
              Open wallet
            </Link>
          </Button>
        </div>
      </Card>

      <Card padding="md" className="space-y-3">
        <Typography variant="label">Filter transactions</Typography>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Filter by user id"
            value={userId}
            onChange={(e) => {
              setPage(1);
              setUserId(e.target.value.trim());
            }}
            className="max-w-sm"
          />
          <select
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value as WalletTxType | '');
            }}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by transaction type"
          >
            <option value="">All types</option>
            {Object.values(WalletTxType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as WalletTxStatus | '');
            }}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.values(WalletTxStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isFetching && (data?.items ?? []).length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3" colSpan={6}>
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ))
                : (data?.items ?? []).length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                      No transactions match the current filters.
                    </td>
                  </tr>
                )
                : data!.items.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 text-text-muted">{formatTimestamp(t.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.userId}</td>
                      <td className="px-4 py-3">
                        <Badge tone="primary">{t.type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            t.status === WalletTxStatus.COMPLETED
                              ? 'success'
                              : t.status === WalletTxStatus.FAILED
                              ? 'danger'
                              : t.status === WalletTxStatus.PENDING
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatMoney(t.amount, { currency: t.currency })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={ROUTES.ADMIN_WALLET_USER_DETAIL.replace(':userId', t.userId)}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      <footer className="flex items-center justify-between">
        <Typography variant="caption" tone="muted">
          Page {data?.meta.page ?? page} of {data?.meta.totalPages ?? 1}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.meta.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.meta.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AdminWalletsScreen;
