import { useState } from 'react';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { formatMoney, formatTimestamp } from '@features/wallet/wallet.utils';

import { useAdminListPaymentsQuery } from '@features/payments/financial-admin.api';

const AdminPaymentsScreen = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useAdminListPaymentsQuery({ page, limit: 20 });

  return (
    <div className="space-y-6">
      <header>
        <Typography variant="h3">Payments</Typography>
        <Typography variant="body" tone="muted">
          Deposits, failed payments, and gateway records — {data?.meta.total ?? 0} total
        </Typography>
      </header>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {isFetching && !data ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ) : (
                (data?.items ?? []).map((row) => (
                  <tr key={row._id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-mono text-xs">{row.userId}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.status === 'CAPTURED' ? 'success' : row.status === 'FAILED' ? 'danger' : 'neutral'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatMoney(row.amount, { currency: row.currency })}
                    </td>
                    <td className="px-4 py-3">{row.provider}</td>
                    <td className="px-4 py-3">{formatTimestamp(row.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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

export default AdminPaymentsScreen;
