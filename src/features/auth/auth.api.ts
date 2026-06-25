import { baseApi } from '@store/api/base.api';

import type {
  AuthSuccessPayload,
  AuthTokens,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshRequest,
  RequestOtpRequest,
  ResetPasswordRequest,
  SessionSummary,
  SignupRequest,
  VerifyEmailRequest,
  VerifyOtpRequest,
} from './auth.types';

/**
 * Auth RTK Query endpoints. We `injectEndpoints` into the shared `baseApi`
 * so every feature shares the same cache + refresh-token interceptor.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    signup: build.mutation<AuthSuccessPayload, SignupRequest>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      invalidatesTags: ['Me', 'Session'],
    }),

    login: build.mutation<AuthSuccessPayload, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Me', 'Session'],
    }),

    refresh: build.mutation<AuthTokens, RefreshRequest>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),

    logout: build.mutation<{ loggedOut: true; revoked?: number }, { allDevices?: boolean }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
      invalidatesTags: ['Me', 'Session'],
    }),

    requestOtp: build.mutation<{ accepted: true; expiresAt: string }, RequestOtpRequest>({
      query: (body) => ({ url: '/auth/otp/request', method: 'POST', body }),
    }),

    verifyOtp: build.mutation<{ verified: true }, VerifyOtpRequest>({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
    }),

    verifyEmail: build.mutation<{ user: AuthUser }, VerifyEmailRequest>({
      query: (body) => ({ url: '/auth/email/verify', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),

    forgotPassword: build.mutation<{ accepted: true }, ForgotPasswordRequest>({
      query: (body) => ({ url: '/auth/password/forgot', method: 'POST', body }),
    }),

    resetPassword: build.mutation<{ reset: true }, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/password/reset', method: 'POST', body }),
    }),

    changePassword: build.mutation<{ changed: true }, ChangePasswordRequest>({
      query: (body) => ({ url: '/auth/password/change', method: 'POST', body }),
    }),

    getMe: build.query<{ user: AuthUser }, void>({
      query: () => ({ url: '/users/me' }),
      providesTags: ['Me'],
    }),

    listMySessions: build.query<{ sessions: SessionSummary[] }, void>({
      query: () => ({ url: '/sessions/me' }),
      providesTags: ['Session'],
    }),

    revokeMySession: build.mutation<{ revoked: true }, { sessionId: string }>({
      query: ({ sessionId }) => ({ url: `/sessions/me/${sessionId}`, method: 'DELETE' }),
      invalidatesTags: ['Session'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignupMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useListMySessionsQuery,
  useRevokeMySessionMutation,
} = authApi;
