import { X } from 'lucide-react';
import { useMemo } from 'react';

import { Button, Typography } from '@components/ui';
import { WalletTxStatus, WalletTxType } from '@shared/enums';
import { cn } from '@utils/cn';

interface TransactionFiltersProps {
  type: WalletTxType | '';
  status: WalletTxStatus | '';
  onChange: (next: { type?: WalletTxType | ''; status?: WalletTxStatus | '' }) => void;
}

/**
 * Wallet history filter bar. Designed for touch — a row of pill-shaped
 * toggle chips that wrap onto multiple lines on narrow screens.
 */
export const TransactionFilters = ({
  type,
  status,
  onChange,
}: TransactionFiltersProps): JSX.Element => {
  const hasFilters = type !== '' || status !== '';
  const typeOptions = useMemo(
    () => [
      { value: WalletTxType.DEPOSIT, label: 'Deposit' },
      { value: WalletTxType.WITHDRAW, label: 'Withdraw' },
      { value: WalletTxType.WINNING_CREDIT, label: 'Winnings' },
      { value: WalletTxType.BONUS_CREDIT, label: 'Bonus' },
      { value: WalletTxType.CONTEST_JOIN, label: 'Contest join' },
      { value: WalletTxType.CONTEST_REFUND, label: 'Contest refund' },
      { value: WalletTxType.ADMIN_ADJUSTMENT, label: 'Adjustment' },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Typography variant="caption" tone="muted" className="mr-1">
          Type
        </Typography>
        {typeOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={type === opt.value}
            onClick={() => onChange({ type: type === opt.value ? '' : opt.value })}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Typography variant="caption" tone="muted" className="mr-1">
          Status
        </Typography>
        {Object.values(WalletTxStatus).map((opt) => (
          <Chip
            key={opt}
            label={opt}
            active={status === opt}
            onClick={() => onChange({ status: status === opt ? '' : opt })}
          />
        ))}

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => onChange({ type: '', status: '' })}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const Chip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-pill border px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-primary bg-primary text-[var(--w11-color-primary-foreground)]'
        : 'border-border bg-surface text-text-muted hover:bg-surface-elevated',
    )}
    aria-pressed={active}
  >
    {label}
  </button>
);
