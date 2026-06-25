import { baseApi } from '@store/api/base.api';
import { SHARED_HEADERS } from '@constants/index';

import { newIdempotencyKey } from '../wallet/wallet.utils';

export const withdrawalsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestWithdrawal: build.mutation<
      { withdrawal: { id: string; status: string; amount: number } },
      { amount: number; currency?: string; upiId?: string; bankAccountRef?: string }
    >({
      query: (body) => ({
        url: '/withdrawals',
        method: 'POST',
        headers: { [SHARED_HEADERS.IDEMPOTENCY_KEY]: newIdempotencyKey('wdr') },
        body: { ...body, currency: body.currency ?? 'INR' },
      }),
      invalidatesTags: ['Wallet', 'Withdrawal'],
    }),

    listMyWithdrawals: build.query<{ items: unknown[] }, { page?: number } | void>({
      query: (params) => ({ url: '/withdrawals/me', params: params ?? {} }),
      providesTags: ['Withdrawal'],
    }),
  }),
  overrideExisting: false,
});

export const { useRequestWithdrawalMutation, useListMyWithdrawalsQuery } = withdrawalsApi;
