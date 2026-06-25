import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { ADMIN_ROLES, UserRole } from '@shared/enums';

import type { RootState } from '@store/store';

import { authStorage } from './auth.storage';
import type { AuthSuccessPayload, AuthUser } from './auth.types';

/**
 * Auth slice — single source of truth for "is the user signed in" + the
 * derived role checks the route guards consume.
 *
 * Persistence:
 *  - tokens + user are mirrored into `localStorage` so a page refresh
 *    rehydrates without a flicker,
 *  - `localStorage` only stores non-sensitive metadata; cookies own the
 *    refresh-token-as-cookie path used by web clients,
 *  - on logout we wipe both stores.
 */

export type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  /** Set when a refresh attempt fails — UI redirects to /login. */
  forceLogout: boolean;
}

const initialState: AuthState = (() => {
  const accessToken = authStorage.getAccessToken();
  const refreshToken = authStorage.getRefreshToken();
  const user = authStorage.getUser();
  const authed = !!accessToken && !!user;
  return {
    status: authed ? 'authenticated' : 'unauthenticated',
    user,
    accessToken,
    refreshToken,
    sessionId: null,
    forceLogout: false,
  };
})();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStarted(state) {
      state.status = 'authenticating';
      state.forceLogout = false;
    },
    authSucceeded(state, action: PayloadAction<AuthSuccessPayload>) {
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionId = action.payload.sessionId;
      state.forceLogout = false;
      authStorage.set({
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      });
    },
    tokensRefreshed(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      authStorage.setTokens(action.payload);
    },
    userUpdated(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      authStorage.setUser(action.payload);
    },
    loggedOut(state, action: PayloadAction<{ force?: boolean } | undefined>) {
      state.status = 'unauthenticated';
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionId = null;
      state.forceLogout = !!action.payload?.force;
      authStorage.clear();
    },
  },
});

export const { authStarted, authSucceeded, tokensRefreshed, userUpdated, loggedOut } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────
const selectAuth = (s: RootState): AuthState => s.auth;

export const selectAuthStatus = createSelector(selectAuth, (a) => a.status);
export const selectAuthUser = createSelector(selectAuth, (a) => a.user);
export const selectAccessToken = createSelector(selectAuth, (a) => a.accessToken);
export const selectRefreshToken = createSelector(selectAuth, (a) => a.refreshToken);
export const selectIsAuthenticated = createSelector(
  selectAuthStatus,
  selectAccessToken,
  (status, token) => status === 'authenticated' && !!token,
);
export const selectUserRoles = createSelector(
  selectAuthUser,
  (user): UserRole[] => (user?.roles ?? []) as UserRole[],
);
export const selectIsAdmin = createSelector(selectUserRoles, (roles) =>
  roles.some((r) => ADMIN_ROLES.includes(r)),
);

/** True if any of the caller's roles intersects the required set. */
export const selectHasRole = (required: UserRole | UserRole[]) =>
  createSelector(selectUserRoles, (roles) => {
    const wanted = Array.isArray(required) ? required : [required];
    return roles.some((r) => wanted.includes(r));
  });
