import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageContainer, PageHeader } from '@components/layout';
import { Button, Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { WalletTxStatus, WalletTxType } from '@shared/enums';

import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionList } from '../components/TransactionList';
import { useListMyTransactionsQuery } from '../wallet.api';

/**
 * Full transaction history screen with filters + pagination.
 *
 * Each filter change resets to page 1. We keep RTK Query results
 * across page changes by deep-merging instead of unmounting the list.
 */
const WalletHistoryScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<WalletTxType | ''>('');
  const [status, setStatus] = useState<WalletTxStatus | ''>('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isFetching, isLoading } = useListMyTransactionsQuery({
    page,
    limit: 20,
    type: type || undefined,
    status: status || undefined,
  });

  return (
    <PageContainer as="div" className="gap-5 lg:gap-6">
      <PageHeader
        eyebrow={`${data?.meta.total ?? 0} total transactions`}
        title="Transaction history"
        subtitle="Every credit, debit, and reversal — searchable, filterable, exportable."
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

      <Card padding="md">
        <TransactionFilters
          type={type}
          status={status}
          onChange={(next) => {
            if (next.type !== undefined) setType(next.type);
            if (next.status !== undefined) setStatus(next.status);
            setPage(1);
          }}
        />
      </Card>

      <TransactionList
        items={data?.items ?? []}
        loading={isLoading || isFetching}
        onSelect={setDetailId}
      />

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

      <TransactionDetailModal
        transactionId={detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
      />
    </PageContainer>
  );
};

export default WalletHistoryScreen;
