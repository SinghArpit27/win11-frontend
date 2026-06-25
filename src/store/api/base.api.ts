import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { appConfig } from '@config/index';
import { CLIENT_PLATFORM, SHARED_HEADERS, STORAGE_KEYS } from '@constants/index';
import { loggedOut, tokensRefreshed } from '@features/auth/auth.slice';
import { authStorage } from '@features/auth/auth.storage';
import { errorReporter } from '@services/logging';
import { localStore } from '@services/storage';
import { logger } from '@utils/logger';

/**
 * Single RTK Query slice that every feature `injectEndpoints()` into.
 *
 * Pipeline (bottom → top):
 *  1. `rawBaseQuery`      — fetch + shared headers + bearer token.
 *  2. `envelopeBaseQuery` — unwrap backend's `ApiResponse<T>` envelope.
 *  3. `authRefreshQuery`  — on 401/TOKEN_EXPIRED, attempt a refresh,
 *                           replay the original request once, otherwise
 *                           dispatch `loggedOut({ force: true })`.
 *
 * Feature APIs `injectEndpoints` into the `baseApi` — keeps cache, tags,
 * and middleware unified.
 */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: appConfig.api.fullBaseUrl,
  timeout: appConfig.api.timeoutMs,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set(SHARED_HEADERS.CLIENT_PLATFORM, CLIENT_PLATFORM);
    headers.set(SHARED_HEADERS.CLIENT_VERSION, appConfig.appVersion);
    headers.set(SHARED_HEADERS.REQUEST_ID, crypto.randomUUID());

    const deviceId = localStore.get<string>(STORAGE_KEYS.DEVICE_ID);
    if (deviceId) headers.set(SHARED_HEADERS.DEVICE_ID, deviceId);

    const token = localStore.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const envelopeBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, never>,
  { envelopeMeta?: Record<string, unknown> }
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) return result;

  const body = result.data as {
    success?: boolean;
    data?: unknown;
    meta?: Record<string, unknown>;
    error?: { code: string; message: string };
  };
  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success === true) {
      // Forward backend `meta` (e.g. pagination) into RTK Query's `meta`
      // so list endpoints can read it from `transformResponse`.
      const previousMeta = (result.meta ?? {}) as Record<string, unknown>;
      return {
        ...result,
        data: body.data,
        meta: { ...previousMeta, envelopeMeta: body.meta },
      };
    }
    logger.warn('api envelope error', { code: body.error?.code, message: body.error?.message });
    errorReporter.addBreadcrumb({
      category: 'http',
      level: 'warn',
      message: `api ${body.error?.code ?? 'ERROR'} ${body.error?.message ?? ''}`,
      data: { code: body.error?.code },
    });
    return {
      error: {
        status: 'CUSTOM_ERROR',
        data: body,
        error: body.error?.message ?? 'Unknown API error',
      } as FetchBaseQueryError,
    };
  }
  return result;
};

// ─── Refresh-token interceptor ─────────────────────────────────────────────
// Coalesces concurrent 401s into a single refresh call so we don't fan out
// N parallel `/auth/refresh` requests when a tab regains focus.
let pendingRefresh: Promise<boolean> | null = null;

const isAuthExpiredError = (error: FetchBaseQueryError): boolean => {
  if (error.status === 401) return true;
  if (error.status === 'CUSTOM_ERROR') {
    const code = (error.data as { error?: { code?: string } } | undefined)?.error?.code;
    return code === 'TOKEN_EXPIRED' || code === 'UNAUTHORIZED';
  }
  return false;
};

const performRefresh = async (api: Parameters<BaseQueryFn>[1]): Promise<boolean> => {
  const refreshToken = authStorage.getRefreshToken();
  const result = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: refreshToken ? { refreshToken } : {},
    },
    api,
    {},
  );

  if (result.error) {
    logger.warn('refresh.failed', result.error);
    return false;
  }

  const body = result.data as {
    success?: boolean;
    data?: { accessToken: string; refreshToken: string };
  };
  if (!body?.success || !body.data?.accessToken) return false;

  api.dispatch(
    tokensRefreshed({
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
    }),
  );
  return true;
};

const authRefreshQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await envelopeBaseQuery(args, api, extraOptions);

  // Don't try to refresh the refresh endpoint itself (avoid loops).
  const reqUrl = typeof args === 'string' ? args : args.url;
  const isAuthEndpoint = reqUrl.startsWith('/auth/refresh') || reqUrl.startsWith('/auth/login');

  if (result.error && isAuthExpiredError(result.error) && !isAuthEndpoint) {
    if (!pendingRefresh) {
      pendingRefresh = performRefresh(api).finally(() => {
        pendingRefresh = null;
      });
    }
    const refreshed = await pendingRefresh;
    if (refreshed) {
      result = await envelopeBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(loggedOut({ force: true }));
    }
  }

  return result;
};

export const TAG_TYPES = [
  'Health',
  'User',
  'Me',
  'Session',
  'Role',
  'AuditLog',
  'Wallet',
  'Match',
  'Contest',
  // PHASE 6 — Contest sub-entities
  'ContestEntry',
  'ContestTemplate',
  'PrizeDistribution',
  'Notification',
  'Payment',
  'Withdrawal',
  'Kyc',
  'Settlement',
  // PHASE 5
  'FantasyTeam',
  'FantasyDraft',
  'FantasyRule',
  'FantasyMatchContext',
  // PHASE 7 — scoring + leaderboard + settlement
  'FantasyPoints',
  'Leaderboard',
  'UserRank',
  'RankHistory',
  'ContestResult',
  'ScoreEvent',
] as const;
export type TagType = (typeof TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: authRefreshQuery,
  tagTypes: [...TAG_TYPES],
  refetchOnReconnect: true,
  refetchOnFocus: false,
  endpoints: () => ({}),
});
