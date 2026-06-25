import { useState } from 'react';

import { Badge, Button, Card, Input, Skeleton, Typography } from '@components/ui';
import { formatMoney, formatTimestamp } from '@features/wallet/wallet.utils';

import {
  useAdminApproveWithdrawalMutation,
  useAdminListPendingWithdrawalsQuery,
  useAdminRejectWithdrawalMutation,
} from '@features/payments/financial-admin.api';

const AdminWithdrawalsScreen = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isFetching, refetch } = useAdminListPendingWithdrawalsQuery({ page, limit: 20 });
  const [approve, approveState] = useAdminApproveWithdrawalMutation();
  const [reject, rejectState] = useAdminRejectWithdrawalMutation();

  const onApprove = async (withdrawalId: string): Promise<void> => {
    const res = await approve({ withdrawalId });
    if ('data' in res) void refetch();
  };

  const onReject = async (): Promise<void> => {
    if (!rejectId || !rejectReason.trim()) return;
    const res = await reject({ withdrawalId: rejectId, reason: rejectReason.trim() });
    if ('data' in res) {
      setRejectId(null);
      setRejectReason('');
      void refetch();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <Typography variant="h3">Withdrawals</Typography>
        <Typography variant="body" tone="muted">
          Pending withdrawal requests awaiting admin approval
        </Typography>
      </header>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">UPI / Bank</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isFetching && !data ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ) : (data?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No pending withdrawals
                  </td>
                </tr>
              ) : (
                (data?.items ?? []).map((row) => (
                  <tr key={row._id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-mono text-xs">{row.userId}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatMoney(row.amount, { currency: row.currency })}
                    </td>
                    <td className="px-4 py-3">{row.upiId ?? '—'}</td>
                    <td className="px-4 py-3">{formatTimestamp(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          loading={approveState.isLoading}
                          onClick={() => void onApprove(row._id)}
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectId(row._id)}>
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {rejectId ? (
        <Card padding="md" className="space-y-3">
          <Typography variant="label">Reject withdrawal</Typography>
          <Input
            placeholder="Rejection reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" loading={rejectState.isLoading} onClick={() => void onReject()}>
              Confirm reject
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={!data?.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!data?.meta.hasNext} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminWithdrawalsScreen;
