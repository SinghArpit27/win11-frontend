import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageContainer, PageHeader } from '@components/layout';
import { Badge, Button, Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { formatMoney, formatTimestamp } from '@features/wallet/wallet.utils';

import { useListMyPaymentsQuery } from '../payment.api';
import { useListMyWithdrawalsQuery } from '../withdrawal.api';

type Tab = 'deposits' | 'withdrawals';

const WalletFinancialScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('deposits');
  const [page, setPage] = useState(1);

  const paymentsQuery = useListMyPaymentsQuery({ page, limit: 20 }, { skip: tab !== 'deposits' });
  const withdrawalsQuery = useListMyWithdrawalsQuery({ page }, { skip: tab !== 'withdrawals' });

  const activeQuery = tab === 'deposits' ? paymentsQuery : withdrawalsQuery;
  const items = activeQuery.data?.items ?? [];

  return (
    <PageContainer as="div" className="gap-5">
      <PageHeader
        eyebrow="Financial history"
        title={tab === 'deposits' ? 'Deposits & payments' : 'Withdrawals'}
        subtitle="Track deposit checkout status and withdrawal request lifecycle."
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(ROUTES.WALLET)}
          >
            Back to wallet
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(['deposits', 'withdrawals'] as const).map((key) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
          >
            {key === 'deposits' ? 'Deposits' : 'Withdrawals'}
          </Button>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {activeQuery.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                    No records yet.
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const r = row as {
                    _id?: string;
                    id?: string;
                    status: string;
                    amount: number;
                    currency?: string;
                    createdAt: string;
                    providerOrderId?: string | null;
                    upiId?: string | null;
                  };
                  return (
                    <tr key={r._id ?? r.id} className="border-b border-border/60">
                      <td className="px-4 py-3">{formatTimestamp(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={r.status === 'CAPTURED' || r.status === 'COMPLETED' ? 'success' : 'neutral'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatMoney(r.amount, { currency: r.currency ?? 'INR' })}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {r.providerOrderId ?? r.upiId ?? '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <footer className="flex items-center justify-between">
        <Typography variant="caption" tone="muted">
          Page {page}
        </Typography>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={items.length < 20}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </footer>
    </PageContainer>
  );
};

export default WalletFinancialScreen;
