import { ArrowUpRight, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { formatMoney } from '@features/wallet/wallet.utils';
import { useGetMyWalletQuery } from '@features/wallet/wallet.api';
import { cn } from '@utils/cn';

/**
 * Compact wallet summary widget shown on the home dashboard.
 *
 *  Why a widget instead of nav?
 *   → Money-related glanceability is critical for the fantasy use case
 *     (users need to know they have enough to enter contests). Surfacing
 *     the spendable balance front-and-centre saves a tab swap.
 *
 *  Read path: uses the existing `useGetMyWalletQuery` from the wallet
 *  feature — no duplicate endpoint, no duplicate cache.
 */
interface WalletSummaryWidgetProps {
  className?: string;
}

export const WalletSummaryWidget = ({ className }: WalletSummaryWidgetProps): JSX.Element => {
  const navigate = useNavigate();
  const walletQuery = useGetMyWalletQuery();
  const wallet = walletQuery.data?.wallet;

  return (
    <Card
      variant="gradient"
      padding="lg"
      className={cn('relative overflow-hidden text-white shadow-glow', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_55%)]"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Typography variant="caption" className="flex items-center gap-1.5 text-white/70">
            <WalletIcon className="h-3.5 w-3.5" />
            Total balance
          </Typography>
          {walletQuery.isLoading ? (
            <Skeleton className="h-7 w-32 bg-white/20" />
          ) : (
            <Typography
              variant="h2"
              className="block text-2xl font-bold tabular-nums text-white sm:text-3xl"
            >
              {wallet
                ? formatMoney(wallet.balances.total, { currency: wallet.currency })
                : '—'}
            </Typography>
          )}
          <Typography variant="caption" className="block text-white/70">
            {wallet ? `${wallet.currency} · across all buckets` : 'Tap to set up your wallet'}
          </Typography>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.WALLET)}
          className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Open <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
        </button>
      </div>

      {wallet ? (
        <div className="relative mt-4 grid grid-cols-3 gap-2 text-[11px]">
          <BalancePill label="Deposit" amount={wallet.balances.deposit} currency={wallet.currency} />
          <BalancePill label="Winnings" amount={wallet.balances.winning} currency={wallet.currency} />
          <BalancePill label="Bonus" amount={wallet.balances.bonus} currency={wallet.currency} />
        </div>
      ) : null}
    </Card>
  );
};

const BalancePill = ({
  label,
  amount,
  currency,
}: {
  label: string;
  amount: number;
  currency: string;
}): JSX.Element => (
  <div className="rounded-lg bg-white/10 px-2.5 py-1.5">
    <div className="text-white/70">{label}</div>
    <div className="truncate font-semibold tabular-nums">
      {formatMoney(amount, { currency })}
    </div>
  </div>
);
