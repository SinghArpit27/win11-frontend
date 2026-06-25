import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Lock,
  Plus,
  Trophy,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  PageContainer,
  PageHeader,
  ResponsiveGrid,
} from '@components/layout';
import { Button, Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useAppDispatch } from '@hooks/index';
import { showToast } from '@store/slices/app.slice';

import { AddCashModal } from '../components/AddCashModal';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { TransactionList } from '../components/TransactionList';
import { WithdrawModal } from '../components/WithdrawModal';
import { useVerifyPaymentMutation } from '@features/payments/payment.api';
import { consumePendingDepositPayment } from '@features/payments/stripe.checkout';
import { formatMoney } from '../wallet.utils';
import {
  useGetMyWalletQuery,
  useListMyTransactionsQuery,
} from '../wallet.api';
import { WalletStatus } from '@shared/enums';

/**
 * Top-level wallet dashboard.
 *
 * Responsive layout:
 *  - mobile  → stacked hero, bucket cards in a single column,
 *  - sm      → buckets in 2 columns,
 *  - lg+     → premium dashboard: hero spans full content row, buckets
 *               in 4 columns, recent activity laid out next to a side
 *               panel of quick actions.
 *
 * All amounts shown via `formatMoney()` so currency + locale stay
 * white-label and consistent with the rest of the wallet feature.
 */
const WalletDashboardScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const walletQuery = useGetMyWalletQuery();
  const txnsQuery = useListMyTransactionsQuery({ page: 1, limit: 5 });
  const [verifyPayment] = useVerifyPaymentMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const depositStatus = searchParams.get('deposit');
    const sessionId = searchParams.get('session_id');
    if (depositStatus !== 'success' || !sessionId) return;

    const paymentId = consumePendingDepositPayment();
    if (!paymentId) {
      setSearchParams({}, { replace: true });
      return;
    }

    void verifyPayment({
      paymentId,
      providerOrderId: sessionId,
      providerPaymentId: '',
      signature: '',
    })
      .then((res) => {
        if ('data' in res && res.data.status === 'pending_upi') {
          dispatch(
            showToast({
              message: 'Complete the payment in your UPI app. Your wallet updates automatically once confirmed.',
              variant: 'info',
            }),
          );
        }
      })
      .finally(() => {
        void walletQuery.refetch();
        void txnsQuery.refetch();
        setSearchParams({}, { replace: true });
      });
  }, [dispatch, searchParams, setSearchParams, verifyPayment, walletQuery, txnsQuery]);

  const wallet = walletQuery.data?.wallet;
  const isFrozen = wallet?.status === WalletStatus.FROZEN;
  const canWithdraw = (wallet?.balances.winning ?? 0) + (wallet?.balances.deposit ?? 0) > 0;

  const buckets = useMemo(
    () => [
      {
        title: 'Deposit',
        amount: wallet?.balances.deposit ?? 0,
        icon: WalletIcon,
        hint: 'Top-ups & refunds',
      },
      {
        title: 'Winnings',
        amount: wallet?.balances.winning ?? 0,
        icon: Trophy,
        hint: 'Withdrawable',
        tone: 'success' as const,
      },
      {
        title: 'Bonus',
        amount: wallet?.balances.bonus ?? 0,
        icon: Gift,
        hint: 'Promo credits (non-withdrawable)',
      },
      {
        title: 'Locked',
        amount: wallet?.balances.locked ?? 0,
        icon: Lock,
        hint: 'In active contests',
        tone: 'warning' as const,
      },
    ],
    [wallet],
  );

  return (
    <PageContainer as="div" className="gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Wallet"
        title="Your money, your way"
        subtitle="Add cash, withdraw winnings, and track every credit / debit with a transparent ledger."
        actions={
          <>
            <Button
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setAddOpen(true)}
              disabled={isFrozen}
            >
              Add cash
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowUpRight className="h-4 w-4" />}
              onClick={() => setWithdrawOpen(true)}
              disabled={isFrozen || !canWithdraw}
            >
              Withdraw
            </Button>
            <Button variant="ghost" size="md" onClick={() => navigate(ROUTES.WALLET_FINANCIAL)}>
              Deposits & withdrawals
            </Button>
            <Button variant="ghost" size="md" onClick={() => navigate(ROUTES.KYC)}>
              KYC
            </Button>
          </>
        }
      />

      <Card
        padding="xl"
        variant="gradient"
        className="relative overflow-hidden border-0 text-white shadow-glow"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <Typography variant="caption" className="text-white/70">
              Total balance
            </Typography>
            <Typography
              variant="h1"
              className="text-4xl font-bold tabular-nums text-white sm:text-5xl lg:text-6xl"
            >
              {wallet
                ? formatMoney(wallet.balances.total, {
                    currency: wallet.currency,
                  })
                : '—'}
            </Typography>
            <Typography variant="caption" className="text-white/70">
              {wallet
                ? `Across deposit, winnings & bonus · ${wallet.currency}`
                : 'Loading…'}
            </Typography>
          </div>
        </div>

        {isFrozen ? (
          <div className="relative mt-5 rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white">
            Your wallet is currently frozen
            {wallet?.frozenReason ? `: ${wallet.frozenReason}` : ''}.
          </div>
        ) : null}
      </Card>

      <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 4 }} gap="md">
        {buckets.map((b) => (
          <BalanceCard
            key={b.title}
            title={b.title}
            amount={b.amount}
            currency={wallet?.currency}
            icon={b.icon}
            hint={b.hint}
            tone={('tone' in b ? b.tone : undefined) ?? 'default'}
            loading={walletQuery.isLoading}
          />
        ))}
      </ResponsiveGrid>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="h3" className="text-xl font-bold sm:text-2xl">
            Recent activity
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowDownLeft className="h-4 w-4 rotate-180" />}
            onClick={() => navigate(ROUTES.WALLET_HISTORY)}
          >
            View all
          </Button>
        </div>
        <TransactionList
          items={txnsQuery.data?.items ?? []}
          loading={txnsQuery.isLoading}
          onSelect={setDetailId}
          emptyHint="Once you add money or play a contest, your activity will show up here."
        />
      </section>

      <AddCashModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => {
          walletQuery.refetch();
          txnsQuery.refetch();
        }}
      />
      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        wallet={wallet}
        onSuccess={() => {
          walletQuery.refetch();
          txnsQuery.refetch();
        }}
      />
      <TransactionDetailModal
        transactionId={detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
      />
    </PageContainer>
  );
};

export default WalletDashboardScreen;
