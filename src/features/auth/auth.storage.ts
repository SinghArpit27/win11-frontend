import { STORAGE_KEYS } from '@constants/app.constants';
import { localStore } from '@services/storage';

import type { AuthSuccessPayload, AuthUser } from './auth.types';

/**
 * Thin facade around `localStore` for auth state persistence.
 *
 * Why a facade?
 *  - keeps storage keys in one place,
 *  - makes it trivial to migrate to a more secure mechanism later
 *    (IndexedDB + Web Crypto, or HttpOnly cookie for refresh token).
 */
export const authStorage = {
  getAccessToken: (): string | null => localStore.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: (): string | null => localStore.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
  getUser: (): AuthUser | null => localStore.get<AuthUser>(STORAGE_KEYS.AUTH_USER),

  set(input: { accessToken: string; refreshToken: string; user: AuthUser }): void {
    localStore.set(STORAGE_KEYS.ACCESS_TOKEN, input.accessToken);
    localStore.set(STORAGE_KEYS.REFRESH_TOKEN, input.refreshToken);
    localStore.set(STORAGE_KEYS.AUTH_USER, input.user);
  },

  setTokens(input: { accessToken: string; refreshToken: string }): void {
    localStore.set(STORAGE_KEYS.ACCESS_TOKEN, input.accessToken);
    localStore.set(STORAGE_KEYS.REFRESH_TOKEN, input.refreshToken);
  },

  setUser(user: AuthUser): void {
    localStore.set(STORAGE_KEYS.AUTH_USER, user);
  },

  clear(): void {
    localStore.remove(STORAGE_KEYS.ACCESS_TOKEN);
    localStore.remove(STORAGE_KEYS.REFRESH_TOKEN);
    localStore.remove(STORAGE_KEYS.AUTH_USER);
    sessionStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
  },

  setPendingSignup(payload: AuthSuccessPayload): void {
    sessionStorage.setItem(STORAGE_KEYS.PENDING_SIGNUP, JSON.stringify(payload));
  },

  getPendingSignup(): AuthSuccessPayload | null {
    const raw = sessionStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSuccessPayload;
    } catch {
      return null;
    }
  },

  consumePendingSignup(): AuthSuccessPayload | null {
    const payload = authStorage.getPendingSignup();
    sessionStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
    return payload;
  },

  hasPendingSignup(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP) !== null;
  },
};
