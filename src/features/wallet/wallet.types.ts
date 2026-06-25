import type {
  LedgerDirection,
  WalletBucket,
  WalletStatus,
  WalletTxStatus,
  WalletTxType,
} from '@shared/enums';
import type { PaginationMeta } from '@shared/types/pagination.types';

/**
 * Wire types for the wallet feature. Amounts are MINOR units (paise /
 * cents) — convert with `toMajor()` for display, `toMinor()` for input.
 */

export interface WalletBalances {
  deposit: number;
  winning: number;
  bonus: number;
  locked: number;
  total: number;
  spendable: number;
}

export interface WalletSnapshot {
  id: string;
  userId: string;
  currency: string;
  status: WalletStatus;
  balances: WalletBalances;
  totalCredited: number;
  totalDebited: number;
  transactionCount: number;
  frozenAt: string | null;
  frozenReason: string | null;
  lastTransactionAt: string | null;
}

export interface WalletTransaction {
  id: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  currency: string;
  description: string | null;
  reference: string | null;
  referenceType: string | null;
  balanceAfter: Pick<WalletBalances, 'deposit' | 'winning' | 'bonus' | 'locked'>;
  metadata: Record<string, unknown>;
  createdAt: string;
  completedAt: string | null;
  reversedById: string | null;
  reversesId: string | null;
}

export interface WalletTransactionDetail extends WalletTransaction {
  balanceBefore: Pick<WalletBalances, 'deposit' | 'winning' | 'bonus' | 'locked'>;
  ledger: Array<{
    id: string;
    direction: LedgerDirection;
    bucket: WalletBucket;
    amount: number;
    sequence: number;
    bucketBalanceBefore: number;
    bucketBalanceAfter: number;
  }>;
}

export interface WalletSummary {
  wallet: WalletSnapshot;
  breakdown: Array<{ type: WalletTxType; total: number; count: number }>;
}

export interface WalletHistoryQuery {
  page?: number;
  limit?: number;
  type?: WalletTxType;
  status?: WalletTxStatus;
  from?: string;
  to?: string;
}

export interface WalletHistoryPage {
  items: WalletTransaction[];
  meta: PaginationMeta;
}

export interface WalletDepositRequest {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
}

export interface WalletWithdrawRequest {
  amount: number;
  currency?: string;
  description?: string;
}

export interface WalletDepositResponse {
  wallet: WalletSnapshot;
  transaction: Pick<
    WalletTransaction,
    'id' | 'type' | 'status' | 'amount' | 'currency' | 'reference' | 'createdAt'
  >;
}
