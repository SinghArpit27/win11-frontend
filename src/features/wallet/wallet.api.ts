import { SHARED_HEADERS } from '@constants/index';
import { baseApi } from '@store/api/base.api';
import { extractPaginationMeta } from '@store/api/pagination.helpers';

import type {
  WalletDepositRequest,
  WalletDepositResponse,
  WalletHistoryPage,
  WalletHistoryQuery,
  WalletSnapshot,
  WalletSummary,
  WalletTransaction,
  WalletTransactionDetail,
  WalletWithdrawRequest,
} from './wallet.types';
import { newIdempotencyKey } from './wallet.utils';

/**
 * Wallet RTK Query endpoints — injected into the shared `baseApi` so we
 * inherit the auth refresh interceptor + global cache.
 *
 * Wire contract:
 *  - amounts on the wire are MAJOR units (rupees / dollars).
 *  - the backend Zod schema validates major-unit bounds then converts to
 *    MINOR units (paise / cents) inside the same transform.
 *  - clients MUST NOT pre-convert to minor units (that's a double-multiply
 *    bug) — pass the user-entered value straight through.
 *
 * Write mutations attach a freshly-generated `Idempotency-Key` header.
 */
export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyWallet: build.query<{ wallet: WalletSnapshot }, void>({
      query: () => ({ url: '/wallets/me' }),
      providesTags: ['Wallet'],
    }),

    getMyWalletSummary: build.query<WalletSummary, void>({
      query: () => ({ url: '/wallets/me/summary' }),
      providesTags: ['Wallet'],
    }),

    listMyTransactions: build.query<WalletHistoryPage, WalletHistoryQuery | void>({
      query: (params) => ({ url: '/wallets/me/transactions', params: params ?? {} }),
      transformResponse: (data: WalletTransaction[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Wallet'],
    }),

    getMyTransaction: build.query<
      { transaction: WalletTransactionDetail; ledger: WalletTransactionDetail['ledger'] },
      { transactionId: string }
    >({
      query: ({ transactionId }) => ({ url: `/wallets/me/transactions/${transactionId}` }),
    }),

    depositToMyWallet: build.mutation<WalletDepositResponse, WalletDepositRequest>({
      query: (body) => ({
        url: '/wallets/me/deposit',
        method: 'POST',
        headers: { [SHARED_HEADERS.IDEMPOTENCY_KEY]: newIdempotencyKey('dep') },
        body: { ...body, amount: toMajorNumber(body.amount) },
      }),
      invalidatesTags: ['Wallet'],
    }),

    withdrawFromMyWallet: build.mutation<WalletDepositResponse, WalletWithdrawRequest>({
      query: (body) => ({
        url: '/wallets/me/withdraw',
        method: 'POST',
        headers: { [SHARED_HEADERS.IDEMPOTENCY_KEY]: newIdempotencyKey('wdr') },
        body: { ...body, amount: toMajorNumber(body.amount) },
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
  overrideExisting: false,
});

/**
 * Coerce a form-field amount (`number` or numeric `string`) into a
 * finite number. Leaves the value in MAJOR units — the wire contract
 * expects major; the backend Zod schema does the major→minor conversion.
 */
const toMajorNumber = (amount: number | string): number => {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(n)) return 0;
  // Round to 2 decimals so floating-point noise (12.300000000001) never
  // leaks onto the wire — backend stores integer minor units anyway.
  return Math.round(n * 100) / 100;
};

export const {
  useGetMyWalletQuery,
  useGetMyWalletSummaryQuery,
  useListMyTransactionsQuery,
  useGetMyTransactionQuery,
  useDepositToMyWalletMutation,
  useWithdrawFromMyWalletMutation,
} = walletApi;
