import { baseApi } from '@store/api/base.api';
import { extractPaginationMeta } from '@store/api/pagination.helpers';

import type { PaginationMeta } from '@shared/types/pagination.types';

export interface AdminPaymentRow {
  _id: string;
  userId: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  providerOrderId: string | null;
  createdAt: string;
}

export interface AdminWithdrawalRow {
  _id: string;
  userId: string;
  status: string;
  amount: number;
  currency: string;
  upiId: string | null;
  createdAt: string;
}

export interface AdminKycRow {
  _id: string;
  userId: string;
  status: string;
  fullName: string | null;
  submittedAt: string | null;
}

export interface AdminRiskFlagRow {
  _id: string;
  userId: string;
  type: string;
  status: string;
  severity: string;
  reason: string;
  createdAt: string;
}

export interface AdminSettlementRow {
  _id: string;
  type: string;
  status: string;
  userId: string;
  amount: number;
  currency: string;
  referenceId: string | null;
  createdAt: string;
}

interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export const financialAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminListPayments: build.query<ListResponse<AdminPaymentRow>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/payments/admin', params: params ?? {} }),
      transformResponse: (data: AdminPaymentRow[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Payment'],
    }),

    adminListPendingWithdrawals: build.query<
      ListResponse<AdminWithdrawalRow>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: '/withdrawals/admin/pending', params: params ?? {} }),
      transformResponse: (data: AdminWithdrawalRow[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Withdrawal'],
    }),

    adminApproveWithdrawal: build.mutation<{ withdrawal: AdminWithdrawalRow }, { withdrawalId: string }>({
      query: ({ withdrawalId }) => ({
        url: `/withdrawals/admin/${withdrawalId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Withdrawal', 'Wallet', 'Settlement'],
    }),

    adminRejectWithdrawal: build.mutation<
      { withdrawal: AdminWithdrawalRow },
      { withdrawalId: string; reason: string }
    >({
      query: ({ withdrawalId, reason }) => ({
        url: `/withdrawals/admin/${withdrawalId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Withdrawal', 'Wallet'],
    }),

    adminListPendingKyc: build.query<ListResponse<AdminKycRow>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/kyc/admin/pending', params: params ?? {} }),
      transformResponse: (data: AdminKycRow[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Kyc'],
    }),

    adminApproveKyc: build.mutation<{ profile: AdminKycRow }, { profileId: string }>({
      query: ({ profileId }) => ({
        url: `/kyc/admin/${profileId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Kyc'],
    }),

    adminRejectKyc: build.mutation<{ profile: AdminKycRow }, { profileId: string; reason: string }>({
      query: ({ profileId, reason }) => ({
        url: `/kyc/admin/${profileId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Kyc'],
    }),

    adminListRiskFlags: build.query<ListResponse<AdminRiskFlagRow>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/admin/financial/flags', params: params ?? {} }),
      transformResponse: (data: AdminRiskFlagRow[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Settlement'],
    }),

    adminResolveRiskFlag: build.mutation<{ resolved: boolean }, { flagId: string }>({
      query: ({ flagId }) => ({
        url: `/admin/financial/flags/${flagId}/resolve`,
        method: 'POST',
      }),
      invalidatesTags: ['Settlement'],
    }),

    adminListSettlements: build.query<
      ListResponse<AdminSettlementRow>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: '/admin/financial/settlements', params: params ?? {} }),
      transformResponse: (data: AdminSettlementRow[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Settlement'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminListPaymentsQuery,
  useAdminListPendingWithdrawalsQuery,
  useAdminApproveWithdrawalMutation,
  useAdminRejectWithdrawalMutation,
  useAdminListPendingKycQuery,
  useAdminApproveKycMutation,
  useAdminRejectKycMutation,
  useAdminListRiskFlagsQuery,
  useAdminResolveRiskFlagMutation,
  useAdminListSettlementsQuery,
} = financialAdminApi;
