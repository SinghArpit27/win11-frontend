import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { formatMoney, formatTimestamp } from '@features/wallet/wallet.utils';
import { AdminWalletActionType } from '@shared/enums';

import { useAdminListWalletActionsQuery } from '../admin.api';

/**
 * Admin → Wallet actions log.
 *
 * Surfaces every privileged financial action (credits, debits, freezes,
 * unfreezes, refunds) with a deep-link to the affected wallet. Also
 * serves as the foundation for the "Suspicious financial activity"
 * surface — backend `securityLogger.suspicious()` writes audit rows
 * that the next phase will splice into this view.
 */
const ACTION_TONE: Record<AdminWalletActionType, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  [AdminWalletActionType.ADJUSTMENT_CREDIT]: 'success',
  [AdminWalletActionType.ADJUSTMENT_DEBIT]: 'warning',
  [AdminWalletActionType.FREEZE]: 'danger',
  [AdminWalletActionType.UNFREEZE]: 'primary',
  [AdminWalletActionType.REFUND]: 'primary',
};

const AdminWalletActionsScreen = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState<AdminWalletActionType | ''>('');

  const { data, isFetching } = useAdminListWalletActionsQuery({
    page,
    limit: 20,
    actionType: actionType || undefined,
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Typography variant="h3">Wallet actions</Typography>
        <Typography variant="body" tone="muted">
          Audit trail of every privileged financial action taken by support / admins.
        </Typography>
      </header>

      <Card padding="md" className="flex flex-wrap items-center gap-3">
        <Typography variant="label">Filter</Typography>
        <select
          value={actionType}
          onChange={(e) => {
            setPage(1);
            setActionType(e.target.value as AdminWalletActionType | '');
          }}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
          aria-label="Filter by action type"
        >
          <option value="">All actions</option>
          {Object.values(AdminWalletActionType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Target user</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {isFetching && (data?.items.length ?? 0) === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : (data?.items.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    No admin actions logged yet.
                  </td>
                </tr>
              ) : (
                data!.items.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-b-0 align-top">
                    <td className="px-4 py-3 text-text-muted">{formatTimestamp(row.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.adminId}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ACTION_TONE[row.actionType]}>{row.actionType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={ROUTES.ADMIN_WALLET_USER_DETAIL.replace(':userId', row.targetUserId)}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {row.targetUserId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.amount > 0 ? formatMoney(row.amount, { currency: row.currency }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{row.reason}</td>
                  </tr>
                ))
              )}
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

export default AdminWalletActionsScreen;
