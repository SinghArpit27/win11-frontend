import {
  AlertTriangle,
  ArrowLeft,
  Gift,
  Lock,
  Pencil,
  Trophy,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { BalanceCard } from '@features/wallet/components/BalanceCard';
import { TransactionDetailModal } from '@features/wallet/components/TransactionDetailModal';
import { TransactionList } from '@features/wallet/components/TransactionList';
import { WalletStatus } from '@shared/enums';

import {
  useAdminFreezeWalletMutation,
  useAdminListWalletTransactionsQuery,
  useAdminLookupUserWalletQuery,
  useAdminUnfreezeWalletMutation,
} from '../admin.api';
import { AdminWalletAdjustModal } from '../components/AdminWalletAdjustModal';

/**
 * Admin → wallet detail for a specific user.
 *
 * Surfaces the same bucket overview a user sees in their app PLUS the
 * full transaction list, freeze/unfreeze toggle, and an "Adjust balance"
 * affordance. Used by support to investigate disputed transactions.
 */
const AdminWalletUserDetailScreen = (): JSX.Element => {
  const { userId } = useParams<{ userId: string }>();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const lookup = useAdminLookupUserWalletQuery(
    userId ? { userId } : (undefined as never),
    { skip: !userId },
  );
  const txns = useAdminListWalletTransactionsQuery(
    userId ? { userId, page: 1, limit: 20 } : (undefined as never),
    { skip: !userId },
  );
  const [freeze, freezeState] = useAdminFreezeWalletMutation();
  const [unfreeze, unfreezeState] = useAdminUnfreezeWalletMutation();

  const wallet = lookup.data?.wallet;
  const isFrozen = wallet?.status === WalletStatus.FROZEN;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back to wallets">
          <Link to={ROUTES.ADMIN_WALLETS}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          {lookup.isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <>
              <Typography variant="h3" className="truncate">
                {lookup.data?.user.displayName ?? lookup.data?.user.email ?? lookup.data?.user.phone ?? 'User'}
              </Typography>
              <Typography variant="caption" tone="muted" className="font-mono">
                {lookup.data?.user.id}
              </Typography>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setAdjustOpen(true)} disabled={!userId}>
            Adjust balance
          </Button>
          {isFrozen ? (
            <Button
              variant="outline"
              loading={unfreezeState.isLoading}
              onClick={() =>
                userId &&
                unfreeze({ userId, reason: prompt('Reason for unfreezing?')?.trim() || 'Unfrozen by admin' })
              }
            >
              Unfreeze wallet
            </Button>
          ) : (
            <Button
              variant="danger"
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              loading={freezeState.isLoading}
              onClick={() =>
                userId &&
                freeze({ userId, reason: prompt('Reason for freezing?')?.trim() || 'Frozen by admin' })
              }
            >
              Freeze wallet
            </Button>
          )}
        </div>
      </header>

      {wallet && isFrozen ? (
        <Card padding="md" className="border border-warning/40 bg-[color-mix(in_srgb,var(--w11-color-warning)_8%,var(--w11-color-surface))]">
          <Typography variant="label" tone="warning">
            Wallet frozen
          </Typography>
          <Typography variant="caption" tone="muted">
            {wallet.frozenReason ?? '—'}
            {wallet.frozenAt ? ` · since ${new Date(wallet.frozenAt).toLocaleString()}` : ''}
          </Typography>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard
          title="Deposit"
          amount={wallet?.balances.deposit ?? 0}
          currency={wallet?.currency}
          icon={WalletIcon}
          loading={lookup.isLoading}
        />
        <BalanceCard
          title="Winnings"
          amount={wallet?.balances.winning ?? 0}
          currency={wallet?.currency}
          icon={Trophy}
          loading={lookup.isLoading}
          tone="success"
        />
        <BalanceCard
          title="Bonus"
          amount={wallet?.balances.bonus ?? 0}
          currency={wallet?.currency}
          icon={Gift}
          loading={lookup.isLoading}
        />
        <BalanceCard
          title="Locked"
          amount={wallet?.balances.locked ?? 0}
          currency={wallet?.currency}
          icon={Lock}
          loading={lookup.isLoading}
          tone="warning"
        />
      </section>

      {wallet ? (
        <Card padding="md" className="flex flex-wrap items-center gap-3">
          <Badge tone="neutral">Status: {wallet.status}</Badge>
          <Badge tone="primary">Credited: {wallet.totalCredited}</Badge>
          <Badge tone="primary">Debited: {wallet.totalDebited}</Badge>
          <Badge tone="primary">Transactions: {wallet.transactionCount}</Badge>
        </Card>
      ) : null}

      <section className="space-y-3">
        <Typography variant="h4">Transactions</Typography>
        <TransactionList
          items={txns.data?.items ?? []}
          loading={txns.isLoading || txns.isFetching}
          onSelect={setDetailId}
        />
      </section>

      <AdminWalletAdjustModal
        open={adjustOpen}
        userId={userId ?? null}
        onOpenChange={setAdjustOpen}
        onSuccess={() => {
          lookup.refetch();
          txns.refetch();
        }}
      />

      <TransactionDetailModal
        transactionId={detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
      />
    </div>
  );
};

export default AdminWalletUserDetailScreen;
