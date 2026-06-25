import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Receipt,
  RotateCcw,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import { Badge, Card, Typography } from '@components/ui';
import { WalletTxStatus, WalletTxType } from '@shared/enums';
import { cn } from '@utils/cn';

import type { WalletTransaction } from '../wallet.types';
import { formatMoney, formatTimestamp } from '../wallet.utils';

interface TransactionRowProps {
  transaction: WalletTransaction;
  onClick?: () => void;
}

const TYPE_META: Record<
  WalletTxType,
  { label: string; icon: LucideIcon; tone: 'success' | 'danger' | 'warning' | 'neutral' | 'primary' | 'accent' | 'info' | 'solid'; sign: '+' | '-' | '' }
> = {
  [WalletTxType.DEPOSIT]: { label: 'Deposit', icon: ArrowDownLeft, tone: 'success', sign: '+' },
  [WalletTxType.WITHDRAW]: { label: 'Withdrawal', icon: ArrowUpRight, tone: 'warning', sign: '-' },
  [WalletTxType.CONTEST_JOIN]: { label: 'Contest join', icon: Receipt, tone: 'neutral', sign: '-' },
  [WalletTxType.CONTEST_REFUND]: { label: 'Contest refund', icon: RotateCcw, tone: 'info', sign: '+' },
  [WalletTxType.WINNING_CREDIT]: { label: 'Winnings', icon: Trophy, tone: 'success', sign: '+' },
  [WalletTxType.BONUS_CREDIT]: { label: 'Bonus', icon: Gift, tone: 'accent', sign: '+' },
  [WalletTxType.ADMIN_ADJUSTMENT]: { label: 'Adjustment', icon: Receipt, tone: 'primary', sign: '' },
};

const STATUS_TONE: Record<WalletTxStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  [WalletTxStatus.COMPLETED]: 'success',
  [WalletTxStatus.PENDING]: 'warning',
  [WalletTxStatus.FAILED]: 'danger',
  [WalletTxStatus.REVERSED]: 'neutral',
};

/**
 * A single row in the wallet transaction history.
 *
 * Touch-friendly card layout on mobile; collapses to a tight table-cell
 * style on tablets+ when used inside `TransactionList`'s grid. We avoid
 * `<button>` so the row can be wrapped in `<Link>` from callers when
 * navigation is preferred over an in-page modal.
 */
export const TransactionRow = ({ transaction, onClick }: TransactionRowProps): JSX.Element => {
  const meta = TYPE_META[transaction.type] ?? TYPE_META[WalletTxType.ADMIN_ADJUSTMENT];
  const Icon = meta.icon;
  const interactive = !!onClick;

  return (
    <Card
      padding="md"
      interactive={interactive}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3',
        interactive && 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
      )}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text"
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Typography variant="body" className="truncate font-medium">
            {transaction.description ?? meta.label}
          </Typography>
          <Typography
            variant="body"
            className={cn(
              'font-semibold tabular-nums',
              meta.sign === '+' && 'text-success',
              meta.sign === '-' && 'text-warning',
            )}
          >
            {meta.sign}
            {formatMoney(transaction.amount, { currency: transaction.currency })}
          </Typography>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          <Badge tone={STATUS_TONE[transaction.status]}>{transaction.status}</Badge>
          <Typography variant="caption" tone="muted" className="ml-auto">
            {formatTimestamp(transaction.createdAt)}
          </Typography>
        </div>
      </div>
    </Card>
  );
};
