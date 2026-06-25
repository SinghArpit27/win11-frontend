import { Inbox } from 'lucide-react';

import { Button, Card, Skeleton, Typography } from '@components/ui';

import type { WalletTransaction } from '../wallet.types';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  items: WalletTransaction[];
  loading?: boolean;
  emptyHint?: string;
  onSelect?: (transactionId: string) => void;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
}

/**
 * Renders a list of transactions with skeleton + empty states baked in.
 * Used both on the wallet dashboard (recent N) and the dedicated
 * history screen (paginated).
 */
export const TransactionList = ({
  items,
  loading,
  emptyHint,
  onSelect,
  onLoadMore,
  canLoadMore,
  isLoadingMore,
}: TransactionListProps): JSX.Element => {
  if (loading && items.length === 0) {
    return (
      <div className="space-y-3" aria-live="polite" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} padding="md" className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card padding="xl" className="flex flex-col items-center justify-center gap-2 text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-text-muted"
          aria-hidden
        >
          <Inbox className="h-5 w-5" />
        </span>
        <Typography variant="h4">No transactions yet</Typography>
        <Typography variant="body" tone="muted" className="max-w-sm">
          {emptyHint ?? 'When you add money, withdraw, or join contests, the activity will appear here.'}
        </Typography>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((t) => (
        <TransactionRow
          key={t.id}
          transaction={t}
          onClick={onSelect ? () => onSelect(t.id) : undefined}
        />
      ))}
      {onLoadMore && canLoadMore ? (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} loading={isLoadingMore}>
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
};
