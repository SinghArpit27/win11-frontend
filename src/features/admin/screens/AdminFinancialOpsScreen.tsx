import { useState } from 'react';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { formatMoney, formatTimestamp } from '@features/wallet/wallet.utils';

import {
  useAdminListRiskFlagsQuery,
  useAdminListSettlementsQuery,
  useAdminResolveRiskFlagMutation,
} from '@features/payments/financial-admin.api';

type Tab = 'settlements' | 'risk';

const AdminFinancialOpsScreen = (): JSX.Element => {
  const [tab, setTab] = useState<Tab>('settlements');
  const [page, setPage] = useState(1);

  const settlementsQuery = useAdminListSettlementsQuery({ page, limit: 20 }, { skip: tab !== 'settlements' });
  const riskQuery = useAdminListRiskFlagsQuery({ page, limit: 20 }, { skip: tab !== 'risk' });
  const [resolveFlag, resolveState] = useAdminResolveRiskFlagMutation();

  const active = tab === 'settlements' ? settlementsQuery : riskQuery;

  return (
    <div className="space-y-6">
      <header>
        <Typography variant="h3">Financial operations</Typography>
        <Typography variant="body" tone="muted">
          Settlement pipeline status and open risk flags
        </Typography>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'settlements' ? 'primary' : 'outline'} size="sm" onClick={() => { setTab('settlements'); setPage(1); }}>
          Settlements
        </Button>
        <Button variant={tab === 'risk' ? 'primary' : 'outline'} size="sm" onClick={() => { setTab('risk'); setPage(1); }}>
          Risk flags
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'settlements' ? (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {settlementsQuery.isFetching && !settlementsQuery.data ? (
                  <tr><td colSpan={5} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                ) : (
                  (settlementsQuery.data?.items ?? []).map((row) => (
                    <tr key={row._id} className="border-b border-border/60">
                      <td className="px-4 py-3">{row.type}</td>
                      <td className="px-4 py-3"><Badge tone={row.status === 'COMPLETED' ? 'success' : row.status === 'FAILED' ? 'danger' : 'neutral'}>{row.status}</Badge></td>
                      <td className="px-4 py-3 font-mono text-xs">{row.userId}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(row.amount, { currency: row.currency })}</td>
                      <td className="px-4 py-3">{formatTimestamp(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {riskQuery.isFetching && !riskQuery.data ? (
                  <tr><td colSpan={5} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                ) : (
                  (riskQuery.data?.items ?? []).map((row) => (
                    <tr key={row._id} className="border-b border-border/60">
                      <td className="px-4 py-3 font-mono text-xs">{row.userId}</td>
                      <td className="px-4 py-3">{row.type}</td>
                      <td className="px-4 py-3"><Badge tone={row.severity === 'HIGH' ? 'danger' : 'warning'}>{row.severity}</Badge></td>
                      <td className="px-4 py-3 max-w-xs truncate">{row.reason}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" loading={resolveState.isLoading} onClick={() => void resolveFlag({ flagId: row._id })}>
                          Resolve
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={(active.data?.items.length ?? 0) < 20} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
};

export default AdminFinancialOpsScreen;
