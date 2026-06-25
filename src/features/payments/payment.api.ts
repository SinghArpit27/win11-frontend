import { SHARED_HEADERS } from '@constants/index';
import { baseApi } from '@store/api/base.api';

import { newIdempotencyKey } from '../wallet/wallet.utils';

export interface PaymentOrderResponse {
  paymentId: string;
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
  channel?: 'card' | 'upi';
  upiApp?: string | null;
  keyId: string;
  publishableKey?: string;
  checkoutUrl?: string | null;
  upiDeepLink?: string | null;
  simulateUpi?: boolean;
}

export type UpiAppId = 'google_pay' | 'phonepe' | 'paytm' | 'bhim' | 'other';

export interface VerifyPaymentRequest {
  paymentId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPaymentOrder: build.mutation<
      PaymentOrderResponse,
      { amount: number; currency?: string; channel?: 'card' | 'upi'; upiApp?: UpiAppId }
    >({
      query: (body) => ({
        url: '/payments/orders',
        method: 'POST',
        headers: { [SHARED_HEADERS.IDEMPOTENCY_KEY]: newIdempotencyKey('pay') },
        body: { ...body, currency: body.currency ?? 'INR' },
      }),
      invalidatesTags: ['Wallet', 'Payment'],
    }),

    completeUpiPayment: build.mutation<
      { received: boolean; event?: string },
      { paymentId: string; upiApp: UpiAppId }
    >({
      query: (body) => ({ url: '/payments/upi/complete', method: 'POST', body }),
      invalidatesTags: ['Wallet', 'Payment'],
    }),

    completeMockPayment: build.mutation<{ received: boolean }, { paymentId: string }>({
      query: (body) => ({ url: '/payments/mock/complete', method: 'POST', body }),
      invalidatesTags: ['Wallet', 'Payment'],
    }),

    verifyPayment: build.mutation<{ status: string; paymentId: string }, VerifyPaymentRequest>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Payment'],
    }),

    listMyPayments: build.query<{ items: unknown[] }, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/payments/me', params: params ?? {} }),
      providesTags: ['Payment'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreatePaymentOrderMutation,
  useCompleteMockPaymentMutation,
  useCompleteUpiPaymentMutation,
  useVerifyPaymentMutation,
  useListMyPaymentsQuery,
} = paymentsApi;
