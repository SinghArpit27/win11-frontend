import { SHARED_HEADERS } from '@constants/index';
import { baseApi } from '@store/api/base.api';
import { extractPaginationMeta } from '@store/api/pagination.helpers';

import type { AuthUser } from '@features/auth/auth.types';
import { newIdempotencyKey } from '@features/wallet/wallet.utils';
import type {
  WalletSnapshot,
  WalletTransaction,
} from '@features/wallet/wallet.types';
import type {
  AdminWalletActionType,
  AuditAction,
  AuditOutcome,
  LedgerDirection,
  UserRole,
  UserStatus,
  WalletBucket,
  WalletTxStatus,
  WalletTxType,
} from '@shared/enums';
import type { PaginationMeta } from '@shared/types/pagination.types';

/**
 * Admin endpoints. Backend mounts these under `/users/admin`,
 * `/roles`, `/audit-logs`, `/sessions/admin/...`. We `injectEndpoints`
 * into the shared `baseApi` so the admin bundle still rides the same
 * cache and refresh-token interceptor.
 */

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: UserStatus;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUpdateUserBody {
  status?: UserStatus;
  roles?: UserRole[];
  displayName?: string;
}

export interface AdminRoleSummary {
  id: string;
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
}

export interface AdminAuditLogRow {
  id: string;
  actorId: string | null;
  actorRoles: string[];
  onBehalfOfId: string | null;
  action: AuditAction;
  outcome: AuditOutcome;
  resource: string | null;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  metadata: Record<string, unknown>;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AdminAuditLogQuery {
  page?: number;
  limit?: number;
  action?: AuditAction;
  outcome?: AuditOutcome;
  actorId?: string;
  onBehalfOfId?: string;
  from?: string;
  to?: string;
}

interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ── Wallet admin types ────────────────────────────────────────────────────

export interface AdminWalletTxRow extends WalletTransaction {
  userId: string;
  walletId: string;
}

export interface AdminWalletTxQuery {
  page?: number;
  limit?: number;
  userId?: string;
  type?: WalletTxType;
  status?: WalletTxStatus;
  reference?: string;
  from?: string;
  to?: string;
}

export interface AdminWalletLookupResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    displayName: string | null;
  };
  wallet: WalletSnapshot;
}

export interface AdminWalletAdjustRequest {
  direction: LedgerDirection;
  bucket: WalletBucket;
  amount: number;
  reason: string;
  ticketRef?: string;
  notes?: string;
}

export interface AdminWalletAction {
  id: string;
  adminId: string;
  adminRoles: string[];
  targetUserId: string;
  targetWalletId: string;
  actionType: AdminWalletActionType;
  amount: number;
  currency: string;
  bucket: WalletBucket | null;
  walletTransactionId: string | null;
  reason: string;
  ticketRef: string | null;
  notes: string | null;
  requestId: string | null;
  createdAt: string;
}

export interface AdminWalletActionQuery {
  page?: number;
  limit?: number;
  actionType?: AdminWalletActionType;
  adminId?: string;
  targetUserId?: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminListUsers: build.query<ListResponse<AuthUser>, AdminUserListQuery | void>({
      query: (params) => ({ url: '/users/admin', params: params ?? {} }),
      transformResponse: (data: AuthUser[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['User'],
    }),

    adminGetUser: build.query<{ user: AuthUser }, { userId: string }>({
      query: ({ userId }) => ({ url: `/users/admin/${userId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'User', id: arg.userId }],
    }),

    adminUpdateUser: build.mutation<
      { user: AuthUser },
      { userId: string; body: AdminUpdateUserBody }
    >({
      query: ({ userId, body }) => ({
        url: `/users/admin/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'User', id: arg.userId }, 'User'],
    }),

    adminRevokeUserSessions: build.mutation<{ revoked: number }, { userId: string }>({
      query: ({ userId }) => ({
        url: `/sessions/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Session'],
    }),

    adminListRoles: build.query<{ roles: AdminRoleSummary[] }, void>({
      query: () => ({ url: '/roles' }),
      providesTags: ['Role'],
    }),

    adminListAuditLogs: build.query<ListResponse<AdminAuditLogRow>, AdminAuditLogQuery | void>({
      query: (params) => ({ url: '/audit-logs', params: params ?? {} }),
      transformResponse: (data: AdminAuditLogRow[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['AuditLog'],
    }),

    // ── Wallet admin ────────────────────────────────────────────────────
    adminListWalletTransactions: build.query<ListResponse<AdminWalletTxRow>, AdminWalletTxQuery | void>(
      {
        query: (params) => ({ url: '/wallets/admin/transactions', params: params ?? {} }),
        transformResponse: (data: AdminWalletTxRow[], meta) => ({
          items: data,
          meta: extractPaginationMeta(meta, data.length),
        }),
        providesTags: ['Wallet'],
      },
    ),

    adminLookupUserWallet: build.query<AdminWalletLookupResponse, { userId: string }>({
      query: ({ userId }) => ({ url: `/wallets/admin/users/${userId}` }),
      providesTags: (_res, _err, arg) => [{ type: 'Wallet', id: arg.userId }],
    }),

    adminAdjustWallet: build.mutation<
      { transactionId: string; wallet: WalletSnapshot },
      { userId: string; body: AdminWalletAdjustRequest }
    >({
      // Amount is sent in MAJOR units (rupees). The backend Zod schema
      // validates major bounds and converts to minor units internally —
      // pre-converting here would double-multiply by 100.
      query: ({ userId, body }) => ({
        url: `/wallets/admin/users/${userId}/adjust`,
        method: 'POST',
        headers: { [SHARED_HEADERS.IDEMPOTENCY_KEY]: newIdempotencyKey('adm-adj') },
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        'Wallet',
        { type: 'Wallet', id: arg.userId },
      ],
    }),

    adminFreezeWallet: build.mutation<
      { wallet: WalletSnapshot },
      { userId: string; reason: string }
    >({
      query: ({ userId, reason }) => ({
        url: `/wallets/admin/users/${userId}/freeze`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_res, _err, arg) => [
        'Wallet',
        { type: 'Wallet', id: arg.userId },
      ],
    }),

    adminUnfreezeWallet: build.mutation<
      { wallet: WalletSnapshot },
      { userId: string; reason: string }
    >({
      query: ({ userId, reason }) => ({
        url: `/wallets/admin/users/${userId}/unfreeze`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_res, _err, arg) => [
        'Wallet',
        { type: 'Wallet', id: arg.userId },
      ],
    }),

    adminRefundTransaction: build.mutation<
      { reversalTransactionId: string },
      { transactionId: string; reason: string }
    >({
      query: ({ transactionId, reason }) => ({
        url: `/wallets/admin/transactions/${transactionId}/refund`,
        method: 'POST',
        headers: { [SHARED_HEADERS.IDEMPOTENCY_KEY]: newIdempotencyKey('adm-rfd') },
        body: { reason },
      }),
      invalidatesTags: ['Wallet'],
    }),

    adminListWalletActions: build.query<
      ListResponse<AdminWalletAction>,
      AdminWalletActionQuery | void
    >({
      query: (params) => ({ url: '/wallets/admin/actions', params: params ?? {} }),
      transformResponse: (data: AdminWalletAction[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: ['Wallet'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminListUsersQuery,
  useAdminGetUserQuery,
  useAdminUpdateUserMutation,
  useAdminRevokeUserSessionsMutation,
  useAdminListRolesQuery,
  useAdminListAuditLogsQuery,
  useAdminListWalletTransactionsQuery,
  useAdminLookupUserWalletQuery,
  useAdminAdjustWalletMutation,
  useAdminFreezeWalletMutation,
  useAdminUnfreezeWalletMutation,
  useAdminRefundTransactionMutation,
  useAdminListWalletActionsQuery,
} = adminApi;
