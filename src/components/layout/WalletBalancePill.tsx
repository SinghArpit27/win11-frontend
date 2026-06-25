import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { formatMoney } from '@features/wallet/wallet.utils';
import { useGetMyWalletQuery } from '@features/wallet/wallet.api';
import { cn } from '@utils/cn';

/**
 * Compact wallet entry-point shown in the global top bar.
 *
 *  - Mobile  : icon + amount only (no label) to stay narrow.
 *  - Desktop : icon + amount, optional inline label.
 *
 *  Touches the `useGetMyWalletQuery` cache that the dashboard already
 *  hydrates — the chip itself never triggers a redundant fetch.
 */
interface WalletBalancePillProps {
  className?: string;
  /** Force-hide the amount (icon-only). Useful for very narrow viewports. */
  iconOnly?: boolean;
}

export const WalletBalancePill = ({
  className,
  iconOnly,
}: WalletBalancePillProps): JSX.Element => {
  const navigate = useNavigate();
  const walletQuery = useGetMyWalletQuery();
  const wallet = walletQuery.data?.wallet;

  const amount = wallet
    ? formatMoney(wallet.balances.total, { currency: wallet.currency })
    : '—';

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.WALLET)}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-sm font-semibold text-text',
        'transition-colors hover:bg-surface-hover hover:border-border-strong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className,
      )}
      aria-label={`Wallet balance ${amount}`}
      title="Open wallet"
    >
      <span
        aria-hidden
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"
      >
        <Wallet className="h-3.5 w-3.5" />
      </span>
      {!iconOnly ? (
        <span className="tabular-nums leading-none">{amount}</span>
      ) : null}
    </button>
  );
};
