import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import {
  Badge,
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  Skeleton,
  Typography,
} from '@components/ui';
import { LedgerDirection } from '@shared/enums';
import { cn } from '@utils/cn';

import { useGetMyTransactionQuery } from '../wallet.api';
import { formatMoney, formatTimestamp } from '../wallet.utils';

interface TransactionDetailModalProps {
  transactionId: string | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Drill-in modal showing one transaction's metadata + the raw ledger
 * entries that backed it. Helps users / support understand exactly
 * where the money moved.
 */
export const TransactionDetailModal = ({
  transactionId,
  onOpenChange,
}: TransactionDetailModalProps): JSX.Element => {
  const open = !!transactionId;
  const { data, isFetching } = useGetMyTransactionQuery(
    transactionId ? { transactionId } : (undefined as never),
    { skip: !transactionId },
  );

  const txn = data?.transaction;
  const ledger = data?.ledger ?? [];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent aria-label="Transaction details" className="md:max-w-lg">
        <ModalHeader>
          <ModalTitle>Transaction details</ModalTitle>
          <ModalDescription>
            {txn ? formatTimestamp(txn.createdAt) : 'Loading…'}
          </ModalDescription>
        </ModalHeader>

        {isFetching || !txn ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <Typography variant="h2" className="font-semibold">
                {formatMoney(txn.amount, { currency: txn.currency })}
              </Typography>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{txn.type}</Badge>
                <Badge
                  tone={
                    txn.status === 'COMPLETED'
                      ? 'success'
                      : txn.status === 'FAILED'
                      ? 'danger'
                      : 'neutral'
                  }
                >
                  {txn.status}
                </Badge>
                {txn.reversedById ? <Badge tone="warning">Reversed</Badge> : null}
              </div>
              {txn.description ? (
                <Typography variant="body" className="mt-2 text-text-muted">
                  {txn.description}
                </Typography>
              ) : null}
            </div>

            <KeyValue label="Transaction id" value={txn.id} mono />
            {txn.reference ? (
              <KeyValue label="Reference" value={`${txn.referenceType ?? 'ref'}: ${txn.reference}`} />
            ) : null}
            {txn.reversedById ? (
              <KeyValue label="Reversed by" value={txn.reversedById} mono />
            ) : null}

            <section>
              <Typography variant="label" tone="muted" className="block">
                Ledger entries
              </Typography>
              <ul className="mt-2 space-y-2">
                {ledger.length === 0 ? (
                  <Typography variant="caption" tone="muted">
                    No ledger entries available.
                  </Typography>
                ) : (
                  ledger.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-md bg-surface-elevated px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        {entry.direction === LedgerDirection.CREDIT ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-medium">{entry.direction}</span>
                        <span className="text-text-muted">{entry.bucket}</span>
                      </span>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          entry.direction === LedgerDirection.CREDIT ? 'text-success' : 'text-warning',
                        )}
                      >
                        {entry.direction === LedgerDirection.CREDIT ? '+' : '-'}
                        {formatMoney(entry.amount, { currency: txn.currency })}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

const KeyValue = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): JSX.Element => (
  <div className="flex items-start justify-between gap-3">
    <Typography variant="caption" tone="muted" className="shrink-0">
      {label}
    </Typography>
    <Typography
      variant="caption"
      className={cn('text-right', mono && 'font-mono text-[11px] break-all')}
    >
      {value}
    </Typography>
  </div>
);
