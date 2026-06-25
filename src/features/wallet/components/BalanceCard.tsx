import { type LucideIcon } from 'lucide-react';

import { Card, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import { formatMoney } from '../wallet.utils';

interface BalanceCardProps {
  title: string;
  amount: number;
  currency?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  className?: string;
}

const TONE_BG: Record<NonNullable<BalanceCardProps['tone']>, string> = {
  default: 'bg-surface',
  primary: 'bg-gradient-card',
  success: 'bg-[color-mix(in_srgb,var(--w11-color-success)_10%,var(--w11-color-surface))]',
  warning: 'bg-[color-mix(in_srgb,var(--w11-color-warning)_10%,var(--w11-color-surface))]',
};

/**
 * Compact balance display tile. Used on the wallet dashboard for each
 * bucket and the aggregate "Total balance" card.
 */
export const BalanceCard = ({
  title,
  amount,
  currency,
  tone = 'default',
  icon: Icon,
  hint,
  loading,
  className,
}: BalanceCardProps): JSX.Element => {
  return (
    <Card padding="lg" className={cn(TONE_BG[tone], className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography variant="caption" tone="muted">
            {title}
          </Typography>
          {loading ? (
            <div className="h-7 w-32 animate-pulse rounded-md bg-surface-elevated" aria-hidden />
          ) : (
            <Typography variant="h3" className="font-semibold">
              {formatMoney(amount, { currency })}
            </Typography>
          )}
          {hint ? (
            <Typography variant="caption" tone="muted" className="block">
              {hint}
            </Typography>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              tone === 'primary'
                ? 'bg-primary-muted text-primary'
                : 'bg-surface-elevated text-text-muted',
            )}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </Card>
  );
};
